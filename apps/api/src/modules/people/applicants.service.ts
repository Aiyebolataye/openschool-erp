/**
 * PEOPLE-5 Applicant management (People spec §6.5/§6.6/§9.8; V-AP-01..06).
 *
 * Applicant is an institution-scoped sub-type of Person (roleContext APPLICANT).
 * A person holds at most one Applicant row per institution
 * (`@@unique([tenantId, personId, institutionId])`). Lifecycle follows
 * §5.6/§9.8: APPLIED → UNDER_REVIEW → (ACCEPTED | REJECTED | EXPIRED).
 * Acceptance (PeopleModule consumer of ApplicantAccepted, §9.8 step 4) creates
 * a Student record + enrollment detail + STUDENT person-institution role.
 * Expiry is lazy (P-02, default 90 days): open applications past the window
 * are swept to EXPIRED on read (expiry-on-read; no cron dependency), emitting
 * ApplicantExpired, matching the PEOPLE-G recommendation.
 */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, ApplicantStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { currentCorrelationId } from '../../common/interceptors/correlation-id.interceptor';
import {
  canMakeApplicantDecision,
  canPatchApplicantStatus,
  ApplicantStatusValue,
} from './people.lifecycle';
import { PeopleEvents, PeopleEventPayload } from './people.events';
import { generatePublicId, nextPublicIdSequence } from './people.utils';
import {
  AcceptApplicantDto,
  CreateApplicantDto,
  ListApplicantsQueryDto,
  RejectApplicantDto,
  UpdateApplicantDto,
} from './dto/applicant.dto';

/** P-02 default applicant application expiry window (days). */
export const APPLICANT_EXPIRY_DAYS = 90;

function listEnvelope(items: unknown[], total: number, page: number, limit: number) {
  return { success: true, data: { items, total, page, limit } };
}

