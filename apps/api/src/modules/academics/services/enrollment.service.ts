import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { AcademicContext } from '../academic.types';
import { AcademicServiceBase, boundedPage, institutionWhere, ok, okList } from '../academics.common';
import { AcademicsEvents, emitAudited } from '../academics.events';
import {
  CreateEnrollmentDto,
  RegisterSubjectsDto,
  UpdateEnrollmentDto,
  UpdateRegistrationDto,
} from '../dto/activity.dto';

@Injectable()
export class EnrollmentService extends AcademicServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  async createEnrollment(ctx: AcademicContext, dto: CreateEnrollmentDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);
    await this.assertTenantStudent(tenantId, institutionId, dto.studentPersonId);
    await this.assertTenantClass(tenantId, institutionId, dto.classId);
    await this.assertTenantTerm(tenantId, institutionId, dto.termId);

    const existing = await this.prisma.studentClassEnrollment.findFirst({
      where: {
        tenantId,
        studentPersonId: dto.studentPersonId,
        classId: dto.classId,
        termId: dto.termId,
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException('student is already enrolled in this class/term');
    }
    const enrollment = await this.prisma.studentClassEnrollment.create({
      data: {
        tenantId,
        institutionId,
        studentPersonId: dto.studentPersonId,
        classId: dto.classId,
        termId: dto.termId,
        enrollmentDate: new Date(dto.enrollmentDate),
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.EnrollmentCreated, {
      tenantId,
      institutionId,
      entityType: 'studentClassEnrollment',
      entityId: enrollment.id,
      actorId: ctx.userId,
      payload: { studentPersonId: dto.studentPersonId, classId: dto.classId, termId: dto.termId },
    });
    return ok(enrollment);
  }

  async listEnrollments(
    ctx: AcademicContext,
    query: { studentPersonId?: string; classId?: string; termId?: string; status?: EnrollmentStatus; page?: number; limit?: number },
  ) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const where: Prisma.StudentClassEnrollmentWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
      ...(query.studentPersonId ? { studentPersonId: query.studentPersonId } : {}),
      ...(query.classId ? { classId: query.classId } : {}),
      ...(query.termId ? { termId: query.termId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.studentClassEnrollment.count({ where }),
      this.prisma.studentClassEnrollment.findMany({
        where,
        orderBy: { enrollmentDate: 'desc' },
        skip: (p - 1) * l,
        take: l,
        include: { class: { select: { name: true } }, term: { select: { name: true } } },
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolveEnrollment(tenantId: string, institutionId: string, id: string) {
    const enrollment = await this.prisma.studentClassEnrollment.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!enrollment) {
      throw new NotFoundException(`enrollment ${id} not found`);
    }
    return enrollment;
  }

  async getEnrollment(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveEnrollment(tenantId, institutionId, id);
    const enrollment = await this.prisma.studentClassEnrollment.findFirst({
      where: { id, tenantId },
      include: {
        class: { select: { name: true, gradeLevel: { select: { name: true } } } },
        term: { select: { name: true, session: { select: { name: true } } } },
        subjectRegistrations: { include: { subject: true } },
      },
    });
    return ok(enrollment);
  }

  async updateEnrollment(ctx: AcademicContext, id: string, dto: UpdateEnrollmentDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveEnrollment(tenantId, institutionId, id);
    const enrollment = await this.prisma.studentClassEnrollment.update({
      where: { id },
      data: {
        status: dto.status,
        classId: dto.classId,
        termId: dto.termId,
        enrollmentDate: dto.enrollmentDate ? new Date(dto.enrollmentDate) : undefined,
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.EnrollmentUpdated, {
      tenantId,
      institutionId,
      entityType: 'studentClassEnrollment',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: enrollment.status },
    });
    return ok(enrollment);
  }

  async withdrawEnrollment(ctx: AcademicContext, id: string) {
    return this.transitionEnrollment(ctx, id, EnrollmentStatus.WITHDRAWN, AcademicsEvents.EnrollmentWithdrawn);
  }

  async transferEnrollment(ctx: AcademicContext, id: string) {
    return this.transitionEnrollment(ctx, id, EnrollmentStatus.TRANSFERRED, AcademicsEvents.EnrollmentTransferred);
  }

  private async transitionEnrollment(
    ctx: AcademicContext,
    id: string,
    next: EnrollmentStatus,
    event: string,
  ) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveEnrollment(tenantId, institutionId, id);
    const enrollment = await this.prisma.studentClassEnrollment.update({
      where: { id },
      data: { status: next, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, event as never, {
      tenantId,
      institutionId,
      entityType: 'studentClassEnrollment',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: next },
    });
    return ok(enrollment);
  }

  async deleteEnrollment(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveEnrollment(tenantId, institutionId, id);
    const enrollment = await this.prisma.studentClassEnrollment.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId, status: EnrollmentStatus.WITHDRAWN },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.EnrollmentDeleted, {
      tenantId,
      institutionId,
      entityType: 'studentClassEnrollment',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(enrollment);
  }

  // ------------------------------------------------------ subject registration
  async registerSubjects(ctx: AcademicContext, enrollmentId: string, dto: RegisterSubjectsDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveEnrollment(tenantId, institutionId, enrollmentId);
    for (const subjectId of dto.subjectIds) {
      await this.assertTenantSubject(tenantId, institutionId, subjectId);
    }
    const existing = await this.prisma.subjectRegistration.findMany({
      where: { tenantId, studentClassEnrollmentId: enrollmentId, subjectId: { in: dto.subjectIds } },
      select: { subjectId: true },
    });
    const existingIds = new Set(existing.map((row) => row.subjectId));
    const fresh = dto.subjectIds.filter((id) => !existingIds.has(id));
    if (fresh.length > 0) {
      await this.prisma.subjectRegistration.createMany({
        data: fresh.map((subjectId) => ({
          tenantId,
          institutionId,
          studentClassEnrollmentId: enrollmentId,
          subjectId,
          createdBy: ctx.userId,
        })),
        skipDuplicates: true,
      });
    }
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SubjectRegistered, {
      tenantId,
      institutionId,
      entityType: 'studentClassEnrollment',
      entityId: enrollmentId,
      actorId: ctx.userId,
      changes: { added: fresh.length },
    });
    return ok({ registered: fresh.length });
  }

  async unregisterSubject(ctx: AcademicContext, enrollmentId: string, subjectId: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveEnrollment(tenantId, institutionId, enrollmentId);
    const deleted = await this.prisma.subjectRegistration.deleteMany({
      where: { tenantId, studentClassEnrollmentId: enrollmentId, subjectId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SubjectUnregistered, {
      tenantId,
      institutionId,
      entityType: 'studentClassEnrollment',
      entityId: enrollmentId,
      actorId: ctx.userId,
      changes: { subjectId, removed: deleted.count },
    });
    return ok({ removed: deleted.count });
  }

  async listSubjectRegistrations(ctx: AcademicContext, enrollmentId: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.SubjectRegistrationWhereInput = {
      tenantId: ctx.tenantId,
      studentClassEnrollmentId: enrollmentId,
      deletedAt: null,
    };
    const [total, items] = await Promise.all([
      this.prisma.subjectRegistration.count({ where }),
      this.prisma.subjectRegistration.findMany({
        where,
        orderBy: { registeredAt: 'asc' },
        skip: (p - 1) * l,
        take: l,
        include: { subject: true },
      }),
    ]);
    return okList(items, total, p, l);
  }

  async updateSubjectRegistration(ctx: AcademicContext, id: string, dto: UpdateRegistrationDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const registration = await this.prisma.subjectRegistration.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!registration) {
      throw new NotFoundException(`subject registration ${id} not found`);
    }
    const updated = await this.prisma.subjectRegistration.update({
      where: { id },
      data: { status: dto.status ?? registration.status, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SubjectRegistrationUpdated, {
      tenantId,
      institutionId: registration.institutionId,
      entityType: 'subjectRegistration',
      entityId: id,
      actorId: ctx.userId,
      changes: { status: updated.status },
    });
    return ok(updated);
  }

  private async assertTenantStudent(tenantId: string, institutionId: string, studentPersonId: string) {
    const student = await this.prisma.student.findFirst({
      where: { tenantId, institutionId, personId: studentPersonId, status: 'ACTIVE' },
    });
    if (!student) {
      throw new NotFoundException(`student ${studentPersonId} not found or not ACTIVE`);
    }
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