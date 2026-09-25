import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, PersonStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizeEmail } from '../identity/identity.utils';
import { currentCorrelationId } from '../../common/interceptors/correlation-id.interceptor';
import {
  generatePublicId,
  isValidPublicId,
  nextPublicIdSequence,
} from './people.utils';
import { PeopleEvents, PeopleEventPayload } from './people.events';
import {
  CreatePersonDto,
  InstitutionAssignmentDto,
  ListPeopleQueryDto,
  PersonProfileDto,
  UpdatePersonDto,
} from './dto/person.dto';
import { UploadProfilePhotoDto } from './dto/photo.dto';

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

@Injectable()
export class PersonsService {
  private readonly logger = new Logger(PersonsService.name);

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

  /**
   * Resolve a person id from a UUID or tenant-scoped public ID (P-YYYY-NNNNNN).
   * Respects soft delete unless `includeDeleted` is set (restore flow).
   */
  private async resolvePerson(
    tenantId: string,
    id: string,
    includeDeleted = false,
  ) {
    const where = isUuid(id) ? { id } : { publicId: id };
    const person = await this.prisma.person.findFirst({
      where: { ...where, tenantId, ...(includeDeleted ? {} : { deletedAt: null }) },
      include: {
        profile: true,
        personInstitutions: {
          where: { deletedAt: null },
          include: { institution: { select: { id: true, name: true, code: true } } },
          orderBy: { assignedAt: 'asc' },
        },
      },
    });
    if (!person) {
      throw new NotFoundException('Person not found');
    }
    return person;
  }

  private personScope(person: {
    id: string;
    publicId: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    email: string;
    phone: string | null;
    dateOfBirth: Date | null;
    gender: string;
    bloodGroup: string | null;
    stateOfOrigin: string | null;
    address: string | null;
    status: PersonStatus;
    isActive: boolean;
    profilePhotoRef: string | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    profile?: {
      bio: string | null;
      customFields: Prisma.JsonValue | null;
      metadata: Prisma.JsonValue | null;
    } | null;
    personInstitutions?: Array<{
      institutionId: string;
      roleContext: string;
      assignedAt: Date;
      institution: { id: string; name: string; code: string };
    }>;
  }) {
    return {
      id: person.id,
      publicId: person.publicId,
      firstName: person.firstName,
      middleName: person.middleName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      dateOfBirth: person.dateOfBirth,
      gender: person.gender,
      bloodGroup: person.bloodGroup,
      stateOfOrigin: person.stateOfOrigin,
      address: person.address,
      status: person.status,
      isActive: person.isActive,
      profilePhotoUrl: person.profilePhotoRef,
      profile: person.profile
        ? {
            bio: person.profile.bio,
            customFields: person.profile.customFields,
            metadata: person.profile.metadata,
          }
        : null,
      institutions: (person.personInstitutions ?? []).map((pi) => ({
        institutionId: pi.institutionId,
        roleContext: pi.roleContext,
        assignedAt: pi.assignedAt,
        institution: pi.institution,
      })),
      institutionCount: person.personInstitutions?.length ?? 0,
      version: person.version,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
    };
  }

  // ---- list / search (D-D: bounded, deterministic, indexed) ----------------

  async list(tenantId: string, query: ListPeopleQueryDto) {
    return this.findMany(tenantId, query);
  }

  async search(tenantId: string, query: ListPeopleQueryDto) {
    return this.findMany(tenantId, query);
  }

