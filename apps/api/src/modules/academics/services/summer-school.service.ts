import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SummerSchoolStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { AcademicContext } from '../academic.types';
import { AcademicServiceBase, boundedPage, institutionWhere, ok, okList } from '../academics.common';
import { AcademicsEvents, emitAudited } from '../academics.events';
import {
  CreateSummerSchoolDto,
  RecordSummerSchoolResultDto,
  RegisterForSummerSchoolDto,
  StageSummerSchoolDto,
  UpdateSummerSchoolDto,
} from '../dto/academic-admin.dto';

@Injectable()
export class SummerSchoolService extends AcademicServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  async createSession(ctx: AcademicContext, dto: CreateSummerSchoolDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);
    await this.assertTenantTerm(tenantId, institutionId, dto.termId);
    await this.assertDateRange(new Date(dto.registrationStart), new Date(dto.registrationEnd));
    await this.assertDateRange(new Date(dto.startDate), new Date(dto.endDate));
    if (dto.examStartDate && dto.examEndDate) {
      await this.assertDateRange(new Date(dto.examStartDate), new Date(dto.examEndDate));
    }
    const existing = await this.prisma.summerSchoolSession.findFirst({
      where: { tenantId, institutionId, termId: dto.termId, name: dto.name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`summer school session "${dto.name}" already exists for this term`);
    }
    const session = await this.prisma.summerSchoolSession.create({
      data: {
        tenantId,
        institutionId,
        termId: dto.termId,
        name: dto.name,
        registrationStart: new Date(dto.registrationStart),
        registrationEnd: new Date(dto.registrationEnd),
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        examStartDate: dto.examStartDate ? new Date(dto.examStartDate) : null,
        examEndDate: dto.examEndDate ? new Date(dto.examEndDate) : null,
        costModel: dto.costModel,
        costAmount: dto.costAmount ?? null,
        maxGrade: dto.maxGrade,
        eligibleGrades: (dto.eligibleGrades ?? null) as Prisma.InputJsonValue | undefined,
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SummerSchoolSessionCreated, {
      tenantId,
      institutionId,
      entityType: 'summerSchoolSession',
      entityId: session.id,
      actorId: ctx.userId,
      payload: { termId: dto.termId, name: dto.name, costModel: dto.costModel },
    });
    return ok(session);
  }

  async listSessions(ctx: AcademicContext, termId?: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.SummerSchoolSessionWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
      ...(termId ? { termId } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.summerSchoolSession.count({ where }),
      this.prisma.summerSchoolSession.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolveSession(tenantId: string, institutionId: string, id: string) {
    const session = await this.prisma.summerSchoolSession.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!session) {
      throw new NotFoundException(`summer school session ${id} not found`);
    }
    return session;
  }

  async getSession(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveSession(tenantId, institutionId, id);
    const session = await this.prisma.summerSchoolSession.findFirst({
      where: { id, tenantId },
      include: {
        registrations: { where: { deletedAt: null }, include: { results: true } },
      },
    });
    return ok(session);
  }

  async updateSession(ctx: AcademicContext, id: string, dto: UpdateSummerSchoolDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveSession(tenantId, institutionId, id);
    if (current.status !== SummerSchoolStatus.CONFIGURED) {
      throw new ConflictException('only CONFIGURED sessions can be edited');
    }
    const session = await this.prisma.summerSchoolSession.update({
      where: { id },
      data: {
        name: dto.name,
        registrationStart: dto.registrationStart ? new Date(dto.registrationStart) : undefined,
        registrationEnd: dto.registrationEnd ? new Date(dto.registrationEnd) : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        examStartDate: dto.examStartDate ? new Date(dto.examStartDate) : undefined,
        examEndDate: dto.examEndDate ? new Date(dto.examEndDate) : undefined,
        costModel: dto.costModel,
        costAmount: dto.costAmount ?? undefined,
        maxGrade: dto.maxGrade,
        eligibleGrades: (dto.eligibleGrades ?? null) as Prisma.InputJsonValue | undefined,
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SummerSchoolSessionUpdated, {
      tenantId,
      institutionId,
      entityType: 'summerSchoolSession',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(session);
  }

  async stageSession(ctx: AcademicContext, id: string, dto: StageSummerSchoolDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveSession(tenantId, institutionId, id);
    const next =
      dto.open === false
        ? SummerSchoolStatus.REGISTRATION_CLOSED
        : dto.open === true
          ? SummerSchoolStatus.OPEN
          : current.status;
    if (current.status === SummerSchoolStatus.COMPLETED) {
      throw new ConflictException('completed sessions cannot be re-staged');
    }
    const session = await this.prisma.summerSchoolSession.update({
      where: { id },
      data: { status: next, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SummerSchoolSessionStaged, {
      tenantId,
      institutionId,
      entityType: 'summerSchoolSession',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: next },
    });
    return ok(session);
  }

  async deleteSession(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveSession(tenantId, institutionId, id);
    const registrations = await this.prisma.summerSchoolRegistration.count({
      where: { summerSchoolSessionId: id, tenantId, deletedAt: null },
    });
    if (registrations > 0) {
      throw new ConflictException(`session ${id} has ${registrations} registration(s)`);
    }
    const session = await this.prisma.summerSchoolSession.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SummerSchoolSessionDeleted, {
      tenantId,
      institutionId,
      entityType: 'summerSchoolSession',
      entityId: id,
      actorId: ctx.userId,
    });
    return ok(session);
  }

  // --------------------------------------------------------------- registrations
  async register(ctx: AcademicContext, sessionId: string, dto: RegisterForSummerSchoolDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const session = await this.resolveSession(tenantId, institutionId, sessionId);
    if (session.status === SummerSchoolStatus.CONFIGURED || session.status === SummerSchoolStatus.REGISTRATION_CLOSED) {
      throw new ConflictException(`session is ${session.status}; registration not open`);
    }
    await this.assertTenantStudent(tenantId, institutionId, dto.studentPersonId);
    const existing = await this.prisma.summerSchoolRegistration.findFirst({
      where: { tenantId, summerSchoolSessionId: sessionId, studentPersonId: dto.studentPersonId },
    });
    if (existing) {
      throw new ConflictException('student is already registered for this session');
    }
    const registration = await this.prisma.summerSchoolRegistration.create({
      data: {
        tenantId,
        institutionId,
        summerSchoolSessionId: sessionId,
        studentPersonId: dto.studentPersonId,
        paymentStatus: dto.paymentStatus,
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SummerSchoolRegistered, {
      tenantId,
      institutionId,
      entityType: 'summerSchoolRegistration',
      entityId: registration.id,
      actorId: ctx.userId,
      payload: { sessionId, studentPersonId: dto.studentPersonId },
    });
    return ok(registration);
  }

  async updateRegistration(ctx: AcademicContext, id: string, dto: RegisterForSummerSchoolDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const registration = await this.prisma.summerSchoolRegistration.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!registration) {
      throw new NotFoundException(`summer school registration ${id} not found`);
    }
    const updated = await this.prisma.summerSchoolRegistration.update({
      where: { id },
      data: { paymentStatus: dto.paymentStatus, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SummerSchoolRegistrationUpdated, {
      tenantId,
      institutionId: registration.institutionId,
      entityType: 'summerSchoolRegistration',
      entityId: id,
      actorId: ctx.userId,
      changes: { paymentStatus: dto.paymentStatus },
    });
    return ok(updated);
  }

  async listRegistrations(ctx: AcademicContext, sessionId: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.SummerSchoolRegistrationWhereInput = {
      tenantId: ctx.tenantId,
      summerSchoolSessionId: sessionId,
      deletedAt: null,
    };
    const [total, items] = await Promise.all([
      this.prisma.summerSchoolRegistration.count({ where }),
      this.prisma.summerSchoolRegistration.findMany({
        where,
        orderBy: { registeredAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(items, total, p, l);
  }

  // -------------------------------------------------------------------- results
  async recordResult(ctx: AcademicContext, registrationId: string, dto: RecordSummerSchoolResultDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const registration = await this.prisma.summerSchoolRegistration.findFirst({
      where: { id: registrationId, tenantId, deletedAt: null },
    });
    if (!registration) {
      throw new NotFoundException(`summer school registration ${registrationId} not found`);
    }
    await this.assertTenantSubject(tenantId, registration.institutionId, dto.subjectId);
    const result = await this.prisma.summerSchoolResult.upsert({
      where: {
        tenantId_summerSchoolRegistrationId_subjectId: {
          tenantId,
          summerSchoolRegistrationId: registrationId,
          subjectId: dto.subjectId,
        },
      },
      create: {
        tenantId,
        institutionId: registration.institutionId,
        summerSchoolRegistrationId: registrationId,
        subjectId: dto.subjectId,
        originalGrade: dto.originalGrade,
        newScore: dto.newScore ?? null,
        newGrade: null,
        createdBy: ctx.userId,
      },
      update: {
        originalGrade: dto.originalGrade,
        newScore: dto.newScore ?? null,
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SummerSchoolResultRecorded, {
      tenantId,
      institutionId: registration.institutionId,
      entityType: 'summerSchoolResult',
      entityId: result.id,
      actorId: ctx.userId,
      changes: { registrationId, subjectId: dto.subjectId, newScore: dto.newScore ?? null },
    });
    return ok(result);
  }

  async publishResults(ctx: AcademicContext, registrationId: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const registration = await this.prisma.summerSchoolRegistration.findFirst({
      where: { id: registrationId, tenantId, deletedAt: null },
    });
    if (!registration) {
      throw new NotFoundException(`summer school registration ${registrationId} not found`);
    }
    const updated = await this.prisma.summerSchoolResult.updateMany({
      where: { tenantId, summerSchoolRegistrationId: registrationId, newScore: { not: null } },
      data: { published: true, publishedAt: new Date() },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SummerSchoolResultPublished, {
      tenantId,
      institutionId: registration.institutionId,
      entityType: 'summerSchoolResult',
      entityId: registrationId,
      actorId: ctx.userId,
      changes: { published: updated.count },
    });
    return ok({ published: updated.count });
  }

  async listResults(ctx: AcademicContext, registrationId: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.SummerSchoolResultWhereInput = {
      tenantId: ctx.tenantId,
      summerSchoolRegistrationId: registrationId,
    };
    const [total, items] = await Promise.all([
      this.prisma.summerSchoolResult.count({ where }),
      this.prisma.summerSchoolResult.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: (p - 1) * l,
        take: l,
        include: { subject: { select: { name: true, code: true } } },
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async assertTenantTerm(tenantId: string, institutionId: string, id: string) {
    const term = await this.prisma.term.findFirst({ where: { id, tenantId, institutionId, deletedAt: null } });
    if (!term) throw new NotFoundException(`term ${id} not found`);
  }

  private async assertTenantStudent(tenantId: string, institutionId: string, studentPersonId: string) {
    const student = await this.prisma.student.findFirst({
      where: { tenantId, institutionId, personId: studentPersonId, status: 'ACTIVE' },
    });
    if (!student) throw new NotFoundException(`student ${studentPersonId} not found or not ACTIVE`);
  }

  private async assertTenantSubject(tenantId: string, institutionId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({ where: { id, tenantId, institutionId, deletedAt: null } });
    if (!subject) throw new NotFoundException(`subject ${id} not found`);
  }
}