function singleEnvelope(data: unknown) {
  return { success: true, data };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export interface ActorContext {
  id: string;
  email?: string | null;
}

type ApplicantWithPerson = Prisma.ApplicantGetPayload<{
  include: {
    person: {
      select: { id: true; firstName: true; lastName: true; email: true; publicId: true };
    };
    institution: { select: { id: true; name: true; code: true } };
  };
}>;

@Injectable()
export class ApplicantsService {
  private readonly logger = new Logger(ApplicantsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
  ) {}

  private emit(event: string, payload: PeopleEventPayload): void {
    this.eventEmitter.emit(event, {
      emittedAt: new Date().toISOString(),
      ...(currentCorrelationId() ? { correlationId: currentCorrelationId() } : {}),
      ...payload,
    });
  }

  private eventBase(tenantId: string, actor: ActorContext) {
    return {
      tenantId,
      actorId: actor.id,
      actorEmail: actor.email ?? null,
    };
  }

  // ---- resolution ----------------------------------------------------------

  private async resolveApplicant(
    tenantId: string,
    id: string,
  ): Promise<ApplicantWithPerson> {
    const where = isUuid(id)
      ? { id, tenantId, deletedAt: null }
      : { publicId: id, tenantId, deletedAt: null };
    const applicant = await this.prisma.applicant.findFirst({
      where,
      include: {
        person: {
          select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
        },
        institution: { select: { id: true, name: true, code: true } },
      },
    });
    if (!applicant) {
      throw new NotFoundException('Applicant record not found');
    }
    return applicant;
  }

  private assertNested(
    applicant: ApplicantWithPerson,
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
  ): void {
    if (applicant.tenantId !== tenantId || applicant.personId !== personId) {
      throw new NotFoundException('Applicant record not found');
    }
    if (applicant.institutionId !== institutionId) {
      throw new ForbiddenException();
    }
  }

  private applicantScope(applicant: ApplicantWithPerson) {
    return {
      id: applicant.id,
      publicId: applicant.publicId,
      personId: applicant.personId,
      person: applicant.person,
      personName: `${applicant.person.firstName} ${applicant.person.lastName}`.trim(),
      institutionId: applicant.institutionId,
      institution: applicant.institution,
      applicationDate: applicant.applicationDate,
      targetGrade: applicant.targetGrade,
      source: applicant.source,
      status: applicant.status,
      notes: applicant.notes,
      version: applicant.version,
      createdAt: applicant.createdAt,
      updatedAt: applicant.updatedAt,
    };
  }

  // ---- expiry (lazy, P-02) -------------------------------------------------

  private expiryCutoff(): Date {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - APPLICANT_EXPIRY_DAYS);
    cutoff.setHours(0, 0, 0, 0);
    return cutoff;
  }

  private isDueForExpiry(applicant: Pick<ApplicantWithPerson, 'status' | 'applicationDate'>): boolean {
    return (
      (applicant.status === 'APPLIED' || applicant.status === 'UNDER_REVIEW') &&
      applicant.applicationDate.getTime() <= this.expiryCutoff().getTime()
    );
  }

  /**
   * Sweep open applications past the expiry window for the given scope to
   * EXPIRED, emitting ApplicantExpired per row. Returns before the paginated
   * query so stale APPLIED/UNDER_REVIEW rows never surface as live.
   */
  private async sweepExpired(
    tenantId: string,
    institutionId: string | undefined,
    personId: string | undefined,
    actor: ActorContext,
  ): Promise<void> {
    const where: Prisma.ApplicantWhereInput = {
      tenantId,
      ...(institutionId ? { institutionId } : {}),
      ...(personId ? { personId } : {}),
      status: { in: ['APPLIED', 'UNDER_REVIEW'] },
      deletedAt: null,
      applicationDate: { lte: this.expiryCutoff() },
    };
    const due = await this.prisma.applicant.findMany({
      where,
      select: { id: true, applicationDate: true },
    });
    for (const row of due) {
      await this.prisma.applicant.update({
        where: { id: row.id },
        data: {
          status: 'EXPIRED',
          updatedBy: actor.id,
          version: { increment: 1 },
        },
      });
      this.emit(PeopleEvents.ApplicantExpired, {
        ...this.eventBase(tenantId, actor),
        entityId: row.id,
        version: 1,
      });
    }
  }

  /** Single-record lazy expiry used by read/accept/reject paths. */
  private async expireIfDue(
    applicant: ApplicantWithPerson,
    actor: ActorContext,
  ): Promise<void> {
    if (!this.isDueForExpiry(applicant)) {
      return;
    }
    const updated = await this.prisma.applicant.update({
      where: { id: applicant.id },
      data: {
        status: 'EXPIRED',
        updatedBy: actor.id,
        version: applicant.version + 1,
      },
    });
    this.emit(PeopleEvents.ApplicantExpired, {
      ...this.eventBase(applicant.tenantId, actor),
      personId: applicant.personId,
      entityId: applicant.id,
      version: updated.version,
    });
  }

  // ---- list / read ---------------------------------------------------------

  async listApplicants(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    query: ListApplicantsQueryDto,
    actor: ActorContext,
  ) {
    if (!institutionId) {
      throw new ForbiddenException('No institution context for this account');
    }
    await this.sweepExpired(tenantId, institutionId, personId, actor);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const whereBase: Prisma.ApplicantWhereInput = {
      tenantId,
      institutionId,
      personId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.source ? { source: query.source } : {}),
    };

    let where: Prisma.ApplicantWhereInput = whereBase;
    const search = query.search?.trim();
    if (search) {
      where = {
        ...whereBase,
        OR: [
          { person: { firstName: { contains: search, mode: 'insensitive' } } },
          { person: { lastName: { contains: search, mode: 'insensitive' } } },
          { person: { email: { contains: search, mode: 'insensitive' } } },
        ],
      };
    }

    const [total, applicants] = await Promise.all([
      this.prisma.applicant.count({ where }),
      this.prisma.applicant.findMany({
        where,
        include: {
          person: {
            select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
          },
          institution: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return listEnvelope(applicants.map((a) => this.applicantScope(a)), total, page, limit);
  }

  async findOne(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    actor: ActorContext,
  ) {
    const applicant = await this.resolveApplicant(tenantId, id);
    this.assertNested(applicant, tenantId, institutionId, personId);
    await this.expireIfDue(applicant, actor);
    return singleEnvelope(this.applicantScope(applicant));
  }

  // ---- create --------------------------------------------------------------

  async createApplicant(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    dto: CreateApplicantDto,
    actor: ActorContext,
  ) {
    if (!institutionId) {
      throw new ForbiddenException('No institution context for this account');
    }

    const person = await this.prisma.person.findFirst({
      where: { tenantId, id: personId, deletedAt: null },
      select: { id: true },
    });
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    const existing = await this.prisma.applicant.findFirst({
      where: { tenantId, personId, institutionId, deletedAt: null },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('An applicant record already exists for this person and institution');
    }

    const institution = await this.prisma.institution.findFirst({
      where: { id: institutionId, tenantId },
      select: { id: true },
    });
    if (!institution) {
      throw new BadRequestException('Institution does not exist in this tenant');
    }

    const applicationDate = dto.applicationDate ? new Date(dto.applicationDate) : new Date();
    if (Number.isNaN(applicationDate.getTime())) {
      throw new BadRequestException('applicationDate must be a valid date');
    }

    let created;
    try {
      created = await this.prisma.$transaction(async (tx) => {
        const existingIds = await tx.applicant.findMany({
          where: { tenantId },
          select: { publicId: true },
        });
        const sequence = nextPublicIdSequence(
          'APP',
          existingIds.map((a) => a.publicId),
        );

        const applicant = await tx.applicant.create({
          data: {
            tenantId,
            personId: person.id,
            institutionId: institution.id,
            publicId: generatePublicId('APP', sequence),
            applicationDate,
            targetGrade: dto.targetGrade,
            source: dto.source ?? 'WALK_IN',
            status: 'APPLIED',
            ...(dto.notes ? { notes: dto.notes } : {}),
            createdBy: actor.id,
            updatedBy: actor.id,
          },
        });

        await tx.personInstitution.upsert({
          where: {
            tenantId_personId_institutionId_roleContext: {
              tenantId,
              personId: person.id,
              institutionId: institution.id,
              roleContext: 'APPLICANT',
            },
          },
          update: { deletedAt: null, deletedBy: null, updatedBy: actor.id },
          create: {
            tenantId,
            personId: person.id,
            institutionId: institution.id,
            roleContext: 'APPLICANT',
            assignedBy: actor.id,
            createdBy: actor.id,
            updatedBy: actor.id,
          },
        });

        return applicant;
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('An applicant record already exists for this person and institution');
      }
      throw err;
    }

    this.emit(PeopleEvents.ApplicantCreated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: created.id,
      version: 1,
    });

    return singleEnvelope(
      await this.resolveApplicant(tenantId, created.id).then((a) => this.applicantScope(a)),
    );
  }

  // ---- update --------------------------------------------------------------

  async updateApplicant(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: UpdateApplicantDto,
    actor: ActorContext,
  ) {
    const applicant = await this.resolveApplicant(tenantId, id);
    this.assertNested(applicant, tenantId, institutionId, personId);
    this.assertVersion(applicant.version, dto.version);
    if (this.isDueForExpiry(applicant)) {
      await this.expireIfDue(applicant, actor);
      throw new ConflictException('Application has expired (P-02) and cannot be edited');
    }

    const data: Prisma.ApplicantUpdateInput = {
      updatedBy: actor.id,
      version: applicant.version + 1,
    };
    if (dto.targetGrade !== undefined) data.targetGrade = dto.targetGrade;
    if (dto.source !== undefined) data.source = dto.source;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.applicationDate !== undefined) {
      const nextDate = new Date(dto.applicationDate);
      if (Number.isNaN(nextDate.getTime())) {
        throw new BadRequestException('applicationDate must be a valid date');
      }
      data.applicationDate = nextDate;
    }
    if (dto.status !== undefined) {
      if (!canPatchApplicantStatus(applicant.status as ApplicantStatusValue, dto.status)) {
        throw new ConflictException(
          `A ${applicant.status} applicant cannot be moved to ${dto.status} via the update endpoint (terminal states are exclusive to accept/reject/expiry)`,
        );
      }
      data.status = dto.status as ApplicantStatus;
    }

    const updated = await this.prisma.applicant.update({
      where: { id: applicant.id },
      data,
      include: {
        person: {
          select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
        },
        institution: { select: { id: true, name: true, code: true } },
      },
    });

    this.emit(PeopleEvents.ApplicantUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
      changes: {
        status: dto.status,
        targetGrade: dto.targetGrade,
        source: dto.source,
      } as Record<string, unknown>,
    });

    return singleEnvelope(this.applicantScope(updated));
  }

  // ---- soft delete ---------------------------------------------------------

  async softDeleteApplicant(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    actor: ActorContext,
  ) {
    const applicant = await this.resolveApplicant(tenantId, id);
    this.assertNested(applicant, tenantId, institutionId, personId);

    const updated = await this.prisma.applicant.update({
      where: { id: applicant.id },
      data: {
        deletedAt: new Date(),
        deletedBy: actor.id,
        updatedBy: actor.id,
        version: applicant.version + 1,
      },
    });

    // §5.8 defines no Applicant "deleted" event; soft delete is observable via
    // deleted_at/deleted_by lineage (mirrors guardian/student soft delete).
    return singleEnvelope({
      id: updated.id,
      personId: updated.personId,
      deletedAt: updated.deletedAt,
      version: updated.version,
    });
  }

  // ---- accept / reject -----------------------------------------------------

  /**
   * Accept an application (§9.8 step 4): status → ACCEPTED and, because
   * PeopleModule consumes ApplicantAccepted, a Student record + enrollment
   * detail are created and the person gains the STUDENT institution role.
   * Emits ApplicantAccepted (Audit/Notification/People) + StudentEnrolled
   * (Audit/Academics/Finance/IdentityAccess) — the frozen §5.8 event surface.
   */
  async acceptApplicant(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: AcceptApplicantDto,
    actor: ActorContext,
  ) {
    const applicant = await this.resolveApplicant(tenantId, id);
    this.assertNested(applicant, tenantId, institutionId, personId);
    this.assertVersion(applicant.version, dto.version);
    if (this.isDueForExpiry(applicant)) {
      await this.expireIfDue(applicant, actor);
      throw new ConflictException('Application has expired (P-02) and cannot be accepted');
    }
    if (!canMakeApplicantDecision(applicant.status as ApplicantStatusValue)) {
      throw new ConflictException(
        `A ${applicant.status} applicant cannot be accepted (only open APPLIED/UNDER_REVIEW applications can be accepted)`,
      );
    }

    const person = await this.prisma.person.findFirst({
      where: { tenantId, id: personId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    const institution = await this.prisma.institution.findFirst({
      where: { id: institutionId, tenantId },
      select: { id: true, code: true },
    });
    if (!institution) {
      throw new BadRequestException('Institution does not exist in this tenant');
    }

    let studentId: string | null = null;
    const accepted = await this.prisma.$transaction(async (tx) => {
      const updatedApplicant = await tx.applicant.update({
        where: { id: applicant.id },
        data: {
          status: 'ACCEPTED',
          updatedBy: actor.id,
          version: applicant.version + 1,
        },
      });

      const existingStudentIds = await tx.student.findMany({
        where: { tenantId },
        select: { publicId: true },
      });
      const sequence = nextPublicIdSequence(
        'STU',
        existingStudentIds.map((s) => s.publicId),
      );

      const student = await tx.student.create({
        data: {
          tenantId,
          personId: person.id,
          institutionId: institution.id,
          publicId: generatePublicId('STU', sequence),
          ...(dto.studentNumber ? { studentNumber: dto.studentNumber } : {}),
          status: 'ENROLLED',
          createdBy: actor.id,
          updatedBy: actor.id,
        },
      });

      await tx.studentEnrollmentDetail.create({
        data: {
          tenantId,
          studentId: student.id,
          gradeLevel: dto.gradeLevel ?? applicant.targetGrade,
          ...(dto.className ? { className: dto.className } : {}),
          ...(dto.stream ? { stream: dto.stream } : {}),
          enrollmentType: dto.enrollmentType ?? 'NEW',
          createdBy: actor.id,
          updatedBy: actor.id,
        },
      });

      await tx.personInstitution.upsert({
        where: {
          tenantId_personId_institutionId_roleContext: {
            tenantId,
            personId: person.id,
            institutionId: institution.id,
            roleContext: 'STUDENT',
          },
        },
        update: { deletedAt: null, deletedBy: null, updatedBy: actor.id },
        create: {
          tenantId,
          personId: person.id,
          institutionId: institution.id,
          roleContext: 'STUDENT',
          assignedBy: actor.id,
          createdBy: actor.id,
          updatedBy: actor.id,
        },
      });

      studentId = student.id;
      return updatedApplicant;
    });

    this.emit(PeopleEvents.ApplicantAccepted, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: accepted.id,
      version: accepted.version,
    });
    if (studentId) {
      this.emit(PeopleEvents.StudentEnrolled, {
        ...this.eventBase(tenantId, actor),
        personId,
        entityId: studentId,
        version: 1,
      });
    }

    return singleEnvelope({
      id: accepted.id,
      status: accepted.status,
      studentId,
      personId,
      version: accepted.version,
    });
  }

  async rejectApplicant(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: RejectApplicantDto,
    actor: ActorContext,
  ) {
    const applicant = await this.resolveApplicant(tenantId, id);
    this.assertNested(applicant, tenantId, institutionId, personId);
    this.assertVersion(applicant.version, dto.version);
    if (this.isDueForExpiry(applicant)) {
      await this.expireIfDue(applicant, actor);
      throw new ConflictException('Application has expired (P-02) and cannot be rejected');
    }
    if (!canMakeApplicantDecision(applicant.status as ApplicantStatusValue)) {
      throw new ConflictException(
        `A ${applicant.status} applicant cannot be rejected (only open APPLIED/UNDER_REVIEW applications can be rejected)`,
      );
    }

    const updated = await this.prisma.applicant.update({
      where: { id: applicant.id },
      data: {
        status: 'REJECTED',
        updatedBy: actor.id,
        version: applicant.version + 1,
      },
    });

    this.emit(PeopleEvents.ApplicantRejected, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
      changes: { reason: dto.rejectionReason ?? null } as Record<string, unknown>,
    });

    return singleEnvelope({
      id: updated.id,
      status: updated.status,
      version: updated.version,
    });
  }

  // ---- internals -----------------------------------------------------------

  private assertVersion(current: number, expected: number): void {
    if (current !== expected) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'Version conflict: record has been modified by another request',
        },
        HttpStatus.CONFLICT,
      );
    }
  }

  private isUniqueViolation(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      (err as { code?: string }).code === 'P2002'
    );
  }
}