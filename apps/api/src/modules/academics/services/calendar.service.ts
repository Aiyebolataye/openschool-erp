import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AcademicYearStatus,
  SessionStatus,
  Term,
  TermStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { AcademicContext } from '../academic.types';
import { AcademicServiceBase, boundedPage, institutionWhere, ok, okList } from '../academics.common';
import { AcademicsEvents, emitAudited } from '../academics.events';
import {
  CreateAcademicYearDto,
  CreateSessionDto,
  CreateTermDto,
  UpdateAcademicYearDto,
  UpdateSessionDto,
  UpdateTermDto,
} from '../dto/calendar.dto';

const YEAR_ACTIVATE = new Set<AcademicYearStatus>([AcademicYearStatus.DRAFT, AcademicYearStatus.ACTIVE]);
const YEAR_CLOSE = new Set<AcademicYearStatus>([AcademicYearStatus.DRAFT, AcademicYearStatus.ACTIVE, AcademicYearStatus.CLOSED]);
const SESSION_ACTIVATE = new Set<SessionStatus>([SessionStatus.DRAFT, SessionStatus.ACTIVE]);
const SESSION_CLOSE = new Set<SessionStatus>([SessionStatus.DRAFT, SessionStatus.ACTIVE, SessionStatus.CLOSED]);
const TERM_ACTIVATE = new Set<TermStatus>([TermStatus.DRAFT, TermStatus.ACTIVE]);
const TERM_CLOSE = new Set<TermStatus>([TermStatus.DRAFT, TermStatus.ACTIVE, TermStatus.CLOSED]);

