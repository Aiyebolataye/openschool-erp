import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { AcademicContext } from '../academic.types';
import { AcademicServiceBase, boundedPage, institutionWhere, ok, okList } from '../academics.common';
import { AcademicsEvents, emitAudited } from '../academics.events';
import { EvaluateProgressionDto, UpdateProgressionDto } from '../dto/academic-admin.dto';

@Injectable()
export class ProgressionService extends AcademicServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  async evaluate(ctx: AcademicContext, dto: EvaluateProgressionDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);
    await this.assertTenantStudent(tenantId, institutionId, dto.studentPersonId);
    await this.assertTenantClass(tenantId, institutionId, dto.fromClassId);
    if (dto.toClassId) await this.assertTenantClass(tenantId, institutionId, dto.toClassId);
    await this.assertTenantTerm(tenantId, institutionId, dto.termId);
    if (dto.toClassId === dto.fromClassId) {
      throw new ConflictException('toClassId must differ from fromClassId');
    }

    const existing = await this.prisma.academicProgression.findFirst({
      where: { tenantId, studentPersonId: dto.studentPersonId, termId: dto.termId, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('a progression record already exists for this student/term');
    }
    const progression = await this.prisma.academicProgression.create({
      data: {
        tenantId,
        institutionId,
        studentPersonId: dto.studentPersonId,
        fromClassId: dto.fromClassId,
        toClassId: dto.toClassId ?? null,
        termId: dto.termId,
        progressionType: dto.progressionType,
        criteriaMet: (dto.criteriaMet ?? null) as Prisma.InputJsonValue | undefined,
        notes: dto.notes,
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.ProgressionEvaluated, {
      tenantId,
      institutionId,
      entityType: 'academicProgression',
      entityId: progression.id,
      actorId: ctx.userId,
      payload: {
        studentPersonId: dto.studentPersonId,
        progressionType: dto.progressionType,
        fromClassId: dto.fromClassId,
        toClassId: dto.toClassId ?? null,
      },
    });
    return ok(progression);
  }

  async list(
    ctx: AcademicContext,
    query: { studentPersonId?: string; termId?: string; progressionType?: string; page?: number; limit?: number },
  ) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const where: Prisma.AcademicProgressionWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
      ...(query.studentPersonId ? { studentPersonId: query.studentPersonId } : {}),
      ...(query.termId ? { termId: query.termId } : {}),
      ...(query.progressionType ? { progressionType: query.progressionType as never } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.academicProgression.count({ where }),
      this.prisma.academicProgression.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolve(tenantId: string, institutionId: string, id: string) {
    const progression = await this.prisma.academicProgression.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!progression) {
      throw new NotFoundException(`progression ${id} not found`);
    }
    return progression;
  }

  async get(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    return ok(await this.resolve(ctx.tenantId, ctx.institutionId as string, id));
  }

  async update(ctx: AcademicContext, id: string, dto: UpdateProgressionDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolve(tenantId, institutionId, id);
    if (dto.toClassId) await this.assertTenantClass(tenantId, institutionId, dto.toClassId);
    if (dto.fromClassId) await this.assertTenantClass(tenantId, institutionId, dto.fromClassId);
    const progression = await this.prisma.academicProgression.update({
      where: { id },
      data: {
        studentPersonId: dto.studentPersonId,
        fromClassId: dto.fromClassId,
        toClassId: dto.toClassId,
        termId: dto.termId,
        progressionType: dto.progressionType,
        criteriaMet: (dto.criteriaMet ?? null) as Prisma.InputJsonValue | undefined,
        notes: dto.notes,
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.ProgressionEvaluated, {
      tenantId,
      institutionId,
      entityType: 'academicProgression',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(progression);
  }

  async approve(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolve(tenantId, institutionId, id);
    if (current.approvedAt) {
      throw new ConflictException(`progression ${id} is already approved`);
    }
    const progression = await this.prisma.academicProgression.update({
      where: { id },
      data: { approvedBy: ctx.userId, approvedAt: new Date(), updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.ProgressionApproved, {
      tenantId,
      institutionId,
      entityType: 'academicProgression',
      entityId: id,
      actorId: ctx.userId,
      changes: { progressionType: current.progressionType },
    });
    return ok(progression);
  }

  async delete(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolve(tenantId, institutionId, id);
    const progression = await this.prisma.academicProgression.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.ProgressionDeleted, {
      tenantId,
      institutionId,
      entityType: 'academicProgression',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(progression);
  }

  private async assertTenantStudent(tenantId: string, institutionId: string, studentPersonId: string) {
    const student = await this.prisma.student.findFirst({
      where: { tenantId, institutionId, personId: studentPersonId, status: 'ACTIVE' },
    });
    if (!student) throw new NotFoundException(`student ${studentPersonId} not found or not ACTIVE`);
  }

  private async assertTenantClass(tenantId: string, institutionId: string, id: string) {
    const clazz = await this.prisma.class.findFirst({ where: { id, tenantId, institutionId, deletedAt: null } });
    if (!clazz) throw new NotFoundException(`class ${id} not found`);
  }

  private async assertTenantTerm(tenantId: string, institutionId: string, id: string) {
    const term = await this.prisma.term.findFirst({ where: { id, tenantId, institutionId, deletedAt: null } });
    if (!term) throw new NotFoundException(`term ${id} not found`);
  }
}