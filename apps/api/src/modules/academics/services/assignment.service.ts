import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssignmentStatus, Prisma, SubmissionStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { AcademicContext } from '../academic.types';
import { AcademicServiceBase, boundedPage, institutionWhere, ok, okList } from '../academics.common';
import { AcademicsEvents, emitAudited } from '../academics.events';
import {
  CreateAssignmentDto,
  CreateSubmissionDto,
  GradeSubmissionDto,
  UpdateAssignmentDto,
} from '../dto/activity.dto';

@Injectable()
export class AssignmentService extends AcademicServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  // -------------------------------------------------------------- assignments
  async create(ctx: AcademicContext, dto: CreateAssignmentDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);
    await this.assertTenantSubject(tenantId, institutionId, dto.subjectId);
    await this.assertTenantClass(tenantId, institutionId, dto.classId);
    await this.assertTenantTerm(tenantId, institutionId, dto.termId);
    this.assertAssignmentWindow(dto.submissionStart, dto.submissionEnd);

    const assignment = await this.prisma.assignment.create({
      data: {
        tenantId,
        institutionId,
        title: dto.title,
        description: dto.description,
        subjectId: dto.subjectId,
        classId: dto.classId,
        termId: dto.termId,
        submissionStart: new Date(dto.submissionStart),
        submissionEnd: new Date(dto.submissionEnd),
        maxScore: dto.maxScore,
        attachments: (dto.attachments ?? null) as Prisma.InputJsonValue | undefined,
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.AssignmentCreated, {
      tenantId,
      institutionId,
      entityType: 'assignment',
      entityId: assignment.id,
      actorId: ctx.userId,
      payload: { title: dto.title, classId: dto.classId, termId: dto.termId, subjectId: dto.subjectId },
    });
    return ok(assignment);
  }

  async list(
    ctx: AcademicContext,
    query: { classId?: string; termId?: string; subjectId?: string; page?: number; limit?: number },
  ) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const where: Prisma.AssignmentWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
      ...(query.classId ? { classId: query.classId } : {}),
      ...(query.termId ? { termId: query.termId } : {}),
      ...(query.subjectId ? { subjectId: query.subjectId } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.assignment.count({ where }),
      this.prisma.assignment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
        include: { subject: { select: { name: true, code: true } }, class: { select: { name: true } } },
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolve(tenantId: string, institutionId: string, id: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!assignment) {
      throw new NotFoundException(`assignment ${id} not found`);
    }
    return assignment;
  }

  async get(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { submissions: { orderBy: { submittedAt: 'desc' } } },
    });
    if (!assignment) {
      throw new NotFoundException(`assignment ${id} not found`);
    }
    return ok(assignment);
  }

  async update(ctx: AcademicContext, id: string, dto: UpdateAssignmentDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolve(tenantId, institutionId, id);
    if (dto.subjectId) await this.assertTenantSubject(tenantId, institutionId, dto.subjectId);
    if (dto.classId) await this.assertTenantClass(tenantId, institutionId, dto.classId);
    if (dto.termId) await this.assertTenantTerm(tenantId, institutionId, dto.termId);
    if (dto.submissionStart && dto.submissionEnd) {
      this.assertAssignmentWindow(dto.submissionStart, dto.submissionEnd);
    }
    const assignment = await this.prisma.assignment.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        submissionStart: dto.submissionStart ? new Date(dto.submissionStart) : undefined,
        submissionEnd: dto.submissionEnd ? new Date(dto.submissionEnd) : undefined,
        maxScore: dto.maxScore,
        attachments: (dto.attachments ?? null) as Prisma.InputJsonValue | undefined,
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.AssignmentUpdated, {
      tenantId,
      institutionId,
      entityType: 'assignment',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(assignment);
  }

  async publish(ctx: AcademicContext, id: string) {
    return this.transitionAssignment(ctx, id, AssignmentStatus.PUBLISHED, AcademicsEvents.AssignmentPublished);
  }

  async close(ctx: AcademicContext, id: string) {
    return this.transitionAssignment(ctx, id, AssignmentStatus.CLOSED, AcademicsEvents.AssignmentClosed);
  }

  private async transitionAssignment(ctx: AcademicContext, id: string, status: AssignmentStatus, event: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolve(tenantId, institutionId, id);
    if (status === AssignmentStatus.PUBLISHED && current.status !== AssignmentStatus.DRAFT) {
      throw new ConflictException('only a DRAFT assignment can be published');
    }
    if (status === AssignmentStatus.CLOSED && current.status === AssignmentStatus.CLOSED) {
      throw new ConflictException('assignment is already CLOSED');
    }
    const assignment = await this.prisma.assignment.update({
      where: { id },
      data: { status, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, event as never, {
      tenantId,
      institutionId,
      entityType: 'assignment',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: status },
    });
    return ok(assignment);
  }

  async delete(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolve(tenantId, institutionId, id);
    const assignment = await this.prisma.assignment.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.AssignmentDeleted, {
      tenantId,
      institutionId,
      entityType: 'assignment',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(assignment);
  }

  // ------------------------------------------------------------- submissions
  async submit(ctx: AcademicContext, assignmentId: string, dto: CreateSubmissionDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const assignment = await this.resolve(tenantId, institutionId, assignmentId);
    if (assignment.status === AssignmentStatus.CLOSED) {
      throw new ConflictException('assignment is CLOSED; submissions no longer accepted');
    }
    const enrollment = await this.prisma.studentClassEnrollment.findFirst({
      where: { id: dto.studentClassEnrollmentId, tenantId, institutionId, deletedAt: null },
    });
    if (!enrollment) {
      throw new NotFoundException(`enrollment ${dto.studentClassEnrollmentId} not found`);
    }
    if (enrollment.classId !== assignment.classId) {
      throw new BadRequestException('enrollment does not belong to the assignment class');
    }

    const existing = await this.prisma.assignmentSubmission.findFirst({
      where: { tenantId, assignmentId, studentClassEnrollmentId: dto.studentClassEnrollmentId },
    });
    if (existing) {
      throw new ConflictException('student already submitted for this assignment');
    }
    const submission = await this.prisma.assignmentSubmission.create({
      data: {
        tenantId,
        institutionId,
        assignmentId,
        studentClassEnrollmentId: dto.studentClassEnrollmentId,
        submittedAt: new Date(),
        content: dto.content,
        attachments: (dto.attachments ?? null) as Prisma.InputJsonValue | undefined,
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SubmissionSubmitted, {
      tenantId,
      institutionId,
      entityType: 'assignmentSubmission',
      entityId: submission.id,
      actorId: ctx.userId,
      payload: { assignmentId },
    });
    return ok(submission);
  }

  async gradeSubmission(ctx: AcademicContext, submissionId: string, dto: GradeSubmissionDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const submission = await this.prisma.assignmentSubmission.findFirst({
      where: { id: submissionId, tenantId, deletedAt: null },
    });
    if (!submission) {
      throw new NotFoundException(`submission ${submissionId} not found`);
    }
    const assignment = await this.resolve(tenantId, institutionId, submission.assignmentId);
    if (dto.score > Number(assignment.maxScore)) {
      throw new BadRequestException(
        `score exceeds the assignment maximum ${assignment.maxScore}`,
      );
    }

    const staffPersonId = ctx.personId ?? (await this.resolveStaffPersonId(tenantId, institutionId, ctx.userId));
    await this.assertTeachingAuthority(
      tenantId,
      institutionId,
      staffPersonId,
      assignment.subjectId,
      assignment.classId,
      assignment.termId,
    );

    const graded = await this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: dto.score,
        feedback: dto.feedback,
        gradedBy: ctx.userId,
        gradedAt: new Date(),
        status: SubmissionStatus.GRADED,
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SubmissionGraded, {
      tenantId,
      institutionId,
      entityType: 'assignmentSubmission',
      entityId: submissionId,
      actorId: ctx.userId,
      changes: { score: dto.score },
    });
    return ok(graded);
  }

  async listSubmissions(ctx: AcademicContext, assignmentId: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.AssignmentSubmissionWhereInput = {
      tenantId: ctx.tenantId,
      assignmentId,
      deletedAt: null,
    };
    const [total, items] = await Promise.all([
      this.prisma.assignmentSubmission.count({ where }),
      this.prisma.assignmentSubmission.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(items, total, p, l);
  }

  private assertAssignmentWindow(start: string, end: string) {
    const startD = new Date(start);
    const endD = new Date(end);
    if (startD >= endD) {
      throw new BadRequestException('submissionStart must precede submissionEnd');
    }
  }

  private async assertTenantSubject(tenantId: string, institutionId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({ where: { id, tenantId, institutionId, deletedAt: null } });
    if (!subject) throw new NotFoundException(`subject ${id} not found`);
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