/**
 * PEOPLE-4 Guardian management (People spec §5.6/§6.6/§9; V-G-01..05).
 *
 * Guardian is a distinct institution-scoped sub-type of Person (ADR-017, D3).
 * A person may hold one Guardian row per institution (schema:
 * `@@unique([tenantId, personId, institutionId])`). `legalGuardianshipRef` is a
 * client-required reference (I-09 / BR-09) to a guardianship document; the DB
 * column is nullable and the free-text/file reference is a PII-free pointer.
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
import { canPatchGuardianStatus } from './people.lifecycle';
import { PeopleEvents, PeopleEventPayload } from './people.events';
import { CreateGuardianDto, ListGuardiansQueryDto, UpdateGuardianDto } from './dto/guardian.dto';

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

type GuardianWithPerson = Prisma.GuardianGetPayload<{
  include: {
    person: {
      select: { id: true; firstName: true; lastName: true; email: true; publicId: true };
    };
    institution: { select: { id: true; name: true; code: true } };
  };
}>;

@Injectable()
export class GuardiansService {
  private readonly logger = new Logger(GuardiansService.name);

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

  private async resolveGuardian(
    tenantId: string,
    id: string,
  ): Promise<GuardianWithPerson> {
    if (!isUuid(id)) {
      throw new NotFoundException('Guardian record not found');
    }
    const guardian = await this.prisma.guardian.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        person: {
          select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
        },
        institution: { select: { id: true, name: true, code: true } },
      },
    });
    if (!guardian) {
      throw new NotFoundException('Guardian record not found');
    }
    return guardian;
  }

  private assertNested(
    guardian: GuardianWithPerson,
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
  ): void {
    if (guardian.tenantId !== tenantId || guardian.personId !== personId) {
      throw new NotFoundException('Guardian record not found');
    }
    if (guardian.institutionId !== institutionId) {
      throw new ForbiddenException();
    }
  }

  private async wardsCount(personIds: Iterable<string>): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    const ids = [...personIds];
    if (ids.length === 0) {
      return counts;
    }
    const rows = await this.prisma.personRelationship.findMany({
      where: {
        relationshipType: 'GUARDIAN',
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

  private async guardianScope(guardian: GuardianWithPerson) {
    const counts = await this.wardsCount([guardian.personId]);
    return {
      id: guardian.id,
      personId: guardian.personId,
      person: guardian.person,
      personName: `${guardian.person.firstName} ${guardian.person.lastName}`.trim(),
      institutionId: guardian.institutionId,
      institution: guardian.institution,
      contactPreference: guardian.contactPreference,
      legalGuardianshipRef: guardian.legalGuardianshipRef,
      status: guardian.status,
      wardsCount: counts.get(guardian.personId) ?? 0,
      version: guardian.version,
      createdAt: guardian.createdAt,
      updatedAt: guardian.updatedAt,
    };
  }

  // ---- list / read ---------------------------------------------------------

  async listGuardians(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    query: ListGuardiansQueryDto,
  ) {
    if (!institutionId) {
      throw new ForbiddenException('No institution context for this account');
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const whereBase: Prisma.GuardianWhereInput = {
      tenantId,
      institutionId,
      personId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.contactPreference ? { contactPreference: query.contactPreference } : {}),
    };

    let where: Prisma.GuardianWhereInput = whereBase;
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

    const [total, guardians] = await Promise.all([
      this.prisma.guardian.count({ where }),
      this.prisma.guardian.findMany({
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

    const counts = await this.wardsCount(guardians.map((g) => g.personId));

    return listEnvelope(
      guardians.map((g) => ({
        id: g.id,
        personId: g.personId,
        person: g.person,
        personName: `${g.person.firstName} ${g.person.lastName}`.trim(),
        institutionId: g.institutionId,
        institution: g.institution,
        contactPreference: g.contactPreference,
        legalGuardianshipRef: g.legalGuardianshipRef,
        status: g.status,
        wardsCount: counts.get(g.personId) ?? 0,
        version: g.version,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
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
    const guardian = await this.resolveGuardian(tenantId, id);
    this.assertNested(guardian, tenantId, institutionId, personId);
    return singleEnvelope(await this.guardianScope(guardian));
  }

  // ---- create --------------------------------------------------------------

  async createGuardian(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    dto: CreateGuardianDto,
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

    const existing = await this.prisma.guardian.findFirst({
      where: { tenantId, personId, institutionId, deletedAt: null },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('A guardian record already exists for this person and institution');
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
        const guardian = await tx.guardian.create({
          data: {
            tenantId,
            personId: person.id,
            institutionId: institution.id,
            ...(dto.userId ? { userId: dto.userId } : {}),
            legalGuardianshipRef: dto.legalGuardianshipRef,
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
              roleContext: 'GUARDIAN',
            },
          },
          update: { deletedAt: null, deletedBy: null, updatedBy: actor.id },
          create: {
            tenantId,
            personId: person.id,
            institutionId: institution.id,
            roleContext: 'GUARDIAN',
            assignedBy: actor.id,
            createdBy: actor.id,
            updatedBy: actor.id,
          },
        });

        return guardian;
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('A guardian record already exists for this person and institution');
      }
      throw err;
    }

    this.emit(PeopleEvents.GuardianCreated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: created.id,
      version: 1,
    });

    return singleEnvelope(
      await this.resolveGuardian(tenantId, created.id).then((g) => this.guardianScope(g)),
    );
  }

  // ---- update --------------------------------------------------------------

  async updateGuardian(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: UpdateGuardianDto,
    actor: ActorContext,
  ) {
    const guardian = await this.resolveGuardian(tenantId, id);
    this.assertNested(guardian, tenantId, institutionId, personId);
    this.assertVersion(guardian.version, dto.version);

    const data: Prisma.GuardianUpdateInput = {
      updatedBy: actor.id,
      version: guardian.version + 1,
    };
    if (dto.legalGuardianshipRef !== undefined) data.legalGuardianshipRef = dto.legalGuardianshipRef;
    if (dto.contactPreference !== undefined) data.contactPreference = dto.contactPreference;
    if (dto.status !== undefined) {
      if (!canPatchGuardianStatus(guardian.status, dto.status)) {
        throw new ConflictException(
          `A ${guardian.status} guardian record cannot be moved to ${dto.status} via this endpoint`,
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

    const updated = await this.prisma.guardian.update({
      where: { id: guardian.id },
      data,
      include: {
        person: {
          select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
        },
        institution: { select: { id: true, name: true, code: true } },
      },
    });

    this.emit(PeopleEvents.GuardianUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
      changes: {
        status: dto.status,
        contactPreference: dto.contactPreference,
        legalGuardianshipRef: dto.legalGuardianshipRef,
      } as Record<string, unknown>,
    });

    return singleEnvelope(await this.guardianScope(updated));
  }

  // ---- soft delete ---------------------------------------------------------

  async softDeleteGuardian(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    actor: ActorContext,
  ) {
    const guardian = await this.resolveGuardian(tenantId, id);
    this.assertNested(guardian, tenantId, institutionId, personId);

    const updated = await this.prisma.guardian.update({
      where: { id: guardian.id },
      data: {
        deletedAt: new Date(),
        deletedBy: actor.id,
        updatedBy: actor.id,
        version: guardian.version + 1,
      },
    });

    // Frozen §5.8 defines no Guardian "deleted" event; soft delete is observable
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