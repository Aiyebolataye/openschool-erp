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
import { Prisma, StudentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateInternalEmail } from '../identity/identity.utils';
import { currentCorrelationId } from '../../common/interceptors/correlation-id.interceptor';
import { generatePublicId, nextPublicIdSequence } from './people.utils';
import {
  canGraduate,
  canPatchStatus,
  canTransfer,
  canWithdraw,
  isMutableEnrollment,
} from './people.lifecycle';
import { PeopleEvents, PeopleEventPayload } from './people.events';
import {
  CreateStudentDto,
  EnrollmentDetailDto,
  GraduationDetailDto,
  ListStudentsQueryDto,
  TransferDetailDto,
  UpdateStudentDto,
  WithdrawalDetailDto,
} from './dto/student.dto';

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

type StudentWithDetails = Prisma.StudentGetPayload<{
  include: {
    person: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        publicId: true;
      };
    };
    institution: { select: { id: true; name: true; code: true } };
    enrollmentDetail: true;
    graduationDetail: true;
    transferDetail: true;
    withdrawalDetail: true;
  };
}>;

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

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

  private async resolveStudent(tenantId: string, id: string): Promise<StudentWithDetails> {
    const where = isUuid(id) ? { id } : { publicId: id };
    const student = await this.prisma.student.findFirst({
      where: { ...where, tenantId, deletedAt: null },
      include: {
        person: {
          select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
        },
        institution: { select: { id: true, name: true, code: true } },
        enrollmentDetail: true,
        graduationDetail: true,
        transferDetail: true,
        withdrawalDetail: true,
      },
    });
    if (!student) {
      throw new NotFoundException('Student record not found');
    }
    return student;
  }

  private assertNested(
    student: StudentWithDetails,
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
  ): void {
    if (student.tenantId !== tenantId || student.personId !== personId) {
      throw new NotFoundException('Student record not found');
    }
    if (student.institutionId !== institutionId) {
      throw new ForbiddenException();
    }
  }

  private studentScope(student: StudentWithDetails) {
    return {
      id: student.id,
      publicId: student.publicId,
      personId: student.personId,
      person: student.person,
      personName: `${student.person.firstName} ${student.person.lastName}`.trim(),
      institutionId: student.institutionId,
      institution: student.institution,
      studentNumber: student.studentNumber,
      internalEmail: student.internalEmail ?? null,
      enrollmentDate: student.enrollmentDate,
      status: student.status,
      enrollmentDetail: student.enrollmentDetail ?? null,
      graduationDetail: student.graduationDetail ?? null,
      transferDetail: student.transferDetail ?? null,
      withdrawalDetail: student.withdrawalDetail ?? null,
      version: student.version,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  // ---- list / read ---------------------------------------------------------

  async listStudents(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    query: ListStudentsQueryDto,
  ) {
    if (!institutionId) {
      throw new ForbiddenException('No institution context for this account');
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.StudentWhereInput = {
      tenantId,
      institutionId,
      personId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, students] = await Promise.all([
      this.prisma.student.count({ where }),
      this.prisma.student.findMany({
        where,
        include: {
          person: {
            select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
          },
          institution: { select: { id: true, name: true, code: true } },
          enrollmentDetail: true,
          graduationDetail: true,
          transferDetail: true,
          withdrawalDetail: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return listEnvelope(
      students.map((s) => this.studentScope(s)),
      total,
      page,
      limit,
    );
  }

  async findOne(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
  ) {
    const student = await this.resolveStudent(tenantId, id);
    this.assertNested(student, tenantId, institutionId, personId);
    return singleEnvelope(this.studentScope(student));
  }

  // ---- create --------------------------------------------------------------

  async createStudent(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    dto: CreateStudentDto,
    actor: ActorContext,
  ) {
    if (!institutionId) {
      throw new ForbiddenException('No institution context for this account');
    }

    const person = await this.prisma.person.findFirst({
      where: { tenantId, id: personId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    const existingStudent = await this.prisma.student.findFirst({
      where: { tenantId, personId, institutionId, deletedAt: null },
      select: { id: true },
    });
    if (existingStudent) {
      throw new ConflictException('A student record already exists for this person and institution');
    }

    const institution = await this.prisma.institution.findFirst({
      where: { id: institutionId, tenantId },
      select: { id: true, code: true },
    });
    if (!institution) {
      throw new BadRequestException('Institution does not exist in this tenant');
    }

    const enrollmentDate = dto.enrollmentDate ? new Date(dto.enrollmentDate) : new Date();
    if (Number.isNaN(enrollmentDate.getTime())) {
      throw new BadRequestException('enrollmentDate must be a valid date');
    }

    const data: Omit<Prisma.StudentCreateInput, 'publicId' | 'internalEmail'> = {
      tenant: { connect: { id: tenantId } },
      person: { connect: { id: person.id } },
      institution: { connect: { id: institution.id } },
      ...(dto.studentNumber ? { studentNumber: dto.studentNumber } : {}),
      enrollmentDate,
      status: 'ENROLLED',
      createdBy: actor.id,
      updatedBy: actor.id,
    };

    let student;
    try {
      student = await this.prisma.$transaction(async (tx) => {
        const internalEmail = await this.resolveInternalEmail(
          tx,
          tenantId,
          institution.id,
          institution.code,
          person.firstName,
          person.lastName,
        );

        const existingIds = await tx.student.findMany({
          where: { tenantId },
          select: { publicId: true },
        });
        const sequence = nextPublicIdSequence(
          'STU',
          existingIds.map((s) => s.publicId),
        );

        const created = await tx.student.create({
          data: {
            ...data,
            publicId: generatePublicId('STU', sequence),
            internalEmail,
          },
        });

        await tx.studentEnrollmentDetail.create({
          data: {
            tenantId,
            studentId: created.id,
            gradeLevel: dto.gradeLevel,
            ...(dto.className ? { className: dto.className } : {}),
            ...(dto.stream ? { stream: dto.stream } : {}),
            enrollmentType: dto.enrollmentType,
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

        return created;
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('A student record already exists for this person and institution');
      }
      throw err;
    }

    this.emit(PeopleEvents.StudentEnrolled, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: student.id,
      version: 1,
    });

    return singleEnvelope(await this.resolveStudent(tenantId, student.id).then((s) => this.studentScope(s)));
  }

  // ---- update --------------------------------------------------------------

  async updateStudent(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: UpdateStudentDto,
    actor: ActorContext,
  ) {
    const student = await this.resolveStudent(tenantId, id);
    this.assertNested(student, tenantId, institutionId, personId);
    this.assertVersion(student.version, dto.version);

    if (dto.status) {
      if (!canPatchStatus(student.status, dto.status)) {
        throw new ConflictException(
          `A ${student.status} student cannot be moved to ${dto.status} via the status patch endpoint`,
        );
      }
    }

    const data: Prisma.StudentUpdateInput = {
      updatedBy: actor.id,
      version: student.version + 1,
    };
    if (dto.studentNumber !== undefined) data.studentNumber = dto.studentNumber;
    if (dto.enrollmentDate !== undefined) {
      const enrollmentDate = new Date(dto.enrollmentDate);
      if (Number.isNaN(enrollmentDate.getTime())) {
        throw new BadRequestException('enrollmentDate must be a valid date');
      }
      data.enrollmentDate = enrollmentDate;
    }
    if (dto.status !== undefined) data.status = dto.status;

    const updated = await this.prisma.student.update({
      where: { id: student.id },
      data,
      include: {
        person: {
          select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
        },
        institution: { select: { id: true, name: true, code: true } },
        enrollmentDetail: true,
        graduationDetail: true,
        transferDetail: true,
        withdrawalDetail: true,
      },
    });

    this.emit(PeopleEvents.StudentUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
    });

    return singleEnvelope(this.studentScope(updated));
  }

  async softDeleteStudent(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    actor: ActorContext,
  ) {
    const student = await this.resolveStudent(tenantId, id);
    this.assertNested(student, tenantId, institutionId, personId);

    const updated = await this.prisma.student.update({
      where: { id: student.id },
      data: {
        deletedAt: new Date(),
        deletedBy: actor.id,
        status: 'WITHDRAWN',
        updatedBy: actor.id,
        version: student.version + 1,
      },
    });

    this.emit(PeopleEvents.StudentUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
      changes: { deleted: true },
    });

    return singleEnvelope({
      id: updated.id,
      publicId: updated.publicId,
      status: updated.status,
      deletedAt: updated.deletedAt,
      version: updated.version,
    });
  }

  // ---- enrollment detail ---------------------------------------------------

  async getEnrollmentDetail(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
  ) {
    const student = await this.resolveStudent(tenantId, id);
    this.assertNested(student, tenantId, institutionId, personId);
    return singleEnvelope({
      studentId: student.id,
      gradeLevel: student.enrollmentDetail?.gradeLevel ?? null,
      className: student.enrollmentDetail?.className ?? null,
      stream: student.enrollmentDetail?.stream ?? null,
      enrollmentType: student.enrollmentDetail?.enrollmentType ?? null,
      version: student.version,
    });
  }

  async updateEnrollmentDetail(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: EnrollmentDetailDto,
    actor: ActorContext,
  ) {
    const student = await this.resolveStudent(tenantId, id);
    this.assertNested(student, tenantId, institutionId, personId);
    if (!isMutableEnrollment(student.status)) {
      throw new ConflictException(`Enrollment detail is not mutable for a ${student.status} student`);
    }
    this.assertVersion(student.version, dto.version);

    const data: Prisma.StudentEnrollmentDetailUpdateInput = { updatedBy: actor.id };
    if (dto.gradeLevel !== undefined) data.gradeLevel = dto.gradeLevel;
    if (dto.className !== undefined) data.className = dto.className;
    if (dto.stream !== undefined) data.stream = dto.stream;
    if (dto.enrollmentType !== undefined) data.enrollmentType = dto.enrollmentType;

    await this.prisma.studentEnrollmentDetail.upsert({
      where: { studentId: student.id },
      create: {
        tenantId,
        studentId: student.id,
        gradeLevel: dto.gradeLevel ?? '',
        ...(dto.className ? { className: dto.className } : {}),
        ...(dto.stream ? { stream: dto.stream } : {}),
        enrollmentType: dto.enrollmentType ?? 'NEW',
        createdBy: actor.id,
        updatedBy: actor.id,
      },
      update: data,
    });

    const updated = await this.prisma.student.update({
      where: { id: student.id },
      data: { updatedBy: actor.id, version: student.version + 1 },
      include: { enrollmentDetail: true },
    });

    this.emit(PeopleEvents.StudentUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
      changes: { enrollmentDetail: true },
    });

    return singleEnvelope({
      studentId: updated.id,
      gradeLevel: updated.enrollmentDetail?.gradeLevel ?? null,
      className: updated.enrollmentDetail?.className ?? null,
      stream: updated.enrollmentDetail?.stream ?? null,
      enrollmentType: updated.enrollmentDetail?.enrollmentType ?? null,
      version: updated.version,
    });
  }

  // ---- graduation ----------------------------------------------------------

  async graduateStudent(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: GraduationDetailDto,
    actor: ActorContext,
  ) {
    const student = await this.resolveStudent(tenantId, id);
    this.assertNested(student, tenantId, institutionId, personId);
    if (!canGraduate(student.status)) {
      throw new ConflictException(`A ${student.status} student cannot be graduated`);
    }
    this.assertVersion(student.version, dto.version);

    const graduationDate = new Date(dto.graduationDate);
    if (Number.isNaN(graduationDate.getTime())) {
      throw new BadRequestException('graduationDate must be a valid date');
    }

    await this.prisma.studentGraduationDetail.upsert({
      where: { studentId: student.id },
      create: {
        tenantId,
        studentId: student.id,
        graduationDate,
        ...(dto.finalGrade ? { finalGrade: dto.finalGrade } : {}),
        ...(dto.certificateNumber ? { certificateNumber: dto.certificateNumber } : {}),
        ...(dto.diplomaReference ? { diplomaReference: dto.diplomaReference } : {}),
        createdBy: actor.id,
        updatedBy: actor.id,
      },
      update: {
        graduationDate,
        ...(dto.finalGrade !== undefined ? { finalGrade: dto.finalGrade } : {}),
        ...(dto.certificateNumber !== undefined ? { certificateNumber: dto.certificateNumber } : {}),
        ...(dto.diplomaReference !== undefined ? { diplomaReference: dto.diplomaReference } : {}),
        updatedBy: actor.id,
        version: { increment: 1 },
      },
    });

    const updated = await this.prisma.student.update({
      where: { id: student.id },
      data: { status: 'GRADUATED', updatedBy: actor.id, version: student.version + 1 },
      include: { graduationDetail: true },
    });

    this.emit(PeopleEvents.StudentGraduated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
    });

    return singleEnvelope({
      studentId: updated.id,
      status: updated.status,
      graduationDetail: updated.graduationDetail ?? null,
      version: updated.version,
    });
  }

  // ---- transfer ------------------------------------------------------------

  async transferStudent(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: TransferDetailDto,
    actor: ActorContext,
  ) {
    const student = await this.resolveStudent(tenantId, id);
    this.assertNested(student, tenantId, institutionId, personId);
    if (!canTransfer(student.status)) {
      throw new ConflictException(`A ${student.status} student cannot be transferred`);
    }
    this.assertVersion(student.version, dto.version);

    const transferDate = new Date(dto.transferDate);
    if (Number.isNaN(transferDate.getTime())) {
      throw new BadRequestException('transferDate must be a valid date');
    }

    let destinationInstitutionId: string | null = null;
    if (dto.destinationInstitutionId) {
      const destination = await this.prisma.institution.findFirst({
        where: { id: dto.destinationInstitutionId, tenantId },
        select: { id: true },
      });
      if (!destination) {
        throw new BadRequestException('Destination institution does not exist in this tenant');
      }
      destinationInstitutionId = dto.destinationInstitutionId;
    }

    await this.prisma.studentTransferDetail.upsert({
      where: { studentId: student.id },
      create: {
        tenantId,
        studentId: student.id,
        transferDate,
        sourceInstitutionId: student.institutionId,
        ...(destinationInstitutionId ? { destinationInstitutionId } : {}),
        ...(dto.transferReason ? { transferReason: dto.transferReason } : {}),
        createdBy: actor.id,
        updatedBy: actor.id,
      },
      update: {
        transferDate,
        sourceInstitutionId: student.institutionId,
        ...(dto.destinationInstitutionId !== undefined
          ? { destinationInstitutionId: dto.destinationInstitutionId ?? null }
          : {}),
        ...(dto.transferReason !== undefined ? { transferReason: dto.transferReason } : {}),
        updatedBy: actor.id,
        version: { increment: 1 },
      },
    });

    const updated = await this.prisma.student.update({
      where: { id: student.id },
      data: { status: 'TRANSFERRED', updatedBy: actor.id, version: student.version + 1 },
      include: { transferDetail: true },
    });

    this.emit(PeopleEvents.StudentTransferred, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
    });

    return singleEnvelope({
      studentId: updated.id,
      status: updated.status,
      transferDetail: updated.transferDetail ?? null,
      version: updated.version,
    });
  }

  // ---- withdrawal ----------------------------------------------------------

  async withdrawStudent(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: WithdrawalDetailDto,
    actor: ActorContext,
  ) {
    const student = await this.resolveStudent(tenantId, id);
    this.assertNested(student, tenantId, institutionId, personId);
    if (!canWithdraw(student.status)) {
      throw new ConflictException(`A ${student.status} student cannot be withdrawn`);
    }
    this.assertVersion(student.version, dto.version);

    const withdrawalDate = new Date(dto.withdrawalDate);
    if (Number.isNaN(withdrawalDate.getTime())) {
      throw new BadRequestException('withdrawalDate must be a valid date');
    }

    await this.prisma.studentWithdrawalDetail.upsert({
      where: { studentId: student.id },
      create: {
        tenantId,
        studentId: student.id,
        withdrawalDate,
        ...(dto.withdrawalReason ? { withdrawalReason: dto.withdrawalReason } : {}),
        withdrawalType: dto.withdrawalType,
        refundStatus: dto.refundStatus ?? 'PENDING',
        createdBy: actor.id,
        updatedBy: actor.id,
      },
      update: {
        withdrawalDate,
        ...(dto.withdrawalReason !== undefined ? { withdrawalReason: dto.withdrawalReason } : {}),
        ...(dto.withdrawalType !== undefined ? { withdrawalType: dto.withdrawalType } : {}),
        ...(dto.refundStatus !== undefined ? { refundStatus: dto.refundStatus } : {}),
        updatedBy: actor.id,
        version: { increment: 1 },
      },
    });

    const updated = await this.prisma.student.update({
      where: { id: student.id },
      data: { status: 'WITHDRAWN', updatedBy: actor.id, version: student.version + 1 },
      include: { withdrawalDetail: true },
    });

    this.emit(PeopleEvents.StudentWithdrawn, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
    });

    return singleEnvelope({
      studentId: updated.id,
      status: updated.status,
      withdrawalDetail: updated.withdrawalDetail ?? null,
      version: updated.version,
    });
  }

  // ---- detail reads --------------------------------------------------------

  async resolveStudentDetails(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    kind: 'graduation' | 'transfer' | 'withdrawal',
  ) {
    const student = await this.resolveStudent(tenantId, id);
    this.assertNested(student, tenantId, institutionId, personId);

    const detail =
      kind === 'graduation'
        ? student.graduationDetail ?? null
        : kind === 'transfer'
          ? student.transferDetail ?? null
          : student.withdrawalDetail ?? null;

    return singleEnvelope({
      studentId: student.id,
      status: student.status,
      detail: detail ?? null,
      version: student.version,
    });
  }

  // ---- internals -----------------------------------------------------------

  private async resolveInternalEmail(
    tx: Prisma.TransactionClient,
    tenantId: string,
    institutionId: string,
    institutionCode: string,
    firstName: string,
    lastName: string,
  ): Promise<string> {
    let suffix = 0;
    for (;;) {
      const candidate = generateInternalEmail(firstName, lastName, institutionCode, suffix ? String(suffix) : undefined);
      const scopeConflict = await tx.student.findFirst({
        where: { tenantId, institutionId, internalEmail: candidate, deletedAt: null },
        select: { id: true },
      });
      const globalConflict = await tx.student.findFirst({
        where: { internalEmail: candidate },
        select: { id: true },
      });
      if (!scopeConflict && !globalConflict) {
        return candidate;
      }
      suffix += 1;
    }
  }

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