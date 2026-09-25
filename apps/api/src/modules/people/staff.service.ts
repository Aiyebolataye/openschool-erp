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
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateInternalEmail } from '../identity/identity.utils';
import { currentCorrelationId } from '../../common/interceptors/correlation-id.interceptor';
import { generatePublicId, nextPublicIdSequence } from './people.utils';
import {
  canPatchStaffStatus,
  isMutableEmployment,
} from './people.lifecycle';
import { PeopleEvents, PeopleEventPayload } from './people.events';
import {
  CreateStaffDto,
  CreateStaffCertificationDto,
  CreateStaffQualificationDto,
  ListStaffQueryDto,
  StaffEmploymentDetailDto,
  UpdateStaffDto,
  UpdateStaffCertificationDto,
  UpdateStaffQualificationDto,
} from './dto/staff.dto';

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

type StaffWithDetails = Prisma.StaffGetPayload<{
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
    employmentDetail: true;
    qualifications: true;
    certifications: true;
    employmentHistory: true;
  };
}>;

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

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

  private async resolveStaff(tenantId: string, id: string): Promise<StaffWithDetails> {
    const where = isUuid(id) ? { id } : { publicId: id };
    const staff = await this.prisma.staff.findFirst({
      where: { ...where, tenantId, deletedAt: null },
      include: {
        person: {
          select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
        },
        institution: { select: { id: true, name: true, code: true } },
        employmentDetail: true,
        qualifications: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        certifications: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        employmentHistory: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!staff) {
      throw new NotFoundException('Staff record not found');
    }
    return staff;
  }

  private assertNested(
    staff: StaffWithDetails,
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
  ): void {
    if (staff.tenantId !== tenantId || staff.personId !== personId) {
      throw new NotFoundException('Staff record not found');
    }
    if (staff.institutionId !== institutionId) {
      throw new ForbiddenException();
    }
  }

  private staffScope(staff: StaffWithDetails) {
    return {
      id: staff.id,
      publicId: staff.publicId,
      personId: staff.personId,
      person: staff.person,
      personName: `${staff.person.firstName} ${staff.person.lastName}`.trim(),
      institutionId: staff.institutionId,
      institution: staff.institution,
      staffNumber: staff.staffNumber,
      internalEmail: staff.internalEmail ?? null,
      hireDate: staff.hireDate,
      employmentType: staff.employmentType,
      status: staff.status,
      employmentDetail: staff.employmentDetail ?? null,
      qualifications: staff.qualifications.map((q) => ({
        id: q.id,
        qualificationName: q.qualificationName,
        institutionName: q.institutionName,
        fieldOfStudy: q.fieldOfStudy,
        yearObtained: q.yearObtained,
        grade: q.grade,
        certificateRef: q.certificateRef,
        version: q.version,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      })),
      certifications: staff.certifications.map((c) => ({
        id: c.id,
        certificationName: c.certificationName,
        issuingBody: c.issuingBody,
        issueDate: c.issueDate,
        expiryDate: c.expiryDate,
        certificateNumber: c.certificateNumber,
        certificateRef: c.certificateRef,
        version: c.version,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      employmentHistory: staff.employmentHistory.map((h) => ({
        id: h.id,
        institutionName: h.institutionName,
        position: h.position,
        startDate: h.startDate,
        endDate: h.endDate,
        reasonForLeaving: h.reasonForLeaving,
        createdAt: h.createdAt,
      })),
      version: staff.version,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };
  }

  // ---- list / read ---------------------------------------------------------

  async listStaff(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    query: ListStaffQueryDto,
  ) {
    if (!institutionId) {
      throw new ForbiddenException('No institution context for this account');
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const whereBase: Prisma.StaffWhereInput = {
      tenantId,
      institutionId,
      personId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    let where: Prisma.StaffWhereInput = whereBase;
    const search = query.search?.trim();

    if (search) {
      const mode = query.searchMode === 'exact' ? 'exact' : 'fuzzy';
      if (mode === 'exact') {
        where = {
          ...whereBase,
          OR: [{ staffNumber: search }, { publicId: search }, { internalEmail: search }],
        };
      } else {
        where = {
          ...whereBase,
          OR: [
            { staffNumber: { contains: search, mode: 'insensitive' } },
            { internalEmail: { contains: search, mode: 'insensitive' } },
            { employmentDetail: { position: { contains: search, mode: 'insensitive' } } },
            { employmentDetail: { department: { contains: search, mode: 'insensitive' } } },
            { person: { firstName: { contains: search, mode: 'insensitive' } } },
            { person: { lastName: { contains: search, mode: 'insensitive' } } },
            { person: { email: { contains: search, mode: 'insensitive' } } },
          ],
        };
      }
    }

    const [total, staffs] = await Promise.all([
      this.prisma.staff.count({ where }),
      this.prisma.staff.findMany({
        where,
        include: {
          person: {
            select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
          },
          institution: { select: { id: true, name: true, code: true } },
          employmentDetail: true,
          qualifications: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
          certifications: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
          employmentHistory: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return listEnvelope(
      staffs.map((s) => this.staffScope(s)),
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
    const staff = await this.resolveStaff(tenantId, id);
    this.assertNested(staff, tenantId, institutionId, personId);
    return singleEnvelope(this.staffScope(staff));
  }

  // ---- create --------------------------------------------------------------

  async createStaff(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    dto: CreateStaffDto,
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

    const existingStaff = await this.prisma.staff.findFirst({
      where: { tenantId, personId, institutionId, deletedAt: null },
      select: { id: true },
    });
    if (existingStaff) {
      throw new ConflictException('A staff record already exists for this person and institution');
    }

    const institution = await this.prisma.institution.findFirst({
      where: { id: institutionId, tenantId },
      select: { id: true, code: true },
    });
    if (!institution) {
      throw new BadRequestException('Institution does not exist in this tenant');
    }

    if (dto.staffNumber) {
      const existingNum = await this.prisma.staff.findFirst({
        where: { tenantId, institutionId, staffNumber: dto.staffNumber, deletedAt: null },
        select: { id: true },
      });
      if (existingNum) {
        throw new ConflictException('A staff record with this employee ID already exists in this institution');
      }
    }

    if (dto.userId) {
      const user = await this.prisma.user.findFirst({
        where: { id: dto.userId, tenantId },
        select: { id: true },
      });
      if (!user) {
        throw new BadRequestException('The specified userId does not belong to a user in this tenant');
      }
    }

    if (dto.reportingTo) {
      const reporter = await this.prisma.staff.findFirst({
        where: { id: dto.reportingTo, tenantId, deletedAt: null },
        select: { id: true },
      });
      if (!reporter) {
        throw new BadRequestException('The specified reportingTo staff does not exist in this tenant');
      }
    }

    const hireDate = new Date(dto.hireDate);
    if (Number.isNaN(hireDate.getTime())) {
      throw new BadRequestException('hireDate must be a valid date');
    }

    const contractStartDate = dto.contractStartDate ? new Date(dto.contractStartDate) : null;
    if (contractStartDate && Number.isNaN(contractStartDate.getTime())) {
      throw new BadRequestException('contractStartDate must be a valid date');
    }
    const contractEndDate = dto.contractEndDate ? new Date(dto.contractEndDate) : null;
    if (contractEndDate && Number.isNaN(contractEndDate.getTime())) {
      throw new BadRequestException('contractEndDate must be a valid date');
    }
    if (contractStartDate && contractEndDate && contractEndDate < contractStartDate) {
      throw new BadRequestException('contractEndDate must not be before contractStartDate');
    }

    let staff;
    try {
      staff = await this.prisma.$transaction(async (tx) => {
        const internalEmail = await this.resolveInternalEmail(
          tx,
          tenantId,
          institution.id,
          institution.code,
          person.firstName,
          person.lastName,
        );

        const existingIds = await tx.staff.findMany({
          where: { tenantId },
          select: { publicId: true },
        });
        const sequence = nextPublicIdSequence(
          'EMP',
          existingIds.map((s) => s.publicId),
        );

        const created = await tx.staff.create({
          data: {
            tenantId,
            personId: person.id,
            institutionId: institution.id,
            ...(dto.userId ? { userId: dto.userId } : {}),
            publicId: generatePublicId('EMP', sequence),
            internalEmail,
            ...(dto.staffNumber ? { staffNumber: dto.staffNumber } : {}),
            hireDate,
            employmentType: dto.employmentType,
            status: 'HIRED',
            createdBy: actor.id,
            updatedBy: actor.id,
          },
        });

        await tx.staffEmploymentDetail.create({
          data: {
            tenantId,
            staffId: created.id,
            position: dto.position,
            ...(dto.department ? { department: dto.department } : {}),
            ...(dto.reportingTo ? { reportingTo: dto.reportingTo } : {}),
            ...(dto.workLocation ? { workLocation: dto.workLocation } : {}),
            ...(dto.salaryGrade ? { salaryGrade: dto.salaryGrade } : {}),
            ...(contractStartDate ? { contractStartDate } : {}),
            ...(contractEndDate ? { contractEndDate } : {}),
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
              roleContext: 'STAFF',
            },
          },
          update: { deletedAt: null, deletedBy: null, updatedBy: actor.id },
          create: {
            tenantId,
            personId: person.id,
            institutionId: institution.id,
            roleContext: 'STAFF',
            assignedBy: actor.id,
            createdBy: actor.id,
            updatedBy: actor.id,
          },
        });

        return created;
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('A staff record with this employee ID already exists in this institution');
      }
      throw err;
    }

    this.emit(PeopleEvents.StaffHired, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: staff.id,
      version: 1,
    });

    return singleEnvelope(await this.resolveStaff(tenantId, staff.id).then((s) => this.staffScope(s)));
  }

  // ---- update --------------------------------------------------------------

  async updateStaff(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: UpdateStaffDto,
    actor: ActorContext,
  ) {
    const staff = await this.resolveStaff(tenantId, id);
    this.assertNested(staff, tenantId, institutionId, personId);
    this.assertVersion(staff.version, dto.version);

    if (dto.staffNumber) {
      const existingNum = await this.prisma.staff.findFirst({
        where: {
          tenantId,
          institutionId: institutionId!,
          staffNumber: dto.staffNumber,
          deletedAt: null,
          NOT: { id: staff.id },
        },
        select: { id: true },
      });
      if (existingNum) {
        throw new ConflictException('A staff record with this employee ID already exists in this institution');
      }
    }

    const data: Prisma.StaffUpdateInput = {
      updatedBy: actor.id,
      version: staff.version + 1,
    };
    if (dto.staffNumber !== undefined) data.staffNumber = dto.staffNumber;
    if (dto.hireDate !== undefined) {
      const hireDate = new Date(dto.hireDate);
      if (Number.isNaN(hireDate.getTime())) {
        throw new BadRequestException('hireDate must be a valid date');
      }
      data.hireDate = hireDate;
    }
    if (dto.employmentType !== undefined) data.employmentType = dto.employmentType;

    const separated = dto.status === 'SEPARATED' && staff.status !== 'SEPARATED';
    if (dto.status !== undefined) {
      if (!canPatchStaffStatus(staff.status, dto.status)) {
        throw new ConflictException(
          `A ${staff.status} staff member cannot be moved to ${dto.status} via the status patch endpoint`,
        );
      }
      data.status = dto.status;
    }

    const updated = await this.prisma.staff.update({
      where: { id: staff.id },
      data,
      include: {
        person: {
          select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
        },
        institution: { select: { id: true, name: true, code: true } },
        employmentDetail: true,
        qualifications: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        certifications: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        employmentHistory: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (separated) {
      await this.snapshotEmploymentHistory(tenantId, staff.id, actor.id);
    }

    if (separated) {
      this.emit(PeopleEvents.StaffSeparated, {
        ...this.eventBase(tenantId, actor),
        personId,
        entityId: updated.id,
        version: updated.version,
      });
    } else {
      this.emit(PeopleEvents.StaffUpdated, {
        ...this.eventBase(tenantId, actor),
        personId,
        entityId: updated.id,
        version: updated.version,
      });
    }

    return singleEnvelope(this.staffScope(updated));
  }

  // ---- soft delete ---------------------------------------------------------

  async softDeleteStaff(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    actor: ActorContext,
  ) {
    const staff = await this.resolveStaff(tenantId, id);
    this.assertNested(staff, tenantId, institutionId, personId);

    const alreadySeparated = staff.status === 'SEPARATED';

    const updated = await this.prisma.staff.update({
      where: { id: staff.id },
      data: {
        deletedAt: new Date(),
        deletedBy: actor.id,
        status: 'SEPARATED',
        updatedBy: actor.id,
        version: staff.version + 1,
      },
    });

    if (!alreadySeparated) {
      await this.snapshotEmploymentHistory(tenantId, staff.id, actor.id);
    }

    this.emit(PeopleEvents.StaffSeparated, {
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

  // ---- employment detail ---------------------------------------------------

  async getEmploymentDetail(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
  ) {
    const staff = await this.resolveStaff(tenantId, id);
    this.assertNested(staff, tenantId, institutionId, personId);
    return singleEnvelope({
      staffId: staff.id,
      position: staff.employmentDetail?.position ?? null,
      department: staff.employmentDetail?.department ?? null,
      reportingTo: staff.employmentDetail?.reportingTo ?? null,
      workLocation: staff.employmentDetail?.workLocation ?? null,
      salaryGrade: staff.employmentDetail?.salaryGrade ?? null,
      contractStartDate: staff.employmentDetail?.contractStartDate ?? null,
      contractEndDate: staff.employmentDetail?.contractEndDate ?? null,
      version: staff.version,
    });
  }

  async updateEmploymentDetail(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: StaffEmploymentDetailDto,
    actor: ActorContext,
  ) {
    const staff = await this.resolveStaff(tenantId, id);
    this.assertNested(staff, tenantId, institutionId, personId);
    if (!isMutableEmployment(staff.status)) {
      throw new ConflictException(`Employment detail is not mutable for a ${staff.status} staff member`);
    }
    this.assertVersion(staff.version, dto.version);

    if (dto.reportingTo) {
      const reporter = await this.prisma.staff.findFirst({
        where: { id: dto.reportingTo, tenantId, deletedAt: null },
        select: { id: true },
      });
      if (!reporter) {
        throw new BadRequestException('The specified reportingTo staff does not exist in this tenant');
      }
    }

    const contractStartDate = dto.contractStartDate ? new Date(dto.contractStartDate) : null;
    if (contractStartDate && Number.isNaN(contractStartDate.getTime())) {
      throw new BadRequestException('contractStartDate must be a valid date');
    }
    const contractEndDate = dto.contractEndDate ? new Date(dto.contractEndDate) : null;
    if (contractEndDate && Number.isNaN(contractEndDate.getTime())) {
      throw new BadRequestException('contractEndDate must be a valid date');
    }
    if (contractStartDate && contractEndDate && contractEndDate < contractStartDate) {
      throw new BadRequestException('contractEndDate must not be before contractStartDate');
    }

    const data: Prisma.StaffEmploymentDetailUncheckedUpdateInput = { updatedBy: actor.id };
    if (dto.position !== undefined) data.position = dto.position;
    if (dto.department !== undefined) data.department = dto.department;
    if (dto.reportingTo !== undefined) data.reportingTo = dto.reportingTo;
    if (dto.workLocation !== undefined) data.workLocation = dto.workLocation;
    if (dto.salaryGrade !== undefined) data.salaryGrade = dto.salaryGrade;
    if (dto.contractStartDate !== undefined) data.contractStartDate = contractStartDate;
    if (dto.contractEndDate !== undefined) data.contractEndDate = contractEndDate;

    await this.prisma.staffEmploymentDetail.upsert({
      where: { staffId: staff.id },
      create: {
        tenantId,
        staffId: staff.id,
        position: dto.position,
        ...(dto.department ? { department: dto.department } : {}),
        ...(dto.reportingTo ? { reportingTo: dto.reportingTo } : {}),
        ...(dto.workLocation ? { workLocation: dto.workLocation } : {}),
        ...(dto.salaryGrade ? { salaryGrade: dto.salaryGrade } : {}),
        ...(contractStartDate ? { contractStartDate } : {}),
        ...(contractEndDate ? { contractEndDate } : {}),
        createdBy: actor.id,
        updatedBy: actor.id,
      },
      update: data,
    });

    const updatedStaff = await this.prisma.staff.update({
      where: { id: staff.id },
      data: { updatedBy: actor.id, version: staff.version + 1 },
      include: { employmentDetail: true },
    });

    this.emit(PeopleEvents.StaffUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updatedStaff.id,
      version: updatedStaff.version,
      changes: { employmentDetail: true },
    });

    return singleEnvelope({
      staffId: updatedStaff.id,
      position: updatedStaff.employmentDetail?.position ?? null,
      department: updatedStaff.employmentDetail?.department ?? null,
      reportingTo: updatedStaff.employmentDetail?.reportingTo ?? null,
      workLocation: updatedStaff.employmentDetail?.workLocation ?? null,
      salaryGrade: updatedStaff.employmentDetail?.salaryGrade ?? null,
      contractStartDate: updatedStaff.employmentDetail?.contractStartDate ?? null,
      contractEndDate: updatedStaff.employmentDetail?.contractEndDate ?? null,
      version: updatedStaff.version,
    });
  }

  // ---- qualifications ------------------------------------------------------

  async listQualifications(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
  ) {
    const staff = await this.resolveStaff(tenantId, id);
    this.assertNested(staff, tenantId, institutionId, personId);
    const items = staff.qualifications.map((q) => ({
      id: q.id,
      qualificationName: q.qualificationName,
      institutionName: q.institutionName,
      fieldOfStudy: q.fieldOfStudy,
      yearObtained: q.yearObtained,
      grade: q.grade,
      certificateRef: q.certificateRef,
      version: q.version,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }));
    return listEnvelope(items, items.length, 1, items.length);
  }

  async addQualification(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: CreateStaffQualificationDto,
    actor: ActorContext,
  ) {
    const staff = await this.resolveStaff(tenantId, id);
    this.assertNested(staff, tenantId, institutionId, personId);

    const created = await this.prisma.staffQualification.create({
      data: {
        tenantId,
        staffId: staff.id,
        qualificationName: dto.qualificationName,
        institutionName: dto.institutionName,
        ...(dto.fieldOfStudy ? { fieldOfStudy: dto.fieldOfStudy } : {}),
        yearObtained: dto.yearObtained,
        ...(dto.grade ? { grade: dto.grade } : {}),
        ...(dto.certificateRef ? { certificateRef: dto.certificateRef } : {}),
        createdBy: actor.id,
        updatedBy: actor.id,
      },
    });

    await this.prisma.staff.update({
      where: { id: staff.id },
      data: { updatedBy: actor.id, version: staff.version + 1 },
    });

    this.emit(PeopleEvents.StaffUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: staff.id,
      version: staff.version + 1,
      changes: { qualificationAdded: created.id },
    });

    return singleEnvelope({
      id: created.id,
      qualificationName: created.qualificationName,
      institutionName: created.institutionName,
      fieldOfStudy: created.fieldOfStudy,
      yearObtained: created.yearObtained,
      grade: created.grade,
      certificateRef: created.certificateRef,
      version: created.version,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async updateQualification(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    staffId: string,
    qualificationId: string,
    dto: UpdateStaffQualificationDto,
    actor: ActorContext,
  ) {
    const staff = await this.resolveStaff(tenantId, staffId);
    this.assertNested(staff, tenantId, institutionId, personId);
    this.assertVersion(staff.version, dto.version);

    const qual = await this.prisma.staffQualification.findFirst({
      where: { id: qualificationId, staffId: staff.id, tenantId, deletedAt: null },
    });
    if (!qual) {
      throw new NotFoundException('Qualification not found');
    }

    const updated = await this.prisma.staffQualification.update({
      where: { id: qual.id },
      data: {
        qualificationName: dto.qualificationName,
        institutionName: dto.institutionName,
        ...(dto.fieldOfStudy !== undefined ? { fieldOfStudy: dto.fieldOfStudy } : {}),
        yearObtained: dto.yearObtained,
        ...(dto.grade !== undefined ? { grade: dto.grade } : {}),
        ...(dto.certificateRef !== undefined ? { certificateRef: dto.certificateRef } : {}),
        updatedBy: actor.id,
      },
    });

    const updatedStaff = await this.prisma.staff.update({
      where: { id: staff.id },
      data: { updatedBy: actor.id, version: staff.version + 1 },
    });

    this.emit(PeopleEvents.StaffUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: staff.id,
      version: updatedStaff.version,
      changes: { qualificationUpdated: updated.id },
    });

    return singleEnvelope({
      id: updated.id,
      qualificationName: updated.qualificationName,
      institutionName: updated.institutionName,
      fieldOfStudy: updated.fieldOfStudy,
      yearObtained: updated.yearObtained,
      grade: updated.grade,
      certificateRef: updated.certificateRef,
      version: updated.version,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async removeQualification(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    staffId: string,
    qualificationId: string,
    dto: { version: number },
    actor: ActorContext,
  ) {
    const staff = await this.resolveStaff(tenantId, staffId);
    this.assertNested(staff, tenantId, institutionId, personId);
    this.assertVersion(staff.version, dto.version);

    const qual = await this.prisma.staffQualification.findFirst({
      where: { id: qualificationId, staffId: staff.id, tenantId, deletedAt: null },
    });
    if (!qual) {
      throw new NotFoundException('Qualification not found');
    }

    await this.prisma.staffQualification.update({
      where: { id: qual.id },
      data: { deletedAt: new Date(), deletedBy: actor.id },
    });

    const updatedStaff = await this.prisma.staff.update({
      where: { id: staff.id },
      data: { updatedBy: actor.id, version: staff.version + 1 },
    });

    this.emit(PeopleEvents.StaffUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: staff.id,
      version: updatedStaff.version,
      changes: { qualificationRemoved: qual.id },
    });

    return singleEnvelope({
      id: qual.id,
      deletedAt: qual.deletedAt,
      version: updatedStaff.version,
    });
  }

  // ---- certifications ------------------------------------------------------

  async listCertifications(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
  ) {
    const staff = await this.resolveStaff(tenantId, id);
    this.assertNested(staff, tenantId, institutionId, personId);
    const items = staff.certifications.map((c) => ({
      id: c.id,
      certificationName: c.certificationName,
      issuingBody: c.issuingBody,
      issueDate: c.issueDate,
      expiryDate: c.expiryDate,
      certificateNumber: c.certificateNumber,
      certificateRef: c.certificateRef,
      version: c.version,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
    return listEnvelope(items, items.length, 1, items.length);
  }

  async addCertification(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: CreateStaffCertificationDto,
    actor: ActorContext,
  ) {
    const staff = await this.resolveStaff(tenantId, id);
    this.assertNested(staff, tenantId, institutionId, personId);

    const issueDate = new Date(dto.issueDate);
    if (Number.isNaN(issueDate.getTime())) {
      throw new BadRequestException('issueDate must be a valid date');
    }

    const expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;
    if (dto.expiryDate) {
      if (Number.isNaN(expiryDate!.getTime())) {
        throw new BadRequestException('expiryDate must be a valid date');
      }
      if (expiryDate! < issueDate) {
        throw new BadRequestException('expiryDate must not be before issueDate');
      }
    }

    const created = await this.prisma.staffCertification.create({
      data: {
        tenantId,
        staffId: staff.id,
        certificationName: dto.certificationName,
        issuingBody: dto.issuingBody,
        issueDate,
        ...(expiryDate ? { expiryDate } : {}),
        ...(dto.certificateNumber ? { certificateNumber: dto.certificateNumber } : {}),
        ...(dto.certificateRef ? { certificateRef: dto.certificateRef } : {}),
        createdBy: actor.id,
        updatedBy: actor.id,
      },
    });

    await this.prisma.staff.update({
      where: { id: staff.id },
      data: { updatedBy: actor.id, version: staff.version + 1 },
    });

    this.emit(PeopleEvents.StaffUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: staff.id,
      version: staff.version + 1,
      changes: { certificationAdded: created.id },
    });

    return singleEnvelope({
      id: created.id,
      certificationName: created.certificationName,
      issuingBody: created.issuingBody,
      issueDate: created.issueDate,
      expiryDate: created.expiryDate,
      certificateNumber: created.certificateNumber,
      certificateRef: created.certificateRef,
      version: created.version,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async updateCertification(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    staffId: string,
    certificationId: string,
    dto: UpdateStaffCertificationDto,
    actor: ActorContext,
  ) {
    const staff = await this.resolveStaff(tenantId, staffId);
    this.assertNested(staff, tenantId, institutionId, personId);
    this.assertVersion(staff.version, dto.version);

    const cert = await this.prisma.staffCertification.findFirst({
      where: { id: certificationId, staffId: staff.id, tenantId, deletedAt: null },
    });
    if (!cert) {
      throw new NotFoundException('Certification not found');
    }

    const issueDate = new Date(dto.issueDate);
    if (Number.isNaN(issueDate.getTime())) {
      throw new BadRequestException('issueDate must be a valid date');
    }

    const expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;
    if (dto.expiryDate) {
      if (Number.isNaN(expiryDate!.getTime())) {
        throw new BadRequestException('expiryDate must be a valid date');
      }
      if (expiryDate! < issueDate) {
        throw new BadRequestException('expiryDate must not be before issueDate');
      }
    }

    const updated = await this.prisma.staffCertification.update({
      where: { id: cert.id },
      data: {
        certificationName: dto.certificationName,
        issuingBody: dto.issuingBody,
        issueDate,
        ...(dto.expiryDate !== undefined ? { expiryDate } : {}),
        ...(dto.certificateNumber !== undefined ? { certificateNumber: dto.certificateNumber } : {}),
        ...(dto.certificateRef !== undefined ? { certificateRef: dto.certificateRef } : {}),
        updatedBy: actor.id,
      },
    });

    const updatedStaff = await this.prisma.staff.update({
      where: { id: staff.id },
      data: { updatedBy: actor.id, version: staff.version + 1 },
    });

    this.emit(PeopleEvents.StaffUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: staff.id,
      version: updatedStaff.version,
      changes: { certificationUpdated: updated.id },
    });

    return singleEnvelope({
      id: updated.id,
      certificationName: updated.certificationName,
      issuingBody: updated.issuingBody,
      issueDate: updated.issueDate,
      expiryDate: updated.expiryDate,
      certificateNumber: updated.certificateNumber,
      certificateRef: updated.certificateRef,
      version: updated.version,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async removeCertification(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    staffId: string,
    certificationId: string,
    dto: { version: number },
    actor: ActorContext,
  ) {
    const staff = await this.resolveStaff(tenantId, staffId);
    this.assertNested(staff, tenantId, institutionId, personId);
    this.assertVersion(staff.version, dto.version);

    const cert = await this.prisma.staffCertification.findFirst({
      where: { id: certificationId, staffId: staff.id, tenantId, deletedAt: null },
    });
    if (!cert) {
      throw new NotFoundException('Certification not found');
    }

    await this.prisma.staffCertification.update({
      where: { id: cert.id },
      data: { deletedAt: new Date(), deletedBy: actor.id },
    });

    const updatedStaff = await this.prisma.staff.update({
      where: { id: staff.id },
      data: { updatedBy: actor.id, version: staff.version + 1 },
    });

    this.emit(PeopleEvents.StaffUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: staff.id,
      version: updatedStaff.version,
      changes: { certificationRemoved: cert.id },
    });

    return singleEnvelope({
      id: cert.id,
      deletedAt: cert.deletedAt,
      version: updatedStaff.version,
    });
  }

  // ---- internals -----------------------------------------------------------

  /**
   * Snapshot current StaffEmploymentDetail into StaffEmploymentHistory when
   * a staff member transitions to SEPARATED (PEOPLE-3 risk mitigation).
   */
  private async snapshotEmploymentHistory(
    tenantId: string,
    staffId: string,
    actorId: string,
  ): Promise<void> {
    const openRow = await this.prisma.staffEmploymentHistory.findFirst({
      where: { tenantId, staffId, endDate: null },
      select: { id: true },
    });
    if (openRow) {
      return;
    }

    const detail = await this.prisma.staffEmploymentDetail.findUnique({
      where: { staffId },
      select: { position: true, department: true },
    });

    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      select: { institutionId: true, hireDate: true },
    });

    if (!detail || !staff) return;

    const institution = await this.prisma.institution.findUnique({
      where: { id: staff.institutionId },
      select: { name: true },
    });

    await this.prisma.staffEmploymentHistory.create({
      data: {
        tenantId,
        staffId,
        institutionName: institution?.name ?? 'Unknown',
        position: detail.position,
        startDate: staff.hireDate,
        endDate: new Date(),
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
  }

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
      const scopeConflict = await tx.staff.findFirst({
        where: { tenantId, institutionId, internalEmail: candidate, deletedAt: null },
        select: { id: true },
      });
      const globalConflict = await tx.staff.findFirst({
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