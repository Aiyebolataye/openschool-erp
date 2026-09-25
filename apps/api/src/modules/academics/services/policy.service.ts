import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PolicyStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { AcademicContext } from '../academic.types';
import { AcademicServiceBase, boundedPage, ok, okList } from '../academics.common';
import { AcademicsEvents, emitAudited } from '../academics.events';
import { CreatePolicyDto, UpdatePolicyDto } from '../dto/academic-admin.dto';

@Injectable()
export class PolicyService extends AcademicServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  async create(ctx: AcademicContext, dto: CreatePolicyDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);
    const latest = await this.prisma.academicPolicy.findFirst({
      where: { tenantId, institutionId, policyType: dto.policyType, policyKey: dto.policyKey, deletedAt: null },
      orderBy: { version: 'desc' },
    });
    const version = (latest?.version ?? 0) + 1;
    const policy = await this.prisma.academicPolicy.create({
      data: {
        tenantId,
        institutionId,
        policyType: dto.policyType,
        policyKey: dto.policyKey,
        value: dto.value as Prisma.InputJsonValue,
        description: dto.description,
        version,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.PolicyCreated, {
      tenantId,
      institutionId,
      entityType: 'academicPolicy',
      entityId: policy.id,
      actorId: ctx.userId,
      payload: { policyType: dto.policyType, policyKey: dto.policyKey, version },
    });
    return ok(policy);
  }

  /** Bumping a policy creates a new version and supersedes the prior ones. */
  async update(ctx: AcademicContext, id: string, dto: UpdatePolicyDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.prisma.academicPolicy.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!current) {
      throw new NotFoundException(`academic policy ${id} not found`);
    }
    if (current.version !== 1) {
      throw new ConflictException('only the base version of a policy can be bumped');
    }

    const latest = await this.prisma.academicPolicy.findFirst({
      where: { tenantId, institutionId, policyType: current.policyType, policyKey: current.policyKey, deletedAt: null },
      orderBy: { version: 'desc' },
    });
    const version = (latest?.version ?? 0) + 1;
    const policy = await this.prisma.academicPolicy.create({
      data: {
        tenantId,
        institutionId,
        policyType: dto.policyType ?? current.policyType,
        policyKey: dto.policyKey ?? current.policyKey,
        value: (dto.value ?? current.value) as Prisma.InputJsonValue,
        description: dto.description ?? current.description,
        version,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : current.effectiveFrom,
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : current.effectiveTo,
        status: PolicyStatus.DRAFT,
        createdBy: ctx.userId,
      },
    });
    await this.prisma.academicPolicy.updateMany({
      where: { tenantId, institutionId, policyType: current.policyType, policyKey: current.policyKey, status: { not: PolicyStatus.SUPERSEDED } },
      data: { status: PolicyStatus.SUPERSEDED },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.PolicyUpdated, {
      tenantId,
      institutionId,
      entityType: 'academicPolicy',
      entityId: policy.id,
      actorId: ctx.userId,
      payload: { policyType: policy.policyType, policyKey: policy.policyKey, version },
    });
    return ok(policy);
  }

  async list(
    ctx: AcademicContext,
    query: { policyType?: string; policyKey?: string; status?: string; page?: number; limit?: number },
  ) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const where: Prisma.AcademicPolicyWhereInput = {
      tenantId: ctx.tenantId,
      institutionId: ctx.institutionId,
      deletedAt: null,
      ...(query.policyType ? { policyType: query.policyType } : {}),
      ...(query.policyKey ? { policyKey: query.policyKey } : {}),
      ...(query.status ? { status: query.status as never } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.academicPolicy.count({ where }),
      this.prisma.academicPolicy.findMany({
        where,
        orderBy: [{ policyType: 'asc' }, { version: 'desc' }],
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(items, total, p, l);
  }

  async get(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const policy = await this.prisma.academicPolicy.findFirst({
      where: { id, tenantId: ctx.tenantId, institutionId: ctx.institutionId, deletedAt: null },
    });
    if (!policy) {
      throw new NotFoundException(`academic policy ${id} not found`);
    }
    return ok(policy);
  }

  async publish(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.prisma.academicPolicy.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!current) {
      throw new NotFoundException(`academic policy ${id} not found`);
    }
    if (current.status === PolicyStatus.ACTIVE) {
      throw new ConflictException('policy is already ACTIVE');
    }
    await this.prisma.academicPolicy.updateMany({
      where: { tenantId, institutionId, policyType: current.policyType, policyKey: current.policyKey, status: PolicyStatus.ACTIVE },
      data: { status: PolicyStatus.SUPERSEDED },
    });
    const policy = await this.prisma.academicPolicy.update({
      where: { id },
      data: { status: PolicyStatus.ACTIVE, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.PolicyPublished, {
      tenantId,
      institutionId,
      entityType: 'academicPolicy',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: PolicyStatus.ACTIVE },
    });
    return ok(policy);
  }

  async effective(ctx: AcademicContext, policyType: string, policyKey: string) {
    this.assertInstitutionContext(ctx);
    const today = new Date();
    const policy = await this.prisma.academicPolicy.findFirst({
      where: {
        tenantId: ctx.tenantId,
        institutionId: ctx.institutionId,
        policyType,
        policyKey,
        status: PolicyStatus.ACTIVE,
        deletedAt: null,
        effectiveFrom: { lte: today },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: today } }],
      },
      orderBy: { version: 'desc' },
    });
    return ok(policy ?? null);
  }

  async delete(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.prisma.academicPolicy.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!current) {
      throw new NotFoundException(`academic policy ${id} not found`);
    }
    const policy = await this.prisma.academicPolicy.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.PolicyDeleted, {
      tenantId,
      institutionId,
      entityType: 'academicPolicy',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(policy);
  }
}