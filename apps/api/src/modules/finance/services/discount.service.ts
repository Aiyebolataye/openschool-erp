import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DiscountStatus, DiscountType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { FinanceContext } from '../finance.types';
import {
  FinanceServiceBase,
  boundedPage,
  institutionWhere,
  ok,
  okList,
} from '../finance.common';
import {
  FinanceEvents,
  emitFinanceEventAudited,
  recordFinanceAuditOnly,
} from '../finance.events';
import { decimalToString } from '../dto/fee.dto';
import {
  CreateDiscountDto,
  DISCOUNT_PERCENTAGE_MAX,
  UpdateDiscountDto,
} from '../dto/discount.dto';

type DiscountRow = Prisma.DiscountGetPayload<Record<string, never>>;

/**
 * P6.2 — Discount service (frozen Finance §6.6 V-DC-01..05, §5.6 Discount:
 * Draft -> Active -> Inactive, §5.7 BR-021/BR-022, §7.2 discounts, §10.3
 * Discounts).
 *
 * Definition management only. `POST /discounts/:id/apply` and
 * `DELETE /discounts/:id/apply/:applicationId` are NOT implemented: §7.2 scopes
 * `discount_applications` to an invoice, and the spec-conformant `invoices` table
 * is gated behind the Finance legacy-archival decision. Stacking limits
 * (P-11/P-12), eligibility evaluation and BR-021's "reduce invoice amounts" all
 * belong to that apply path, so none of them run here — a discount row is a
 * definition, not a charge.
 */
