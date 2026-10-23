import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PolicyStatus, Prisma } from '@prisma/client';
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
import { FinanceEvents, emitFinanceEventAudited } from '../finance.events';
import {
  CreateFinancialPolicyDto,
  UpdateFinancialPolicyDto,
} from '../dto/policy.dto';

type FinancialPolicyRow = Prisma.FinancialPolicyGetPayload<Record<string, never>>;

/**
 * P6.2 — Financial policy service (frozen Finance §6.6 V-FP-01..04, §7.2
 * financial_policies, §5.6 FinancialPolicy: Draft -> Active -> Superseded,
 * §10.3 Financial Policies).
 *
 * `PUT /policies/:id` is "Update policy (new version)": an update never mutates a
 * version in place. It inserts the next version for the same
 * (policy_type, policy_key) and marks the previous ACTIVE version SUPERSEDED, so
 * the history endpoint can always reconstruct what was in force.
 *
 * §6.5 lists default values for the configurable policies (P-01..P-20). None are
 * seeded here: where an institution's Finance-owned defaults are stored is an
 * open D-3 question under ADR-036, so no default policy row is invented.
 */
@Injectable()
export class FinancialPolicyService extends FinanceServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  async createPolicy(ctx: FinanceContext, dto: CreateFinancialPolicyDto) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    await this.resolveInstitution(tenantId, institutionId);
    this.assertEffectiveWindow(dto.effectiveFrom, dto.effectiveTo);

    // V-FP-04 — the version is allocated by the service, never by the client.
    const latest = await this.prisma.financialPolicy.findFirst({
      where: {
        tenantId,
        institutionId,
        policyType: dto.policyType,
        policyKey: dto.policyKey,
      },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const nextVersion = (latest?.version ?? 0) + 1;
    const status = dto.status ?? PolicyStatus.DRAFT;

    // The supersede and the insert are one transaction: if the insert loses the
    // §7.2 unique (type, key, version) race, the old ACTIVE version must not be
    // left retired with nothing replacing it.
    const policy = await this.insertVersionAtomically({
      tenantId,
      institutionId,
      policyType: dto.policyType,
      policyKey: dto.policyKey,
      data: {
        value: dto.value as Prisma.InputJsonValue,
        description: dto.description,
        version: nextVersion,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
        status,
        createdBy: ctx.userId,
      },
      excludeId: null,
    });

    await emitFinanceEventAudited(
      this.publisher,
      this.audit,
      FinanceEvents.FinancialPolicyCreated,
      {
        tenantId,
        institutionId,
        entityType: 'financialPolicy',
        entityId: policy.id,
        actorId: ctx.userId,
        payload: {
          policyType: policy.policyType,
          policyKey: policy.policyKey,
          version: policy.version,
        },
        changes: {
          policyType: policy.policyType,
          policyKey: policy.policyKey,
          version: policy.version,
          status: policy.status,
        },
      },
    );

    return ok(policy);
  }

  async listPolicies(
    ctx: FinanceContext,
    query: { page?: number; limit?: number; policyType?: string; policyKey?: string; status?: PolicyStatus },
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const where = this.buildWhere(ctx.tenantId, institutionId, query);
    const [total, rows] = await Promise.all([
      this.prisma.financialPolicy.count({ where }),
      this.prisma.financialPolicy.findMany({
        where,
        orderBy: [{ policyType: 'asc' }, { policyKey: 'asc' }, { version: 'desc' }],
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(rows, total, p, l);
  }

  async getPolicy(ctx: FinanceContext, id: string) {
    const institutionId = this.assertInstitutionContext(ctx);
    const policy = await this.resolvePolicy(ctx.tenantId, institutionId, id);
    return ok(policy);
  }

  private async resolvePolicy(
    tenantId: string,
    institutionId: string,
    id: string,
  ): Promise<FinancialPolicyRow> {
    const policy = await this.prisma.financialPolicy.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!policy) {
      throw new NotFoundException(`financial policy ${id} not found`);
    }
    return policy;
  }

  /**
   * §10.3 "Update policy (new version)" / V-FP-04. The referenced version is
   * never edited: a new row is inserted with version + 1 and, when the new
   * version is ACTIVE, the referenced one becomes SUPERSEDED (§5.6).
   */
  async updatePolicy(
    ctx: FinanceContext,
    id: string,
    dto: UpdateFinancialPolicyDto,
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const existing = await this.resolvePolicy(tenantId, institutionId, id);
    this.assertEffectiveWindow(dto.effectiveFrom, dto.effectiveTo);

    if (existing.status === PolicyStatus.SUPERSEDED) {
      throw new ConflictException(
        `financial policy ${id} is superseded and can no longer be revised`,
      );
    }

    const nextVersion =
      (
        await this.prisma.financialPolicy.findFirst({
          where: {
            tenantId,
            institutionId,
            policyType: existing.policyType,
            policyKey: existing.policyKey,
          },
          orderBy: { version: 'desc' },
          select: { version: true },
        })
      )?.version ?? existing.version;
    const status = dto.status ?? PolicyStatus.ACTIVE;

    // Same transaction as createPolicy: the referenced version is only retired
    // once its replacement is guaranteed to land.
    const policy = await this.insertVersionAtomically({
      tenantId,
      institutionId,
      policyType: existing.policyType,
      policyKey: existing.policyKey,
      data: {
        value: dto.value as Prisma.InputJsonValue,
        description: dto.description ?? existing.description,
        version: nextVersion + 1,
        effectiveFrom: dto.effectiveFrom
          ? new Date(dto.effectiveFrom)
          : existing.effectiveFrom,
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : existing.effectiveTo,
        status,
        createdBy: ctx.userId,
      },
      // The referenced row stays ACTIVE when the new version is only a DRAFT;
      // superseding it early would retire the policy still in force.
      excludeId: status === PolicyStatus.ACTIVE ? id : null,
    });

    await emitFinanceEventAudited(
      this.publisher,
      this.audit,
      FinanceEvents.FinancialPolicyUpdated,
      {
        tenantId,
        institutionId,
        entityType: 'financialPolicy',
        entityId: policy.id,
        actorId: ctx.userId,
        payload: {
          policyType: policy.policyType,
          policyKey: policy.policyKey,
          version: policy.version,
          previousVersion: existing.version,
        },
        changes: {
          policyType: policy.policyType,
          policyKey: policy.policyKey,
          version: policy.version,
          previousVersion: existing.version,
          status: policy.status,
          previousStatus: existing.status,
        },
      },
    );

    return ok(policy);
  }

  /** §10.3 `GET /policies/history` — every version of a policy, newest first. */
  async listHistory(
    ctx: FinanceContext,
    query: { page?: number; limit?: number; policyType?: string; policyKey?: string },
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const where = this.buildWhere(ctx.tenantId, institutionId, query);
    const [total, rows] = await Promise.all([
      this.prisma.financialPolicy.count({ where }),
      this.prisma.financialPolicy.findMany({
        where,
        orderBy: [{ policyType: 'asc' }, { policyKey: 'asc' }, { version: 'desc' }],
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(rows, total, p, l);
  }

  private buildWhere(
    tenantId: string,
    institutionId: string,
    query: { policyType?: string; policyKey?: string; status?: PolicyStatus },
  ): Prisma.FinancialPolicyWhereInput {
    return {
      ...institutionWhere(tenantId, institutionId),
      deletedAt: null,
      ...(query.policyType ? { policyType: query.policyType } : {}),
      ...(query.policyKey ? { policyKey: query.policyKey } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
  }

  /**
   * Inserts a new version, retiring the previous ACTIVE one in the same
   * transaction.
   *
   * §5.6 allows at most one ACTIVE version per (policy_type, policy_key), and
   * §7.2 enforces uniqueness on (tenant, institution, type, key, version). Doing
   * the two writes separately would let a lost insert race leave the pair with no
   * ACTIVE version at all. A concurrent writer that wins the version race raises
   * P2002, which surfaces as 409 rather than a 500.
   */
  private async insertVersionAtomically(args: {
    tenantId: string;
    institutionId: string;
    policyType: string;
    policyKey: string;
    data: Omit<Prisma.FinancialPolicyUncheckedCreateInput, 'tenantId' | 'institutionId' | 'policyType' | 'policyKey'>;
    excludeId: string | null;
  }): Promise<FinancialPolicyRow> {
    const { tenantId, institutionId, policyType, policyKey, data, excludeId } = args;
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (data.status === PolicyStatus.ACTIVE) {
          await tx.financialPolicy.updateMany({
            where: {
              tenantId,
              institutionId,
              policyType,
              policyKey,
              status: PolicyStatus.ACTIVE,
              ...(excludeId ? { NOT: { id: excludeId } } : {}),
            },
            data: { status: PolicyStatus.SUPERSEDED },
          });
        }
        return tx.financialPolicy.create({
          data: { ...data, tenantId, institutionId, policyType, policyKey },
        });
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          `a concurrent write already created a version of policy ${policyKey}; retry the request`,
        );
      }
      throw error;
    }
  }

  private assertEffectiveWindow(effectiveFrom?: string, effectiveTo?: string): void {
    if (effectiveFrom && effectiveTo) {
      const from = new Date(effectiveFrom).getTime();
      const to = new Date(effectiveTo).getTime();
      if (to < from) {
        throw new BadRequestException('effectiveTo must not be before effectiveFrom');
      }
    }
  }
}
