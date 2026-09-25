import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssessmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { AcademicContext } from '../academic.types';
import { AcademicServiceBase, boundedPage, institutionWhere, ok, okList } from '../academics.common';
import { AcademicsEvents, emitAudited } from '../academics.events';
import {
  CreateAssessmentDto,
  RecordAssessmentResultDto,
  UpdateAssessmentDto,
} from '../dto/activity.dto';

@Injectable()
export class AssessmentService extends AcademicServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  async create(ctx: AcademicContext, dto: CreateAssessmentDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);
    await this.assertTenantSubject(tenantId, institutionId, dto.subjectId);
    await this.assertTenantTerm(tenantId, institutionId, dto.termId);

    const assessment = await this.prisma.assessment.create({
      data: {
        tenantId,
        institutionId,
        title: dto.title,
        assessmentType: dto.assessmentType,
        subjectId: dto.subjectId,
        termId: dto.termId,
        maxScore: dto.maxScore,
        weight: dto.weight,
        date: dto.date ? new Date(dto.date) : null,
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.AssessmentCreated, {
      tenantId,
      institutionId,
      entityType: 'assessment',
      entityId: assessment.id,
      actorId: ctx.userId,
      payload: { title: dto.title, subjectId: dto.subjectId, termId: dto.termId, assessmentType: dto.assessmentType },
    });
    return ok(assessment);
  }

  async list(
    ctx: AcademicContext,
    query: { subjectId?: string; termId?: string; assessmentType?: string; page?: number; limit?: number },
  ) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const where: Prisma.AssessmentWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
      ...(query.subjectId ? { subjectId: query.subjectId } : {}),
      ...(query.termId ? { termId: query.termId } : {}),
      ...(query.assessmentType ? { assessmentType: query.assessmentType as never } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.assessment.count({ where }),
      this.prisma.assessment.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (p - 1) * l,
        take: l,
        include: { subject: { select: { name: true, code: true } } },
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolve(tenantId: string, institutionId: string, id: string) {
    const assessment = await this.prisma.assessment.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!assessment) {
      throw new NotFoundException(`assessment ${id} not found`);
    }
    return assessment;
  }

  async get(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    return ok(await this.resolve(ctx.tenantId, ctx.institutionId as string, id));
  }

  async update(ctx: AcademicContext, id: string, dto: UpdateAssessmentDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolve(tenantId, institutionId, id);
    if (current.status !== AssessmentStatus.DRAFT) {
      throw new ConflictException('only DRAFT assessments can be edited');
    }
    if (dto.subjectId) await this.assertTenantSubject(tenantId, institutionId, dto.subjectId);
    if (dto.termId) await this.assertTenantTerm(tenantId, institutionId, dto.termId);
    const assessment = await this.prisma.assessment.update({
      where: { id },
      data: {
        title: dto.title,
        assessmentType: dto.assessmentType,
        maxScore: dto.maxScore,
        weight: dto.weight,
        date: dto.date ? new Date(dto.date) : undefined,
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.AssessmentUpdated, {
      tenantId,
      institutionId,
      entityType: 'assessment',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(assessment);
  }

  async publish(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolve(tenantId, institutionId, id);
    if (current.status !== AssessmentStatus.DRAFT) {
      throw new ConflictException('only a DRAFT assessment can be published');
    }
    const assessment = await this.prisma.assessment.update({
      where: { id },
      data: { status: AssessmentStatus.PUBLISHED, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.AssessmentPublished, {
      tenantId,
      institutionId,
      entityType: 'assessment',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: AssessmentStatus.PUBLISHED },
    });
    return ok(assessment);
  }

  async delete(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolve(tenantId, institutionId, id);
    const results = await this.prisma.assessmentResult.count({ where: { assessmentId: id, tenantId } });
    if (results > 0) {
      throw new ConflictException(`assessment ${id} has ${results} recorded result(s)`);
    }
    const assessment = await this.prisma.assessment.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.AssessmentDeleted, {
      tenantId,
      institutionId,
      entityType: 'assessment',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(assessment);
  }

  // ------------------------------------------------------------ results (raw)
  async recordResult(ctx: AcademicContext, assessmentId: string, dto: RecordAssessmentResultDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const assessment = await this.resolve(tenantId, institutionId, assessmentId);
    const enrollment = await this.prisma.studentClassEnrollment.findFirst({
      where: { id: dto.studentClassEnrollmentId, tenantId, institutionId, deletedAt: null },
    });
    if (!enrollment) {
      throw new NotFoundException(`enrollment ${dto.studentClassEnrollmentId} not found`);
    }
    if (dto.score > Number(assessment.maxScore)) {
      throw new BadRequestException(`score exceeds the assessment maximum ${assessment.maxScore}`);
    }

    const staffPersonId = ctx.personId ?? (await this.resolveStaffPersonId(tenantId, institutionId, ctx.userId));
    await this.assertTeachingAuthority(
      tenantId,
      institutionId,
      staffPersonId,
      assessment.subjectId,
      enrollment.classId,
      assessment.termId,
    );

    const result = await this.prisma.assessmentResult.upsert({
      where: {
        tenantId_assessmentId_studentClassEnrollmentId: {
          tenantId,
          assessmentId,
          studentClassEnrollmentId: dto.studentClassEnrollmentId,
        },
      },
      create: {
        tenantId,
        institutionId,
        assessmentId,
        studentClassEnrollmentId: dto.studentClassEnrollmentId,
        score: dto.score,
        notes: dto.notes,
        gradedBy: ctx.userId,
        gradedAt: new Date(),
        createdBy: ctx.userId,
      },
      update: {
        score: dto.score,
        notes: dto.notes,
        gradedBy: ctx.userId,
        gradedAt: new Date(),
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.AssessmentResultRecorded, {
      tenantId,
      institutionId,
      entityType: 'assessmentResult',
      entityId: result.id,
      actorId: ctx.userId,
      changes: { assessmentId, score: dto.score },
    });
    return ok(result);
  }

  async listResults(ctx: AcademicContext, assessmentId: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.AssessmentResultWhereInput = {
      tenantId: ctx.tenantId,
      assessmentId,
      deletedAt: null,
    };
    const [total, items] = await Promise.all([
      this.prisma.assessmentResult.count({ where }),
      this.prisma.assessmentResult.findMany({
        where,
        orderBy: { gradedAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async assertTenantSubject(tenantId: string, institutionId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({ where: { id, tenantId, institutionId, deletedAt: null } });
    if (!subject) throw new NotFoundException(`subject ${id} not found`);
  }

  private async assertTenantTerm(tenantId: string, institutionId: string, id: string) {
    const term = await this.prisma.term.findFirst({ where: { id, tenantId, institutionId, deletedAt: null } });
    if (!term) throw new NotFoundException(`term ${id} not found`);
  }
}