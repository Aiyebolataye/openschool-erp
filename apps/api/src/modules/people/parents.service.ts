/**
 * PEOPLE-4 Parent management (People spec §5.5/§6.5/§8; V-PA-01..04).
 *
 * Parent is a distinct institution-scoped sub-type of Person (ADR-017, D3).
 * A person may hold one Parent row per institution (schema:
 * `@@unique([tenantId, personId, institutionId])`). Multiple parent/guardian
 * relationships to Students are carried by `person_relationships` (PEOPLE-G
 * §8/D8), never by duplicating the Person.
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
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { currentCorrelationId } from '../../common/interceptors/correlation-id.interceptor';
import { canPatchParentStatus } from './people.lifecycle';
import { PeopleEvents, PeopleEventPayload } from './people.events';
import { CreateParentDto, ListParentsQueryDto, UpdateParentDto } from './dto/parent.dto';

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

type ParentWithPerson = Prisma.ParentGetPayload<{
  include: {
    person: {
      select: { id: true; firstName: true; lastName: true; email: true; publicId: true };
    };
    institution: { select: { id: true; name: true; code: true } };
  };
}>;

@Injectable()
export class ParentsService {
  private readonly logger = new Logger(ParentsService.name);

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

  private async resolveParent(
    tenantId: string,
    id: string,
  ): Promise<ParentWithPerson> {
    if (!isUuid(id)) {
      throw new NotFoundException('Parent record not found');
    }
    const parent = await this.prisma.parent.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        person: {
          select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
        },
        institution: { select: { id: true, name: true, code: true } },
      },
    });
    if (!parent) {
      throw new NotFoundException('Parent record not found');
    }
    return parent;
  }

  private assertNested(
    parent: ParentWithPerson,
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
  ): void {
    if (parent.tenantId !== tenantId || parent.personId !== personId) {
      throw new NotFoundException('Parent record not found');
    }
    if (parent.institutionId !== institutionId) {
      throw new ForbiddenException();
    }
  }

  private async childrenCount(personIds: Iterable<string>): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    const ids = [...personIds];
    if (ids.length === 0) {
      return counts;
    }
    const rows = await this.prisma.personRelationship.findMany({
      where: {
        relationshipType: 'PARENT',
        deletedAt: null,
        OR: [{ sourcePersonId: { in: ids } }, { targetPersonId: { in: ids } }],
      },
      select: { sourcePersonId: true, targetPersonId: true },
    });
    for (const row of rows) {
      counts.set(row.sourcePersonId, (counts.get(row.sourcePersonId) ?? 0) + 1);
      counts.set(row.targetPersonId, (counts.get(row.targetPersonId) ?? 0) + 1);
    }
    return counts;
  }

  private async parentScope(parent: ParentWithPerson) {
    const counts = await this.childrenCount([parent.personId]);
    return {
      id: parent.id,
      personId: parent.personId,
      person: parent.person,
      personName: `${parent.person.firstName} ${parent.person.lastName}`.trim(),
      institutionId: parent.institutionId,
      institution: parent.institution,
      contactPreference: parent.contactPreference,
      status: parent.status,
      childrenCount: counts.get(parent.personId) ?? 0,
      version: parent.version,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
    };
  }

  // ---- list / read ---------------------------------------------------------

  async listParents(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    query: ListParentsQueryDto,
  ) {
    if (!institutionId) {
      throw new ForbiddenException('No institution context for this account');
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const whereBase: Prisma.ParentWhereInput = {
      tenantId,
      institutionId,
      personId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.contactPreference ? { contactPreference: query.contactPreference } : {}),
    };

    let where: Prisma.ParentWhereInput = whereBase;
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

    const [total, parents] = await Promise.all([
      this.prisma.parent.count({ where }),
      this.prisma.parent.findMany({
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

    const counts = await this.childrenCount(parents.map((p) => p.personId));

    return listEnvelope(
      parents.map((p) => ({
        id: p.id,
        personId: p.personId,
        person: p.person,
        personName: `${p.person.firstName} ${p.person.lastName}`.trim(),
        institutionId: p.institutionId,
        institution: p.institution,
        contactPreference: p.contactPreference,
        status: p.status,
        childrenCount: counts.get(p.personId) ?? 0,
        version: p.version,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
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
    const parent = await this.resolveParent(tenantId, id);
    this.assertNested(parent, tenantId, institutionId, personId);
    return singleEnvelope(await this.parentScope(parent));
  }

  // ---- create --------------------------------------------------------------

  async createParent(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    dto: CreateParentDto,
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

    const existing = await this.prisma.parent.findFirst({
      where: { tenantId, personId, institutionId, deletedAt: null },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('A parent record already exists for this person and institution');
    }

    const institution = await this.prisma.institution.findFirst({
      where: { id: institutionId, tenantId },
      select: { id: true },
    });
    if (!institution) {
      throw new BadRequestException('Institution does not exist in this tenant');
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

    let created;
    try {
      created = await this.prisma.$transaction(async (tx) => {
        const parent = await tx.parent.create({
          data: {
            tenantId,
            personId: person.id,
            institutionId: institution.id,
            ...(dto.userId ? { userId: dto.userId } : {}),
            contactPreference: dto.contactPreference ?? 'EMAIL',
            status: 'ACTIVE',
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
              roleContext: 'PARENT',
            },
          },
          update: { deletedAt: null, deletedBy: null, updatedBy: actor.id },
          create: {
            tenantId,
            personId: person.id,
            institutionId: institution.id,
            roleContext: 'PARENT',
            assignedBy: actor.id,
            createdBy: actor.id,
            updatedBy: actor.id,
          },
        });

        return parent;
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('A parent record already exists for this person and institution');
      }
      throw err;
    }

    this.emit(PeopleEvents.ParentCreated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: created.id,
      version: 1,
    });

    return singleEnvelope(await this.resolveParent(tenantId, created.id).then((p) => this.parentScope(p)));
  }

  // ---- update --------------------------------------------------------------

  async updateParent(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: UpdateParentDto,
    actor: ActorContext,
  ) {
    const parent = await this.resolveParent(tenantId, id);
    this.assertNested(parent, tenantId, institutionId, personId);
    this.assertVersion(parent.version, dto.version);

    const data: Prisma.ParentUpdateInput = {
      updatedBy: actor.id,
      version: parent.version + 1,
    };
    if (dto.contactPreference !== undefined) data.contactPreference = dto.contactPreference;
    if (dto.status !== undefined) {
      if (!canPatchParentStatus(parent.status, dto.status)) {
        throw new ConflictException(
          `A ${parent.status} parent record cannot be moved to ${dto.status} via this endpoint`,
        );
      }
      data.status = dto.status;
    }
    if (dto.userId !== undefined) {
      const user = await this.prisma.user.findFirst({
        where: { id: dto.userId, tenantId, deletedAt: null },
        select: { id: true },
      });
      if (!user) {
        throw new BadRequestException('The specified userId does not belong to a user in this tenant');
      }
      data.user = { connect: { id: dto.userId } };
    }

    const updated = await this.prisma.parent.update({
      where: { id: parent.id },
      data,
      include: {
        person: {
          select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
        },
        institution: { select: { id: true, name: true, code: true } },
      },
    });

    this.emit(PeopleEvents.ParentUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
      changes: { status: dto.status, contactPreference: dto.contactPreference } as Record<string, unknown>,
    });

    return singleEnvelope(await this.parentScope(updated));
  }

  // ---- soft delete ---------------------------------------------------------

  async softDeleteParent(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    actor: ActorContext,
  ) {
    const parent = await this.resolveParent(tenantId, id);
    this.assertNested(parent, tenantId, institutionId, personId);

    const updated = await this.prisma.parent.update({
      where: { id: parent.id },
      data: {
        deletedAt: new Date(),
        deletedBy: actor.id,
        updatedBy: actor.id,
        version: parent.version + 1,
      },
    });

    // Frozen §5.8 defines no Parent "deleted" event; soft delete is observable
    // via deleted_at/deleted_by lineage (mirrors PEOPLE-2 student soft delete).
    return singleEnvelope({
      id: updated.id,
      personId: updated.personId,
      deletedAt: updated.deletedAt,
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

