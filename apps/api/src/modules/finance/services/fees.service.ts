import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FeeItemStatus, FeeScheduleStatus, Prisma } from '@prisma/client';
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
import { FinanceEvents, emitFinanceEventAudited, recordFinanceAuditOnly } from '../finance.events';
import {
  CreateFeeCategoryDto,
  CreateFeeItemDto,
  UpdateFeeCategoryDto,
  UpdateFeeItemDto,
  decimalToString,
} from '../dto/fee.dto';
import {
  AddFeeScheduleItemDto,
  CreateFeeScheduleDto,
  UpdateFeeScheduleDto,
} from '../dto/schedule.dto';

type FeeCategoryRow = Prisma.FeeCategoryGetPayload<Record<string, never>>;
type FeeItemRow = Prisma.FeeItemGetPayload<Record<string, never>>;
type FeeScheduleRow = Prisma.FeeScheduleGetPayload<{
  include: { items: { include: { feeItem: true } } };
}>;

/**
 * P6.1 — Finance fee structure service (frozen Finance §5.5, §5.7 BR-01/BR-030,
 * §6.6 V-FC-01..02 / V-FI-01..04, §7.2, §9.5, §10).
 *
 * Every read and write is tenant + institution scoped from the trusted JWT
 * context (BR-01). Fee items may only reference a fee category in the same
 * institution (V-FI-02, BR-030). Amounts are stored as declared decimal(14,2)
 * values; no arithmetic, rounding, currency conversion or billing calculation
 * happens in this slice (BR-04/BR-26 remain owned by the later billing slice).
 */