@Injectable()
export class CalendarService extends AcademicServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  // ------------------------------------------------------------------ years
  async createYear(ctx: AcademicContext, dto: CreateAcademicYearDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    await this.resolveInstitution(tenantId, institutionId);

    const existing = await this.prisma.academicYear.findFirst({
      where: { tenantId, institutionId, name: dto.name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`academic year "${dto.name}" already exists`);
    }
    await this.assertDateRange(new Date(dto.startDate), new Date(dto.endDate));

    const year = await this.prisma.academicYear.create({
      data: {
        tenantId,
        institutionId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.YearCreated, {
      tenantId,
      institutionId,
      entityType: 'academicYear',
      entityId: year.id,
      actorId: ctx.userId,
      payload: { name: year.name },
    });
    return ok(year);
  }

  async listYears(ctx: AcademicContext, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.AcademicYearWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      deletedAt: null,
    };
    const [total, items] = await Promise.all([
      this.prisma.academicYear.count({ where }),
      this.prisma.academicYear.findMany({
        where,
        orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolveYear(tenantId: string, institutionId: string, id: string) {
    const year = await this.prisma.academicYear.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!year) {
      throw new NotFoundException(`academic year ${id} not found`);
    }
    return year;
  }

  async getYear(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    return ok(await this.resolveYear(ctx.tenantId, ctx.institutionId as string, id));
  }

  async updateYear(ctx: AcademicContext, id: string, dto: UpdateAcademicYearDto) {
    this.assertInstitutionContext(ctx);
    const current = await this.resolveYear(ctx.tenantId, ctx.institutionId as string, id);
    const nextStart = dto.startDate ? new Date(dto.startDate) : current.startDate;
    const nextEnd = dto.endDate ? new Date(dto.endDate) : current.endDate;
    await this.assertDateRange(nextStart, nextEnd);

    if (dto.status && !YEAR_ACTIVATE.has(dto.status) && dto.status !== AcademicYearStatus.CLOSED) {
      throw new ConflictException(`invalid academic year status ${dto.status}`);
    }

    const year = await this.prisma.academicYear.update({
      where: { id },
      data: {
        name: dto.name,
        startDate: dto.startDate ? nextStart : undefined,
        endDate: dto.endDate ? nextEnd : undefined,
        ...(dto.status ? { status: dto.status } : {}),
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.YearUpdated, {
      tenantId: ctx.tenantId,
      institutionId: ctx.institutionId as string,
      entityType: 'academicYear',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: year.status },
    });
    return ok(year);
  }

  async activateYear(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveYear(tenantId, institutionId, id);
    if (!YEAR_ACTIVATE.has(current.status)) {
      throw new ConflictException(`cannot activate academic year ${id} from ${current.status}`);
    }

    await this.prisma.$transaction([
      this.prisma.academicYear.updateMany({
        where: { tenantId, institutionId, deletedAt: null, id: { not: id } },
        data: { isActive: false },
      }),
      this.prisma.academicYear.update({
        where: { id },
        data: { status: AcademicYearStatus.ACTIVE, isActive: true, updatedBy: ctx.userId },
      }),
    ]);

    const year = await this.resolveYear(tenantId, institutionId, id);
    await emitAudited(this.publisher, this.audit, AcademicsEvents.YearActivated, {
      tenantId,
      institutionId,
      entityType: 'academicYear',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: AcademicYearStatus.ACTIVE },
    });
    return ok(year);
  }

  async closeYear(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveYear(tenantId, institutionId, id);
    if (!YEAR_CLOSE.has(current.status)) {
      throw new ConflictException(`cannot close academic year ${id} from ${current.status}`);
    }
    const year = await this.prisma.academicYear.update({
      where: { id },
      data: { status: AcademicYearStatus.CLOSED, isActive: false, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.YearClosed, {
      tenantId,
      institutionId,
      entityType: 'academicYear',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: AcademicYearStatus.CLOSED },
    });
    return ok(year);
  }

  async deleteYear(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveYear(tenantId, institutionId, id);

    const sessions = await this.prisma.academicSession.count({
      where: { academicYearId: id, tenantId, deletedAt: null },
    });
    if (sessions > 0) {
      throw new ConflictException(`academic year ${id} has ${sessions} session(s); archive or delete them first`);
    }

    const year = await this.prisma.academicYear.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId, isActive: false },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.YearDeleted, {
      tenantId,
      institutionId,
      entityType: 'academicYear',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status },
    });
    return ok(year);
  }

  // ---------------------------------------------------------------- sessions
  async createSession(ctx: AcademicContext, yearId: string, dto: CreateSessionDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const year = await this.resolveYear(tenantId, institutionId, yearId);
    if (year.status === AcademicYearStatus.CLOSED) {
      throw new ConflictException('cannot add session to a closed academic year');
    }

    const existing = await this.prisma.academicSession.findFirst({
      where: { tenantId, institutionId, academicYearId: yearId, name: dto.name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`session "${dto.name}" already exists in year ${year.name}`);
    }
    await this.assertDateRange(new Date(dto.startDate), new Date(dto.endDate));

    const session = await this.prisma.academicSession.create({
      data: {
        tenantId,
        institutionId,
        academicYearId: yearId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SessionCreated, {
      tenantId,
      institutionId,
      entityType: 'academicSession',
      entityId: session.id,
      actorId: ctx.userId,
      payload: { name: session.name, yearId },
    });
    return ok(session);
  }

  async listSessions(ctx: AcademicContext, yearId: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.AcademicSessionWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      academicYearId: yearId,
      deletedAt: null,
    };
    const [total, items] = await Promise.all([
      this.prisma.academicSession.count({ where }),
      this.prisma.academicSession.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolveSession(tenantId: string, institutionId: string, id: string) {
    const session = await this.prisma.academicSession.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!session) {
      throw new NotFoundException(`academic session ${id} not found`);
    }
    return session;
  }

  async getSession(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    return ok(await this.resolveSession(ctx.tenantId, ctx.institutionId as string, id));
  }

  async updateSession(ctx: AcademicContext, id: string, dto: UpdateSessionDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveSession(tenantId, institutionId, id);
    const nextStart = dto.startDate ? new Date(dto.startDate) : current.startDate;
    const nextEnd = dto.endDate ? new Date(dto.endDate) : current.endDate;
    await this.assertDateRange(nextStart, nextEnd);

    const session = await this.prisma.academicSession.update({
      where: { id },
      data: {
        name: dto.name,
        startDate: dto.startDate ? nextStart : undefined,
        endDate: dto.endDate ? nextEnd : undefined,
        ...(dto.status ? { status: dto.status } : {}),
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SessionUpdated, {
      tenantId,
      institutionId,
      entityType: 'academicSession',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: session.status },
    });
    return ok(session);
  }

  async activateSession(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveSession(tenantId, institutionId, id);
    const year = await this.prisma.academicYear.findFirst({
      where: { id: current.academicYearId, tenantId, deletedAt: null },
    });
    if (!year) {
      throw new NotFoundException(`session ${id} references a missing academic year`);
    }
    if (year.status !== AcademicYearStatus.ACTIVE) {
      throw new ConflictException('only sessions under an ACTIVE academic year can be activated');
    }
    if (!SESSION_ACTIVATE.has(current.status)) {
      throw new ConflictException(`cannot activate session ${id} from ${current.status}`);
    }

    const session = await this.prisma.academicSession.update({
      where: { id },
      data: { status: SessionStatus.ACTIVE, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SessionActivated, {
      tenantId,
      institutionId,
      entityType: 'academicSession',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: SessionStatus.ACTIVE },
    });
    return ok(session);
  }

  async closeSession(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveSession(tenantId, institutionId, id);
    if (!SESSION_CLOSE.has(current.status)) {
      throw new ConflictException(`cannot close session ${id} from ${current.status}`);
    }
    const session = await this.prisma.academicSession.update({
      where: { id },
      data: { status: SessionStatus.CLOSED, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SessionClosed, {
      tenantId,
      institutionId,
      entityType: 'academicSession',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: SessionStatus.CLOSED },
    });
    return ok(session);
  }

  async deleteSession(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveSession(tenantId, institutionId, id);
    const terms = await this.prisma.term.count({
      where: { academicSessionId: id, tenantId, deletedAt: null },
    });
    if (terms > 0) {
      throw new ConflictException(`session ${id} has ${terms} term(s); archive or delete them first`);
    }
    const session = await this.prisma.academicSession.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.SessionDeleted, {
      tenantId,
      institutionId,
      entityType: 'academicSession',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status },
    });
    return ok(session);
  }

  // ------------------------------------------------------------------- terms
  async createTerm(ctx: AcademicContext, sessionId: string, dto: CreateTermDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const session = await this.resolveSession(tenantId, institutionId, sessionId);
    if (session.status === SessionStatus.CLOSED) {
      throw new ConflictException('cannot add term to a closed session');
    }
    const existing = await this.prisma.term.findFirst({
      where: { tenantId, institutionId, academicSessionId: sessionId, name: dto.name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`term "${dto.name}" already exists in session ${session.name}`);
    }
    await this.assertDateRange(new Date(dto.startDate), new Date(dto.endDate));

    const term = await this.prisma.term.create({
      data: {
        tenantId,
        institutionId,
        academicSessionId: sessionId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        createdBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TermCreated, {
      tenantId,
      institutionId,
      entityType: 'term',
      entityId: term.id,
      actorId: ctx.userId,
      payload: { name: term.name, sessionId, yearId: session.academicYearId },
    });
    return ok(term);
  }

  async listTerms(ctx: AcademicContext, sessionId: string, page?: number, limit?: number) {
    this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(page, limit);
    const where: Prisma.TermWhereInput = {
      ...institutionWhere(ctx.tenantId, ctx.institutionId as string),
      academicSessionId: sessionId,
      deletedAt: null,
    };
    const [total, items] = await Promise.all([
      this.prisma.term.count({ where }),
      this.prisma.term.findMany({
        where,
        orderBy: { startDate: 'asc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(items, total, p, l);
  }

  private async resolveTerm(tenantId: string, institutionId: string, id: string) {
    const term = await this.prisma.term.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
    });
    if (!term) {
      throw new NotFoundException(`term ${id} not found`);
    }
    return term;
  }

  async getTerm(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    return ok(await this.resolveTerm(ctx.tenantId, ctx.institutionId as string, id));
  }

  async updateTerm(ctx: AcademicContext, id: string, dto: UpdateTermDto) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveTerm(tenantId, institutionId, id);
    const nextStart = dto.startDate ? new Date(dto.startDate) : current.startDate;
    const nextEnd = dto.endDate ? new Date(dto.endDate) : current.endDate;
    await this.assertDateRange(nextStart, nextEnd);

    const term = await this.prisma.term.update({
      where: { id },
      data: {
        name: dto.name,
        startDate: dto.startDate ? nextStart : undefined,
        endDate: dto.endDate ? nextEnd : undefined,
        ...(dto.status ? { status: dto.status } : {}),
        updatedBy: ctx.userId,
      },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TermUpdated, {
      tenantId,
      institutionId,
      entityType: 'term',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: term.status },
    });
    return ok(term);
  }

  async activateTerm(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveTerm(tenantId, institutionId, id);
    const session = await this.prisma.academicSession.findFirst({
      where: { id: current.academicSessionId, tenantId, deletedAt: null },
    });
    if (!session) {
      throw new NotFoundException(`term ${id} references a missing session`);
    }
    if (session.status !== SessionStatus.ACTIVE) {
      throw new ConflictException('only terms under an ACTIVE session can be activated');
    }
    if (!TERM_ACTIVATE.has(current.status)) {
      throw new ConflictException(`cannot activate term ${id} from ${current.status}`);
    }
    const term = await this.prisma.term.update({
      where: { id },
      data: { status: TermStatus.ACTIVE, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TermActivated, {
      tenantId,
      institutionId,
      entityType: 'term',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: TermStatus.ACTIVE },
    });
    return ok(term);
  }

  async closeTerm(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveTerm(tenantId, institutionId, id);
    if (!TERM_CLOSE.has(current.status)) {
      throw new ConflictException(`cannot close term ${id} from ${current.status}`);
    }
    const term = await this.prisma.term.update({
      where: { id },
      data: { status: TermStatus.CLOSED, updatedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TermClosed, {
      tenantId,
      institutionId,
      entityType: 'term',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status, nextStatus: TermStatus.CLOSED },
    });
    return ok(term);
  }

  async deleteTerm(ctx: AcademicContext, id: string) {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const current = await this.resolveTerm(tenantId, institutionId, id);
    const dependents = await this.prisma.studentClassEnrollment.count({
      where: { termId: id, tenantId, deletedAt: null },
    });
    if (dependents > 0) {
      throw new ConflictException(`term ${id} has ${dependents} enrollment(s); withdraw them first`);
    }
    const term = await this.prisma.term.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: ctx.userId },
    });
    await emitAudited(this.publisher, this.audit, AcademicsEvents.TermDeleted, {
      tenantId,
      institutionId,
      entityType: 'term',
      entityId: id,
      actorId: ctx.userId,
      changes: { previousStatus: current.status },
    });
    return ok(term);
  }

  /** Current operational term: ACTIVE term in an ACTIVE session of the ACTIVE year. */
  async currentTerm(ctx: AcademicContext): Promise<Term> {
    this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    const institutionId = ctx.institutionId as string;
    const term = await this.prisma.term.findFirst({
      where: {
        tenantId,
        institutionId,
        status: TermStatus.ACTIVE,
        deletedAt: null,
        session: { status: SessionStatus.ACTIVE, deletedAt: null, year: { status: AcademicYearStatus.ACTIVE, deletedAt: null } },
      },
      orderBy: { startDate: 'desc' },
    });
    if (!term) {
      throw new NotFoundException('no current ACTIVE term found for institution');
    }
    return term;
  }
}