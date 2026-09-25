import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReportCardStatus, ResultStatus, SubjectStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { AcademicContext } from '../academic.types';
import { AcademicServiceBase, ok, okList } from '../academics.common';
import { AcademicsEvents, emitAudited } from '../academics.events';
import { GradingService } from './grading.service';
import { CompileResultsDto, GenerateReportCardsDto } from '../dto/academic-admin.dto';

@Injectable()
export class ResultsService extends AcademicServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
    private readonly grading: GradingService,
  ) {
    super(prisma, publisher, audit);
  }

  private async resolveEnrollments(tenantId: string, institutionId: string, classId: string, termId: string) {
    return this.prisma.studentClassEnrollment.findMany({
      where: { tenantId, institutionId, classId, termId, deletedAt: null },
      orderBy: { studentPersonId: 'asc' },
    });
  }

  private async resolveScale(tenantId: string, institutionId: string) {
    return this.grading.resolveActiveScale(tenantId, institutionId);
  }

  private async compileOne(
    tenantId: string,
    institutionId: string,
    enrollmentId: string,
    subjectId: string,
    termId: string,
    scaleId: string,
  ) {
    const assessments = await this.prisma.assessment.findMany({
      where: { tenantId, subjectId, termId, deletedAt: null },
    });
    const assessmentIds = assessments.map((a) => a.id);
    const scored = assessmentIds.length
      ? await this.prisma.assessmentResult.findMany({
          where: { tenantId, assessmentId: { in: assessmentIds }, studentClassEnrollmentId: enrollmentId },
        })
      : [];
    const scoredByAssessment = new Map(scored.map((row) => [row.assessmentId, row]));

    let caScore = 0;
    let examScore = 0;
    for (const assessment of assessments) {
      const row = scoredByAssessment.get(assessment.id);
      if (!row) continue;
      const earned = Number(row.score);
      const max = Number(assessment.maxScore);
      const ratio = max > 0 ? Math.min(earned / max, 1) : 0;
      if (assessment.assessmentType === 'EXAMINATION') {
        examScore += earned;
      } else {
        caScore += ratio * Number(assessment.weight);
      }
    }
    const totalScore = Math.round((caScore + examScore) * 100) / 100;
    const resolved = await this.grading.resolveGrade(tenantId, institutionId, scaleId, totalScore);

    const existing = await this.prisma.result.findFirst({
      where: { tenantId, studentClassEnrollmentId: enrollmentId, subjectId, termId },
    });
    return this.prisma.result.upsert({
      where: {
        tenantId_studentClassEnrollmentId_subjectId_termId: {
          tenantId,
          studentClassEnrollmentId: enrollmentId,
          subjectId,
          termId,
        },
      },
      create: {
        tenantId,
        institutionId,
        studentClassEnrollmentId: enrollmentId,
        subjectId,
        termId,
        totalScore,
        caScore,
        examScore,
        grade: resolved.grade,
        remark: resolved.remark,
        gradeScaleId: scaleId,
        status: ResultStatus.COMPILED,
        versionNumber: 1,
        createdBy: null,
      },
      update: {
        totalScore,
        caScore,
        examScore,
        grade: resolved.grade,
        remark: resolved.remark,
        gradeScaleId: scaleId,
        status: ResultStatus.COMPILED,
        versionNumber: (existing?.versionNumber ?? 0) + 1,
        updatedBy: null,
      },
    });
  }

  /** P-12 compile: derive each enrollment's CA + exam + total and grade it. */
  async compile(ctx: AcademicContext, dto: CompileResultsDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const { classId, termId, subjectId } = dto;
    await this.assertTenantClass(tenantId, institutionId, classId);
    await this.assertTenantTerm(tenantId, institutionId, termId);
    await this.assertTenantSubject(tenantId, institutionId, subjectId);
    const scale = await this.resolveScale(tenantId, institutionId);

    const enrollments = await this.resolveEnrollments(tenantId, institutionId, classId, termId);
    const compiled = [];
    for (const enrollment of enrollments) {
      compiled.push(await this.compileOne(tenantId, institutionId, enrollment.id, subjectId, termId, scale.id));
    }
    await emitAudited(this.publisher, this.audit, AcademicsEvents.ResultCompiled, {
      tenantId,
      institutionId,
      entityType: 'result',
      entityId: subjectId,
      actorId: ctx.userId,
      changes: { classId, termId, subjectId, count: compiled.length, gradeScaleId: scale.id },
    });
    return ok({ classId, termId, subjectId, compiled: compiled.length });
  }

  async approve(ctx: AcademicContext, dto: CompileResultsDto) {
    return this.transitionResults(ctx, dto, ResultStatus.APPROVED, AcademicsEvents.ResultApproved);
  }

  async publish(ctx: AcademicContext, dto: CompileResultsDto) {
    this.assertInstitutionContext(ctx);
    const updated = await this.transitionResults(ctx, dto, ResultStatus.PUBLISHED, AcademicsEvents.ResultPublished);
    return ok(updated);
  }

  private async transitionResults(
    ctx: AcademicContext,
    dto: CompileResultsDto,
    next: ResultStatus,
    event: string,
  ) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const { classId, termId, subjectId } = dto;
    await this.assertTenantClass(tenantId, institutionId, classId);
    await this.assertTenantTerm(tenantId, institutionId, termId);
    await this.assertTenantSubject(tenantId, institutionId, subjectId);

    if (next === ResultStatus.APPROVED || next === ResultStatus.PUBLISHED) {
      const staffPersonId = ctx.personId ?? (await this.resolveStaffPersonId(tenantId, institutionId, ctx.userId));
      await this.assertTeachingAuthority(tenantId, institutionId, staffPersonId, subjectId, classId, termId);
    }

    const enrolments = await this.resolveEnrollments(tenantId, institutionId, classId, termId);
    const enrollmentIds = enrolments.map((e) => e.id);
    const rows = await this.prisma.result.findMany({
      where: { tenantId, studentClassEnrollmentId: { in: enrollmentIds }, subjectId },
      select: { id: true, status: true },
    });
    if (rows.length === 0) {
      throw new NotFoundException('no compiled results found for this class/subject/term');
    }
    if (next === ResultStatus.APPROVED) {
      const blocked = rows.filter((r) => r.status !== ResultStatus.COMPILED);
      if (blocked.length > 0) {
        throw new ConflictException(
          `${blocked.length} result(s) are not in COMPILED state; cannot approve`,
        );
      }
    }
    if (next === ResultStatus.PUBLISHED) {
      const blocked = rows.filter((r) => r.status !== ResultStatus.APPROVED);
      if (blocked.length > 0) {
        throw new ConflictException(
          `${blocked.length} result(s) are not APPROVED; cannot publish`,
        );
      }
    }
    await this.prisma.result.updateMany({
      where: { tenantId, subjectId, studentClassEnrollmentId: { in: enrollmentIds } },
      data: { status: next },
    });
    await emitAudited(this.publisher, this.audit, event as never, {
      tenantId,
      institutionId,
      entityType: 'result',
      entityId: subjectId,
      actorId: ctx.userId,
      changes: { classId, termId, subjectId, nextStatus: next, count: rows.length },
    });
    return { classId, termId, subjectId, transitioned: rows.length, status: next };
  }

  async list(ctx: AcademicContext, query: { classId?: string; termId?: string; subjectId?: string; enrollmentId?: string; status?: string; page?: number; limit?: number }) {
    this.assertInstitutionContext(ctx);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ResultWhereInput = {
      tenantId: ctx.tenantId,
      ...(query.subjectId ? { subjectId: query.subjectId } : {}),
      ...(query.enrollmentId ? { studentClassEnrollmentId: query.enrollmentId } : {}),
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.classId || query.termId
        ? { studentClassEnrollment: { ...(query.classId ? { classId: query.classId } : {}), ...(query.termId ? { termId: query.termId } : {}) } }
        : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.result.count({ where }),
      this.prisma.result.findMany({
        where,
        orderBy: [{ totalScore: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { subject: { select: { name: true, code: true } } },
      }),
    ]);
    return okList(items, total, page, limit);
  }

  // -------------------------------------------------------------- report cards
  async generateReportCards(ctx: AcademicContext, dto: GenerateReportCardsDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const { classId, termId } = dto;
    const enrollments = await this.resolveEnrollments(tenantId, institutionId, classId, termId);
    if (enrollments.length === 0) {
      throw new NotFoundException('no enrollments found for this class/term');
    }
    const resultsByEnrollment = new Map<string, Array<{ totalScore: number }>>();
    for (const enrollment of enrollments) {
      const rows = await this.prisma.result.findMany({
        where: { tenantId, studentClassEnrollmentId: enrollment.id, subject: { status: { not: SubjectStatus.INACTIVE } } },
        select: { totalScore: true },
      });
      resultsByEnrollment.set(
        enrollment.id,
        rows.map((r) => ({ totalScore: Number(r.totalScore) })),
      );
    }

    const computed = enrollments.map((enrollment) => {
      const rows = resultsByEnrollment.get(enrollment.id) ?? [];
      const total = rows.reduce((sum, row) => sum + Number(row.totalScore), 0);
      const average = rows.length > 0 ? Math.round((total / rows.length) * 100) / 100 : 0;
      return { enrollment, total, average };
    });
    const ranked = [...computed].sort((a, b) => b.average - a.average);
    const positionByEnrollment = new Map<string, number>();
    ranked.forEach((entry, index) => positionByEnrollment.set(entry.enrollment.id, index + 1));

    const generated = [];
    for (const entry of computed) {
      const card = await this.prisma.reportCard.upsert({
        where: {
          tenantId_studentClassEnrollmentId_termId: {
            tenantId,
            studentClassEnrollmentId: entry.enrollment.id,
            termId,
          },
        },
        create: {
          tenantId,
          institutionId,
          studentClassEnrollmentId: entry.enrollment.id,
          termId,
          averageScore: entry.average,
          position: positionByEnrollment.get(entry.enrollment.id),
          totalScore: entry.total,
          remarks: `Generated for term ${termId}`,
          generatedAt: new Date(),
          createdBy: ctx.userId,
        },
        update: {
          averageScore: entry.average,
          position: positionByEnrollment.get(entry.enrollment.id),
          totalScore: entry.total,
          remarks: `Re-generated for term ${termId}`,
          generatedAt: new Date(),
          updatedBy: ctx.userId,
        },
      });
      generated.push(card);
    }
    await emitAudited(this.publisher, this.audit, AcademicsEvents.ReportCardGenerated, {
      tenantId,
      institutionId,
      entityType: 'reportCard',
      entityId: classId,
      actorId: ctx.userId,
      changes: { classId, termId, count: generated.length },
    });
    return ok({ classId, termId, generated: generated.length });
  }

  async publishReportCards(ctx: AcademicContext, dto: GenerateReportCardsDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const { classId, termId } = dto;
    const enrollments = await this.resolveEnrollments(tenantId, institutionId, classId, termId);
    const updated = await this.prisma.reportCard.updateMany({
      where: { tenantId, studentClassEnrollmentId: { in: enrollments.map((e) => e.id) } },
      data: { status: ReportCardStatus.PUBLISHED, publishedAt: new Date() },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.ReportCardPublished, {
      tenantId,
      institutionId,
      entityType: 'reportCard',
      entityId: classId,
      actorId: ctx.userId,
      changes: { classId, termId, published: updated.count },
    });
    return ok({ classId, termId, published: updated.count });
  }

  private async assertTenantClass(tenantId: string, institutionId: string, id: string) {
    const clazz = await this.prisma.class.findFirst({ where: { id, tenantId, institutionId, deletedAt: null } });
    if (!clazz) throw new NotFoundException(`class ${id} not found`);
  }

  private async assertTenantTerm(tenantId: string, institutionId: string, id: string) {
    const term = await this.prisma.term.findFirst({ where: { id, tenantId, institutionId, deletedAt: null } });
    if (!term) throw new NotFoundException(`term ${id} not found`);
  }

  private async assertTenantSubject(tenantId: string, institutionId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({ where: { id, tenantId, institutionId, deletedAt: null } });
    if (!subject) throw new NotFoundException(`subject ${id} not found`);
  }
}