@Injectable()
export class DiscountService extends FinanceServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  /**
   * V-DC-03 — value is decimal > 0, and <= 100 when the type is PERCENTAGE.
   * Enforced here rather than by a decorator because the bound depends on
   * `discountType`, which is a sibling field on the same DTO.
   */
  private assertValue(discountType: DiscountType, value: number): void {
    if (value <= 0) {
      throw new BadRequestException('discount value must be greater than 0');
    }
    if (discountType === DiscountType.PERCENTAGE && value > DISCOUNT_PERCENTAGE_MAX) {
      throw new BadRequestException(
        `a percentage discount value must be ${DISCOUNT_PERCENTAGE_MAX} or less`,
      );
    }
  }

  /** §7.2 — applicable_session_ids holds cross-domain session UUIDs (§8.2). */
  private async assertSessions(
    tenantId: string,
    institutionId: string,
    sessionIds: string[] | undefined,
  ): Promise<void> {
    if (!sessionIds || sessionIds.length === 0) {
      return;
    }
    const unique = [...new Set(sessionIds)];
    const found = await this.prisma.academicSession.findMany({
      where: { id: { in: unique }, tenantId, institutionId },
      select: { id: true },
    });
    const foundIds = new Set(found.map((session) => session.id));
    const missing = unique.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new NotFoundException(
        `academic session(s) not found in institution ${institutionId}: ${missing.join(', ')}`,
      );
    }
  }

  private assertWindow(validFrom?: string, validTo?: string): void {
    if (validFrom && validTo) {
      const from = new Date(validFrom).getTime();
      const to = new Date(validTo).getTime();
      if (to < from) {
        throw new BadRequestException('validTo must not be before validFrom');
      }
    }
  }

  async createDiscount(ctx: FinanceContext, dto: CreateDiscountDto) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    await this.resolveInstitution(tenantId, institutionId);
    this.assertValue(dto.discountType, dto.value);
    this.assertWindow(dto.validFrom, dto.validTo);
    await this.assertSessions(tenantId, institutionId, dto.applicableSessionIds);

    const discount = await this.prisma.discount.create({
      data: {
        tenantId,
        institutionId,
        name: dto.name,
        discountType: dto.discountType,
        value: new Prisma.Decimal(dto.value),
        condition: dto.condition,
        maxApplications: dto.maxApplications,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validTo: dto.validTo ? new Date(dto.validTo) : null,
        applicableSessionIds: dto.applicableSessionIds
          ? (dto.applicableSessionIds as Prisma.InputJsonValue)
          : undefined,
        // §5.6 — a new discount starts DRAFT; activation is a separate decision.
        status: DiscountStatus.DRAFT,
        createdBy: ctx.userId,
      },
    });

    await emitFinanceEventAudited(
      this.publisher,
      this.audit,
      FinanceEvents.DiscountCreated,
      {
        tenantId,
        institutionId,
        entityType: 'discount',
        entityId: discount.id,
        actorId: ctx.userId,
        payload: {
          name: discount.name,
          discountType: discount.discountType,
          condition: discount.condition,
        },
        // §129 — the audit row of a financial record carries the amount.
        changes: {
          name: discount.name,
          discountType: discount.discountType,
          value: decimalToString(discount.value),
          condition: discount.condition,
          status: discount.status,
        },
      },
    );

    return ok(this.serialize(discount));
  }

  async listDiscounts(
    ctx: FinanceContext,
    query: { page?: number; limit?: number; status?: DiscountStatus; discountType?: DiscountType },
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const where: Prisma.DiscountWhereInput = {
      ...institutionWhere(ctx.tenantId, institutionId),
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.discountType ? { discountType: query.discountType } : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.discount.count({ where }),
      this.prisma.discount.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(rows.map((row) => this.serialize(row)), total, p, l);
  }

  async getDiscount(ctx: FinanceContext, id: string) {
    const institutionId = this.assertInstitutionContext(ctx);
    const discount = await this.resolveDiscount(ctx.tenantId, institutionId, id);
    return ok(this.serialize(discount));
  }

  private async resolveDiscount(
    tenantId: string,
    institutionId: string,
    id: string,
  ): Promise<DiscountRow> {
    const discount = await this.prisma.discount.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!discount) {
      throw new NotFoundException(`discount ${id} not found`);
    }
    return discount;
  }

  async updateDiscount(ctx: FinanceContext, id: string, dto: UpdateDiscountDto) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const existing = await this.resolveDiscount(tenantId, institutionId, id);

    if (dto.version !== undefined && dto.version !== existing.version) {
      throw new ConflictException(
        `discount ${id} version mismatch: expected ${dto.version}, current ${existing.version}`,
      );
    }

    const nextType = dto.discountType ?? existing.discountType;
    const nextValue = dto.value ?? Number(existing.value);
    this.assertValue(nextType, nextValue);
    this.assertWindow(dto.validFrom, dto.validTo);
    if (dto.applicableSessionIds) {
      await this.assertSessions(tenantId, institutionId, dto.applicableSessionIds);
    }

    const discount = await this.prisma.discount.update({
      where: { id },
      data: {
        name: dto.name,
        discountType: dto.discountType,
        value: dto.value === undefined ? undefined : new Prisma.Decimal(dto.value),
        condition: dto.condition,
        maxApplications: dto.maxApplications,
        validFrom: dto.validFrom === undefined ? undefined : new Date(dto.validFrom),
        validTo: dto.validTo === undefined ? undefined : new Date(dto.validTo),
        applicableSessionIds: dto.applicableSessionIds
          ? (dto.applicableSessionIds as Prisma.InputJsonValue)
          : undefined,
        status: dto.status,
        version: existing.version + 1,
        updatedBy: ctx.userId,
      },
    });

    // §5.8 declares DiscountCreated but no DiscountUpdated, so re-emitting
    // DiscountCreated here would tell every consumer a new discount exists.
    await recordFinanceAuditOnly(this.audit, 'discount.updated', {
      tenantId,
      institutionId,
      entityType: 'discount',
      entityId: discount.id,
      actorId: ctx.userId,
      changes: {
          name: discount.name,
          discountType: discount.discountType,
          value: decimalToString(discount.value),
          condition: discount.condition,
          status: discount.status,
          version: discount.version,
          previousVersion: existing.version,
        },
      },
    );

    return ok(this.serialize(discount));
  }

  private serialize(discount: DiscountRow) {
    return { ...discount, value: decimalToString(discount.value) };
  }
}