  private async findMany(tenantId: string, query: ListPeopleQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortField = query.sortBy === 'updated_at' ? 'updatedAt' : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const whereBase: Prisma.PersonWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    let where: Prisma.PersonWhereInput = whereBase;
    const search = query.search?.trim();

    if (search) {
      const mode = query.searchMode === 'exact' ? 'exact' : 'fuzzy';
      if (mode === 'exact') {
        where = {
          ...whereBase,
          OR: [{ email: search }, { publicId: search }],
        };
      } else {
        where = {
          ...whereBase,
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { middleName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            ...(isValidPublicId(search) ? [{ publicId: search }] : []),
          ],
        };
      }
    }

    const [total, people] = await Promise.all([
      this.prisma.person.count({ where }),
      this.prisma.person.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          personInstitutions: {
            where: { deletedAt: null },
            select: { institutionId: true },
          },
        },
      }),
    ]);

    return listEnvelope(
      people.map((p) => ({
        id: p.id,
        publicId: p.publicId,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        status: p.status,
        isActive: p.isActive,
        institutionCount: p.personInstitutions.length,
        version: p.version,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      total,
      page,
      limit,
    );
  }

  async findOne(tenantId: string, id: string) {
    const person = await this.resolvePerson(tenantId, id);
    return singleEnvelope(this.personScope(person));
  }

  // ---- create / update / soft-delete / restore -----------------------------

  async create(tenantId: string, dto: CreatePersonDto, actor: ActorContext) {
    const email = normalizeEmail(dto.email);

    const existing = await this.prisma.person.findFirst({
      where: { tenantId, email, deletedAt: null },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('A person with this email already exists in this tenant');
    }

    const dateOfBirth = new Date(dto.dateOfBirth);
    if (Number.isNaN(dateOfBirth.getTime())) {
      throw new BadRequestException('dateOfBirth must be a valid date');
    }
    if (dateOfBirth.getTime() > Date.now()) {
      throw new BadRequestException('dateOfBirth cannot be in the future');
    }

    const data: Omit<Prisma.PersonCreateInput, 'publicId'> = {
      tenant: { connect: { id: tenantId } },
      firstName: dto.firstName,
      lastName: dto.lastName,
      ...(dto.middleName ? { middleName: dto.middleName } : {}),
      email,
      ...(dto.phone ? { phone: dto.phone } : {}),
      dateOfBirth,
      gender: dto.gender,
      ...(dto.bloodGroup ? { bloodGroup: dto.bloodGroup } : {}),
      ...(dto.stateOfOrigin ? { stateOfOrigin: dto.stateOfOrigin } : {}),
      ...(dto.address ? { address: dto.address } : {}),
      status: dto.status ?? 'ACTIVE',
      isActive: dto.isActive ?? true,
      ...(dto.profilePhotoRef ? { profilePhotoRef: dto.profilePhotoRef } : {}),
      createdBy: actor.id,
      updatedBy: actor.id,
    };

    let person;
    try {
      person = await this.prisma.$transaction(async (tx) => {
        const existingIds = await tx.person.findMany({
          where: { tenantId },
          select: { publicId: true },
        });
        const sequence = nextPublicIdSequence(
          'P',
          existingIds.map((p) => p.publicId),
        );
        return tx.person.create({
          data: {
            ...data,
            publicId: generatePublicId('P', sequence),
          },
        });
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('A person with this email already exists in this tenant');
      }
      throw err;
    }

    this.emit(PeopleEvents.PersonCreated, {
      ...this.eventBase(tenantId, actor),
      personId: person.id,
      entityId: person.id,
      version: person.version,
    });

    return singleEnvelope(this.personScope(person));
  }

  async update(tenantId: string, id: string, dto: UpdatePersonDto, actor: ActorContext) {
    const person = await this.resolvePerson(tenantId, id);

    this.assertVersion(person.version, dto.version);

    const data: Prisma.PersonUpdateInput = {
      updatedBy: actor.id,
      version: person.version + 1,
    };
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.middleName !== undefined) data.middleName = dto.middleName;
    if (dto.email !== undefined) {
      const email = normalizeEmail(dto.email);
      const existing = await this.prisma.person.findFirst({
        where: { tenantId, email, deletedAt: null, id: { not: person.id } },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictException('A person with this email already exists in this tenant');
      }
      data.email = email;
    }
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.dateOfBirth !== undefined) {
      const dateOfBirth = new Date(dto.dateOfBirth);
      if (Number.isNaN(dateOfBirth.getTime())) {
        throw new BadRequestException('dateOfBirth must be a valid date');
      }
      if (dateOfBirth.getTime() > Date.now()) {
        throw new BadRequestException('dateOfBirth cannot be in the future');
      }
      data.dateOfBirth = dateOfBirth;
    }
    if (dto.gender !== undefined) data.gender = dto.gender;
    if (dto.bloodGroup !== undefined) data.bloodGroup = dto.bloodGroup;
    if (dto.stateOfOrigin !== undefined) data.stateOfOrigin = dto.stateOfOrigin;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.profilePhotoRef !== undefined) data.profilePhotoRef = dto.profilePhotoRef;

    const updated = await this.prisma.person.update({
      where: { id: person.id },
      data,
      include: {
        profile: true,
        personInstitutions: {
          where: { deletedAt: null },
          include: { institution: { select: { id: true, name: true, code: true } } },
          orderBy: { assignedAt: 'asc' },
        },
      },
    });

    this.emit(PeopleEvents.PersonUpdated, {
      ...this.eventBase(tenantId, actor),
      personId: updated.id,
      entityId: updated.id,
      version: updated.version,
    });

    return singleEnvelope(this.personScope(updated));
  }

  async softDelete(tenantId: string, id: string, actor: ActorContext) {
    const person = await this.resolvePerson(tenantId, id);
    const updated = await this.prisma.person.update({
      where: { id: person.id },
      data: {
        deletedAt: new Date(),
        deletedBy: actor.id,
        isActive: false,
        updatedBy: actor.id,
        version: person.version + 1,
      },
      include: {
        personInstitutions: {
          where: { deletedAt: null },
          select: { institutionId: true },
        },
      },
    });

    this.emit(PeopleEvents.PersonSoftDeleted, {
      ...this.eventBase(tenantId, actor),
      personId: updated.id,
      entityId: updated.id,
      version: updated.version,
    });

    return singleEnvelope({
      id: updated.id,
      publicId: updated.publicId,
      status: updated.status,
      isActive: updated.isActive,
      deletedAt: updated.deletedAt,
      version: updated.version,
    });
  }

  async restore(tenantId: string, id: string, actor: ActorContext) {
    const person = await this.resolvePerson(tenantId, id, true);
    if (!person.deletedAt) {
      throw new ConflictException('Person is not soft-deleted');
    }

    const updated = await this.prisma.person.update({
      where: { id: person.id },
      data: {
        deletedAt: null,
        deletedBy: null,
        isActive: true,
        updatedBy: actor.id,
        version: person.version + 1,
      },
      include: {
        profile: true,
        personInstitutions: {
          where: { deletedAt: null },
          include: { institution: { select: { id: true, name: true, code: true } } },
          orderBy: { assignedAt: 'asc' },
        },
      },
    });

    this.emit(PeopleEvents.PersonRestored, {
      ...this.eventBase(tenantId, actor),
      personId: updated.id,
      entityId: updated.id,
      version: updated.version,
    });

    return singleEnvelope(this.personScope(updated));
  }

  // ---- profile -------------------------------------------------------------

  async getProfile(tenantId: string, personId: string) {
    const person = await this.resolvePerson(tenantId, personId);
    return singleEnvelope({
      personId: person.id,
      publicId: person.publicId,
      profilePhotoUrl: person.profilePhotoRef,
      bio: person.profile?.bio ?? null,
      customFields: person.profile?.customFields ?? null,
      metadata: person.profile?.metadata ?? null,
    });
  }

  async updateProfile(tenantId: string, personId: string, dto: PersonProfileDto, actor: ActorContext) {
    const person = await this.resolvePerson(tenantId, personId);

    const profile = await this.prisma.personProfile.upsert({
      where: { personId: person.id },
      create: {
        tenantId,
        personId: person.id,
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.customFields !== undefined
          ? { customFields: dto.customFields as Prisma.InputJsonObject }
          : {}),
        ...(dto.metadata !== undefined
          ? { metadata: dto.metadata as Prisma.InputJsonObject }
          : {}),
        createdBy: actor.id,
        updatedBy: actor.id,
      },
      update: {
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.customFields !== undefined
          ? { customFields: dto.customFields as Prisma.InputJsonObject }
          : {}),
        ...(dto.metadata !== undefined
          ? { metadata: dto.metadata as Prisma.InputJsonObject }
          : {}),
        updatedBy: actor.id,
        version: { increment: 1 },
      },
    });

    this.emit(PeopleEvents.PersonUpdated, {
      ...this.eventBase(tenantId, actor),
      personId: person.id,
      entityId: person.id,
      version: person.version,
    });

    return singleEnvelope({
      personId: profile.personId,
      bio: profile.bio,
      customFields: profile.customFields,
      metadata: profile.metadata,
      version: profile.version,
    });
  }

  // ---- profile photo (reference-only; §5.9 assumption 7) --------------------

  async uploadPhoto(
    tenantId: string,
    personId: string,
    dto: UploadProfilePhotoDto,
    actor: ActorContext,
  ) {
    const person = await this.resolvePerson(tenantId, personId);

    const updated = await this.prisma.person.update({
      where: { id: person.id },
      data: {
        profilePhotoRef: dto.fileReference,
        updatedBy: actor.id,
        version: person.version + 1,
      },
    });

    // §5.8 defines no dedicated photo event; profile mutations re-emit
    // PersonUpdated (persons.service profile-put precedent).
    this.emit(PeopleEvents.PersonUpdated, {
      ...this.eventBase(tenantId, actor),
      personId: person.id,
      entityId: person.id,
      version: updated.version,
      changes: {
        profilePhotoUploaded: {
          fileReference: dto.fileReference,
          mimeType: dto.mimeType ?? null,
          fileSize: dto.fileSize ?? null,
        },
      } as Record<string, unknown>,
    });

    return singleEnvelope({
      personId: person.id,
      profilePhotoRef: updated.profilePhotoRef,
      version: updated.version,
    });
  }

  async removePhoto(tenantId: string, personId: string, actor: ActorContext) {
    const person = await this.resolvePerson(tenantId, personId);

    const updated = await this.prisma.person.update({
      where: { id: person.id },
      data: { profilePhotoRef: null, updatedBy: actor.id, version: person.version + 1 },
    });

    this.emit(PeopleEvents.PersonUpdated, {
      ...this.eventBase(tenantId, actor),
      personId: person.id,
      entityId: person.id,
      version: updated.version,
      changes: { profilePhotoRemoved: { previousReference: person.profilePhotoRef } } as Record<string, unknown>,
    });

    return singleEnvelope({
      personId: person.id,
      profilePhotoRef: updated.profilePhotoRef,
      version: updated.version,
    });
  }

  // ---- institution assignments ---------------------------------------------

  async listInstitutions(tenantId: string, personId: string) {
    const person = await this.resolvePerson(tenantId, personId);

    const page = 1;
    const limit = 100;
    const [total, items] = await Promise.all([
      this.prisma.personInstitution.count({
        where: { tenantId, personId: person.id, deletedAt: null },
      }),
      this.prisma.personInstitution.findMany({
        where: { tenantId, personId: person.id, deletedAt: null },
        include: { institution: { select: { id: true, name: true, code: true } } },
        orderBy: { assignedAt: 'asc' },
      }),
    ]);

    return listEnvelope(
      items.map((pi) => ({
        id: pi.id,
        institutionId: pi.institutionId,
        roleContext: pi.roleContext,
        assignedAt: pi.assignedAt,
        assignedBy: pi.assignedBy,
        institution: pi.institution,
      })),
      total,
      page,
      limit,
    );
  }

  async assignInstitution(
    tenantId: string,
    personId: string,
    dto: InstitutionAssignmentDto,
    actor: ActorContext,
  ) {
    const person = await this.resolvePerson(tenantId, personId);

    const institution = await this.prisma.institution.findFirst({
      where: { id: dto.institutionId, tenantId },
      select: { id: true },
    });
    if (!institution) {
      throw new BadRequestException('Institution does not exist in this tenant');
    }

    const existing = await this.prisma.personInstitution.findFirst({
      where: {
        tenantId,
        personId: person.id,
        institutionId: institution.id,
        roleContext: dto.roleContext,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Person is already assigned to this institution role');
    }

    const assignment = await this.prisma.personInstitution.create({
      data: {
        tenantId,
        personId: person.id,
        institutionId: institution.id,
        roleContext: dto.roleContext,
        assignedBy: actor.id,
        createdBy: actor.id,
        updatedBy: actor.id,
      },
      include: { institution: { select: { id: true, name: true, code: true } } },
    });

    this.emit(PeopleEvents.PersonUpdated, {
      ...this.eventBase(tenantId, actor),
      personId: person.id,
      entityId: assignment.id,
      version: person.version,
    });

    return singleEnvelope({
      id: assignment.id,
      institutionId: assignment.institutionId,
      roleContext: assignment.roleContext,
      assignedAt: assignment.assignedAt,
      institution: assignment.institution,
    });
  }

  async removeInstitution(tenantId: string, personId: string, institutionId: string, actor: ActorContext) {
    const person = await this.resolvePerson(tenantId, personId);

    const assignment = await this.prisma.personInstitution.findFirst({
      where: {
        tenantId,
        personId: person.id,
        institutionId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!assignment) {
      throw new NotFoundException('Institution assignment not found');
    }

    const removed = await this.prisma.personInstitution.update({
      where: { id: assignment.id },
      data: { deletedAt: new Date(), deletedBy: actor.id, updatedBy: actor.id },
    });

    this.emit(PeopleEvents.PersonUpdated, {
      ...this.eventBase(tenantId, actor),
      personId: person.id,
      entityId: removed.id,
      version: person.version,
    });

    return singleEnvelope({ id: removed.id, removedAt: removed.deletedAt });
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