@Injectable()
export class FeeStructureService extends FinanceServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  // ------------------------------------------------------------- categories
  async createCategory(ctx: FinanceContext, dto: CreateFeeCategoryDto) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    await this.resolveInstitution(tenantId, institutionId);

    const existing = await this.prisma.feeCategory.findFirst({
      where: {
        tenantId,
        institutionId,
        name: dto.name,
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException(`fee category "${dto.name}" already exists`);
    }

    const category = await this.prisma.feeCategory.create({
      data: {
        tenantId,
        institutionId,
        name: dto.name,
        description: dto.description,
        createdBy: ctx.userId,
      },
    });

    await emitFinanceEventAudited(
      this.publisher,
      this.audit,
      FinanceEvents.FeeCategoryCreated,
      {
        tenantId,
        institutionId,
        entityType: 'feeCategory',
        entityId: category.id,
        actorId: ctx.userId,
        payload: { name: category.name },
        changes: { name: category.name, version: category.version },
      },
    );

    return ok(category);
  }

  async listCategories(ctx: FinanceContext, page?: number, limit?: number) {
    const institutionId = this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.FeeCategoryWhereInput = {
      ...institutionWhere(ctx.tenantId, institutionId),
      deletedAt: null,
    };
    const [total, items] = await Promise.all([
      this.prisma.feeCategory.count({ where }),
      this.prisma.feeCategory.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolveCategory(
    tenantId: string,
    institutionId: string,
    id: string,
  ): Promise<FeeCategoryRow> {
    const category = await this.prisma.feeCategory.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundException(`fee category ${id} not found`);
    }
    return category;
  }

  async updateCategory(
    ctx: FinanceContext,
    id: string,
    dto: UpdateFeeCategoryDto,
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const existing = await this.resolveCategory(tenantId, institutionId, id);

    if (dto.version !== undefined && dto.version !== existing.version) {
      throw new ConflictException(
        `fee category ${id} version mismatch: expected ${dto.version}, current ${existing.version}`,
      );
    }

    if (dto.name !== undefined && dto.name !== existing.name) {
      const duplicate = await this.prisma.feeCategory.findFirst({
        where: {
          tenantId,
          institutionId,
          name: dto.name,
          deletedAt: null,
          NOT: { id },
        },
      });
      if (duplicate) {
        throw new ConflictException(`fee category "${dto.name}" already exists`);
      }
    }

    const category = await this.prisma.feeCategory.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        version: existing.version + 1,
        updatedBy: ctx.userId,
      },
    });

    await emitFinanceEventAudited(
      this.publisher,
      this.audit,
      FinanceEvents.FeeCategoryUpdated,
      {
        tenantId,
        institutionId,
        entityType: 'feeCategory',
        entityId: category.id,
        actorId: ctx.userId,
        payload: { name: category.name },
        changes: {
          name: category.name,
          version: category.version,
          previousVersion: existing.version,
        },
      },
    );

    return ok(category);
  }

  // ------------------------------------------------------------------ items
  async createItem(ctx: FinanceContext, dto: CreateFeeItemDto) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    await this.resolveInstitution(tenantId, institutionId);
    await this.resolveCategory(tenantId, institutionId, dto.feeCategoryId);

    const amount = new Prisma.Decimal(dto.amount);
    const item = await this.prisma.feeItem.create({
      data: {
        tenantId,
        institutionId,
        feeCategoryId: dto.feeCategoryId,
        name: dto.name,
        amount,
        description: dto.description,
        status: FeeItemStatus.ACTIVE,
        createdBy: ctx.userId,
      },
    });

    await emitFinanceEventAudited(
      this.publisher,
      this.audit,
      FinanceEvents.FeeItemCreated,
      {
        tenantId,
        institutionId,
        entityType: 'feeItem',
        entityId: item.id,
        actorId: ctx.userId,
        payload: { name: item.name, feeCategoryId: item.feeCategoryId },
        // Finance §129 — financial audit rows carry the amount.
        changes: {
          name: item.name,
          feeCategoryId: item.feeCategoryId,
          amount: decimalToString(item.amount),
          status: item.status,
        },
      },
    );

    return ok(this.serializeItem(item));
  }

  async listItems(
    ctx: FinanceContext,
    page?: number,
    limit?: number,
    feeCategoryId?: string,
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.FeeItemWhereInput = {
      ...institutionWhere(ctx.tenantId, institutionId),
      deletedAt: null,
      ...(feeCategoryId ? { feeCategoryId } : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.feeItem.count({ where }),
      this.prisma.feeItem.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(rows.map((row) => this.serializeItem(row)), total, p, l);
  }

  private async resolveItem(
    tenantId: string,
    institutionId: string,
    id: string,
  ): Promise<FeeItemRow> {
    const item = await this.prisma.feeItem.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!item) {
      throw new NotFoundException(`fee item ${id} not found`);
    }
    return item;
  }

  async updateItem(ctx: FinanceContext, id: string, dto: UpdateFeeItemDto) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const existing = await this.resolveItem(tenantId, institutionId, id);

    if (dto.version !== undefined && dto.version !== existing.version) {
      throw new ConflictException(
        `fee item ${id} version mismatch: expected ${dto.version}, current ${existing.version}`,
      );
    }

    // V-FI-02 / BR-030 — a fee item may only be reassigned to a category that
    // exists in the same tenant + institution.
    if (
      dto.feeCategoryId !== undefined &&
      dto.feeCategoryId !== existing.feeCategoryId
    ) {
      await this.resolveCategory(tenantId, institutionId, dto.feeCategoryId);
    }

    const amount =
      dto.amount === undefined ? undefined : new Prisma.Decimal(dto.amount);

    const item = await this.prisma.feeItem.update({
      where: { id },
      data: {
        feeCategoryId: dto.feeCategoryId,
        name: dto.name,
        amount,
        description: dto.description,
        status: dto.status,
        version: existing.version + 1,
        updatedBy: ctx.userId,
      },
    });

    await emitFinanceEventAudited(
      this.publisher,
      this.audit,
      FinanceEvents.FeeItemUpdated,
      {
        tenantId,
        institutionId,
        entityType: 'feeItem',
        entityId: item.id,
        actorId: ctx.userId,
        payload: { name: item.name, feeCategoryId: item.feeCategoryId },
        changes: {
          name: item.name,
          feeCategoryId: item.feeCategoryId,
          amount: decimalToString(item.amount),
          status: item.status,
          version: item.version,
          previousVersion: existing.version,
        },
      },
    );

    return ok(this.serializeItem(item));
  }

  /**
   * Decimal(14,2) is serialized as a fixed 2-decimal string so monetary values
   * are never emitted as binary floating point.
   */
  private serializeItem(item: FeeItemRow) {
    return { ...item, amount: decimalToString(item.amount) };
  }

  // ------------------------------------------------------ schedules (P6.2)
  /**
   * V-FS-02 — the academic session is a cross-domain reference (§8.2), so it is
   * verified with an explicit lookup instead of a Prisma relation. Scoped to the
   * same tenant + institution: a session belonging to another institution is
   * treated as not found rather than silently accepted.
   */
  private async assertAcademicSession(
    tenantId: string,
    institutionId: string,
    academicSessionId: string,
  ): Promise<void> {
    const session = await this.prisma.academicSession.findFirst({
      where: { id: academicSessionId, tenantId, institutionId },
      select: { id: true },
    });
    if (!session) {
      throw new NotFoundException(
        `academic session ${academicSessionId} not found in institution ${institutionId}`,
      );
    }
  }

  private async assertFeeTemplate(
    tenantId: string,
    institutionId: string,
    feeTemplateId: string,
  ): Promise<void> {
    const template = await this.prisma.feeTemplate.findFirst({
      where: { id: feeTemplateId, tenantId, institutionId, deletedAt: null },
      select: { id: true },
    });
    if (!template) {
      throw new NotFoundException(
        `fee template ${feeTemplateId} not found in institution ${institutionId}`,
      );
    }
  }

  async createSchedule(ctx: FinanceContext, dto: CreateFeeScheduleDto) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    await this.resolveInstitution(tenantId, institutionId);
    await this.assertAcademicSession(tenantId, institutionId, dto.academicSessionId);
    if (dto.feeTemplateId) {
      await this.assertFeeTemplate(tenantId, institutionId, dto.feeTemplateId);
    }

    // §7.2 — UNIQUE (tenant_id, institution_id, academic_session_id, name).
    const duplicate = await this.prisma.feeSchedule.findFirst({
      where: {
        tenantId,
        institutionId,
        academicSessionId: dto.academicSessionId,
        name: dto.name,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new ConflictException(
        `fee schedule "${dto.name}" already exists for this academic session`,
      );
    }

    const schedule = await this.prisma.feeSchedule.create({
      data: {
        tenantId,
        institutionId,
        name: dto.name,
        academicSessionId: dto.academicSessionId,
        feeTemplateId: dto.feeTemplateId,
        // V-FS-03 — new schedules always start DRAFT; publication is its own
        // action (§10.3 POST /publish), never a field on create.
        status: FeeScheduleStatus.DRAFT,
        createdBy: ctx.userId,
      },
      include: { items: { include: { feeItem: true } } },
    });

    await emitFinanceEventAudited(
      this.publisher,
      this.audit,
      FinanceEvents.FeeScheduleCreated,
      {
        tenantId,
        institutionId,
        entityType: 'feeSchedule',
        entityId: schedule.id,
        actorId: ctx.userId,
        payload: { name: schedule.name, academicSessionId: schedule.academicSessionId },
        changes: {
          name: schedule.name,
          academicSessionId: schedule.academicSessionId,
          feeTemplateId: schedule.feeTemplateId,
          status: schedule.status,
          version: schedule.version,
        },
      },
    );

    return ok(this.serializeSchedule(schedule));
  }

  async listSchedules(
    ctx: FinanceContext,
    page?: number,
    limit?: number,
    status?: FeeScheduleStatus,
    academicSessionId?: string,
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.FeeScheduleWhereInput = {
      ...institutionWhere(ctx.tenantId, institutionId),
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(academicSessionId ? { academicSessionId } : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.feeSchedule.count({ where }),
      this.prisma.feeSchedule.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
        include: { items: { include: { feeItem: true } } },
      }),
    ]);
    return okList(rows.map((row) => this.serializeSchedule(row)), total, p, l);
  }

  async getSchedule(ctx: FinanceContext, id: string) {
    const institutionId = this.assertInstitutionContext(ctx);
    const schedule = await this.resolveSchedule(ctx.tenantId, institutionId, id);
    return ok(this.serializeSchedule(schedule));
  }

  private async resolveSchedule(
    tenantId: string,
    institutionId: string,
    id: string,
  ): Promise<FeeScheduleRow> {
    const schedule = await this.prisma.feeSchedule.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
      include: { items: { include: { feeItem: true } } },
    });
    if (!schedule) {
      throw new NotFoundException(`fee schedule ${id} not found`);
    }
    return schedule;
  }

  /**
   * §5.6 gives FeeSchedule exactly one transition, Draft -> Published, and §10.3
   * exposes no unpublish action. Once published, a schedule defines what students
   * are charged (BR-03, §9.8 step 3), so it is treated as immutable for update and
   * for item changes — the same "published record is immutable" guard the spec
   * states for invoices in I-05.
   */
  private assertScheduleMutable(schedule: FeeScheduleRow): void {
    if (schedule.status === FeeScheduleStatus.PUBLISHED) {
      throw new ConflictException(
        `fee schedule ${schedule.id} is published and cannot be modified`,
      );
    }
  }

  async updateSchedule(
    ctx: FinanceContext,
    id: string,
    dto: UpdateFeeScheduleDto,
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const existing = await this.resolveSchedule(tenantId, institutionId, id);
    this.assertScheduleMutable(existing);

    if (dto.version !== undefined && dto.version !== existing.version) {
      throw new ConflictException(
        `fee schedule ${id} version mismatch: expected ${dto.version}, current ${existing.version}`,
      );
    }

    if (
      dto.feeTemplateId !== undefined &&
      dto.feeTemplateId !== existing.feeTemplateId
    ) {
      await this.assertFeeTemplate(tenantId, institutionId, dto.feeTemplateId);
    }

    if (dto.name !== undefined && dto.name !== existing.name) {
      // §7.2 — the uniqueness key includes the session, and BR-29 fixes the
      // session at create time, so the check is always against the stored one.
      const duplicate = await this.prisma.feeSchedule.findFirst({
        where: {
          tenantId,
          institutionId,
          academicSessionId: existing.academicSessionId,
          name: dto.name,
          deletedAt: null,
          NOT: { id },
        },
        select: { id: true },
      });
      if (duplicate) {
        throw new ConflictException(
          `fee schedule "${dto.name}" already exists for this academic session`,
        );
      }
    }

    const schedule = await this.prisma.feeSchedule.update({
      where: { id },
      data: {
        name: dto.name,
        feeTemplateId: dto.feeTemplateId,
        version: existing.version + 1,
        updatedBy: ctx.userId,
      },
      include: { items: { include: { feeItem: true } } },
    });

    // §5.8 declares FeeScheduleCreated and FeeSchedulePublished only, so a
    // schedule update records an audit row rather than re-firing "created".
    await recordFinanceAuditOnly(this.audit, 'fee-schedule.updated', {
      tenantId,
      institutionId,
      entityType: 'feeSchedule',
      entityId: schedule.id,
      actorId: ctx.userId,
      changes: {
        name: schedule.name,
        academicSessionId: schedule.academicSessionId,
        feeTemplateId: schedule.feeTemplateId,
        version: schedule.version,
        previousVersion: existing.version,
      },
    });

    return ok(this.serializeSchedule(schedule));
  }

  /**
   * §5.6 / V-FS-03 — publication is the single forward transition. Re-publishing
   * an already published schedule is rejected rather than silently accepted, so
   * the transition stays observable.
   */
  async publishSchedule(ctx: FinanceContext, id: string) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const existing = await this.resolveSchedule(tenantId, institutionId, id);

    if (existing.status === FeeScheduleStatus.PUBLISHED) {
      throw new ConflictException(`fee schedule ${id} is already published`);
    }

    const schedule = await this.prisma.feeSchedule.update({
      where: { id },
      data: {
        status: FeeScheduleStatus.PUBLISHED,
        version: existing.version + 1,
        updatedBy: ctx.userId,
      },
      include: { items: { include: { feeItem: true } } },
    });

    await emitFinanceEventAudited(
      this.publisher,
      this.audit,
      FinanceEvents.FeeSchedulePublished,
      {
        tenantId,
        institutionId,
        entityType: 'feeSchedule',
        entityId: schedule.id,
        actorId: ctx.userId,
        payload: { name: schedule.name, itemCount: schedule.items.length },
        changes: {
          name: schedule.name,
          status: schedule.status,
          previousStatus: existing.status,
          version: schedule.version,
          previousVersion: existing.version,
        },
      },
    );

    return ok(this.serializeSchedule(schedule));
  }

  /**
   * I-23 / §6.6 — a schedule item must reference an existing, ACTIVE fee item in
   * the same institution, and §7.2 makes the amount a per-schedule override.
   */
  async addScheduleItem(
    ctx: FinanceContext,
    scheduleId: string,
    dto: AddFeeScheduleItemDto,
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const schedule = await this.resolveSchedule(tenantId, institutionId, scheduleId);
    this.assertScheduleMutable(schedule);

    const feeItem = await this.prisma.feeItem.findFirst({
      where: {
        id: dto.feeItemId,
        tenantId,
        institutionId,
        deletedAt: null,
        status: FeeItemStatus.ACTIVE,
      },
    });
    if (!feeItem) {
      throw new NotFoundException(
        `active fee item ${dto.feeItemId} not found in institution ${institutionId}`,
      );
    }

    // §7.2 — UNIQUE (tenant_id, fee_schedule_id, fee_item_id).
    const duplicate = await this.prisma.feeScheduleItem.findFirst({
      where: { tenantId, feeScheduleId: scheduleId, feeItemId: dto.feeItemId },
      select: { id: true, deletedAt: true },
    });
    if (duplicate && duplicate.deletedAt === null) {
      throw new ConflictException(
        `fee item ${dto.feeItemId} is already on schedule ${scheduleId}`,
      );
    }

    const amount = new Prisma.Decimal(dto.amount);
    const created =
      duplicate && duplicate.deletedAt !== null
        ? // Re-adding a previously removed item revives the existing row so the
          // §7.2 unique key (which has no deleted_at) is not violated.
          await this.prisma.feeScheduleItem.update({
            where: { id: duplicate.id },
            data: {
              amount,
              mandatory: dto.mandatory ?? true,
              deletedAt: null,
              deletedBy: null,
              version: { increment: 1 },
              updatedBy: ctx.userId,
            },
          })
        : await this.prisma.feeScheduleItem.create({
            data: {
              tenantId,
              institutionId,
              feeScheduleId: scheduleId,
              feeItemId: dto.feeItemId,
              amount,
              mandatory: dto.mandatory ?? true,
              createdBy: ctx.userId,
            },
          });

    await recordFinanceAuditOnly(this.audit, 'fee-schedule-item.added', {
      tenantId,
      institutionId,
      entityType: 'feeScheduleItem',
      entityId: created.id,
      actorId: ctx.userId,
      // §129 — the audit row of a financial record carries the amount.
      changes: {
        feeScheduleId: scheduleId,
        feeItemId: dto.feeItemId,
        amount: decimalToString(created.amount),
        mandatory: created.mandatory,
      },
    });

    return ok({ ...created, amount: decimalToString(created.amount) });
  }

  async removeScheduleItem(
    ctx: FinanceContext,
    scheduleId: string,
    itemId: string,
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const schedule = await this.resolveSchedule(tenantId, institutionId, scheduleId);
    this.assertScheduleMutable(schedule);

    const item = await this.prisma.feeScheduleItem.findFirst({
      where: { id: itemId, tenantId, institutionId, feeScheduleId: scheduleId, deletedAt: null },
    });
    if (!item) {
      throw new NotFoundException(
        `fee schedule item ${itemId} not found on schedule ${scheduleId}`,
      );
    }

    const removed = await this.prisma.feeScheduleItem.update({
      where: { id: itemId },
      data: { deletedAt: new Date(), deletedBy: ctx.userId, version: { increment: 1 } },
    });

    await recordFinanceAuditOnly(this.audit, 'fee-schedule-item.removed', {
      tenantId,
      institutionId,
      entityType: 'feeScheduleItem',
      entityId: itemId,
      actorId: ctx.userId,
      changes: {
        feeScheduleId: scheduleId,
        feeItemId: item.feeItemId,
        amount: decimalToString(item.amount),
        mandatory: item.mandatory,
      },
    });

    return ok({ ...removed, amount: decimalToString(removed.amount) });
  }

  private serializeSchedule(schedule: FeeScheduleRow) {
    return {
      ...schedule,
      items: schedule.items.map((item) => ({
        ...item,
        amount: decimalToString(item.amount),
        feeItem: item.feeItem
          ? { ...item.feeItem, amount: decimalToString(item.feeItem.amount) }
          : undefined,
      })),
    };
  }
}
