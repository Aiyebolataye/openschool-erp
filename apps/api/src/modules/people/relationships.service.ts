/**
 * PEOPLE-4 Person relationships (People spec §5.4/§6.2/§6.2a; BR-08/BR-017,
 * V-PR-01..07, I-08, I-017).
 *
 * Relationships are **bidirectional but stored as a single canonical row**
 * (ADR-021, D7): reads resolve involvement from either endpoint via
 * `OR source/target = person`; creating the reverse pair of an existing row is
 * a duplicate → 409. There is no status enum — "Expired" is derived from
 * endDate; DELETE revokes (soft delete). Source person must differ from target
 * (I-017 → 400); endDate must be ≥ startDate (I-08 → 400).
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
import { Prisma, RelationshipType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { currentCorrelationId } from '../../common/interceptors/correlation-id.interceptor';
import { isValidTemporalBounds } from './people.lifecycle';
import { PeopleEvents, PeopleEventPayload } from './people.events';
import { CreateRelationshipDto, ListRelationshipsQueryDto, UpdateRelationshipDto } from './dto/relationship.dto';

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

const PERSON_SUMMARY = {
  select: { id: true, firstName: true, lastName: true, email: true, publicId: true },
} as const;

type RelWithPeople = Prisma.PersonRelationshipGetPayload<{
  include: {
    sourcePerson: typeof PERSON_SUMMARY;
    targetPerson: typeof PERSON_SUMMARY;
  };
}>;

@Injectable()
export class RelationshipsService {
  private readonly logger = new Logger(RelationshipsService.name);

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

  private async resolveRelationship(
    tenantId: string,
    institutionId: string | undefined,
    id: string,
  ): Promise<RelWithPeople> {
    if (!isUuid(id)) {
      throw new NotFoundException('Relationship not found');
    }
    if (!institutionId) {
      throw new ForbiddenException('No institution context for this account');
    }
    const rel = await this.prisma.personRelationship.findFirst({
      where: { id, tenantId, institutionId, deletedAt: null },
      include: { sourcePerson: PERSON_SUMMARY, targetPerson: PERSON_SUMMARY },
    });
    if (!rel) {
      throw new NotFoundException('Relationship not found');
    }
    return rel;
  }

  private assertInvolvement(
    rel: RelWithPeople,
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
  ): void {
    if (
      rel.tenantId !== tenantId ||
      rel.institutionId !== institutionId ||
      (rel.sourcePersonId !== personId && rel.targetPersonId !== personId)
    ) {
      throw new NotFoundException('Relationship not found');
    }
  }

  private async relationshipScope(rel: RelWithPeople) {
    return {
      id: rel.id,
      sourcePersonId: rel.sourcePersonId,
      sourcePerson: rel.sourcePerson,
      sourcePersonName: `${rel.sourcePerson.firstName} ${rel.sourcePerson.lastName}`.trim(),
      targetPersonId: rel.targetPersonId,
      targetPerson: rel.targetPerson,
      targetPersonName: `${rel.targetPerson.firstName} ${rel.targetPerson.lastName}`.trim(),
      relationshipType: rel.relationshipType,
      startDate: rel.startDate,
      endDate: rel.endDate,
      isActive: rel.isActive,
      institutionId: rel.institutionId,
      metadata: rel.metadata,
      version: rel.version,
      createdAt: rel.createdAt,
      updatedAt: rel.updatedAt,
    };
  }

  private async activePerson(tenantId: string, personId: string): Promise<boolean> {
    const person = await this.prisma.person.findFirst({
      where: { tenantId, id: personId, deletedAt: null },
      select: { id: true },
    });
    return person !== null;
  }

  private async assertPairFree(
    tenantId: string,
    institutionId: string,
    sourceId: string,
    targetId: string,
    type: RelationshipType,
    excludeId?: string,
  ): Promise<void> {
    const dup = await this.prisma.personRelationship.findFirst({
      where: {
        tenantId,
        institutionId,
        relationshipType: type,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        OR: [
          { sourcePersonId: sourceId, targetPersonId: targetId },
          { sourcePersonId: targetId, targetPersonId: sourceId },
        ],
      },
      select: { id: true },
    });
    if (dup) {
      throw new ConflictException(
        'A relationship of this type already exists between these two persons within the institution (bidirectional single-row model — reverse direction is the same relationship)',
      );
    }
  }

  // ---- list / read ---------------------------------------------------------

  async listRelationships(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    query: ListRelationshipsQueryDto,
  ) {
    if (!institutionId) {
      throw new ForbiddenException('No institution context for this account');
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.PersonRelationshipWhereInput = {
      tenantId,
      institutionId,
      deletedAt: null,
      ...(query.relationshipType ? { relationshipType: query.relationshipType } : {}),
      OR: [{ sourcePersonId: personId }, { targetPersonId: personId }],
    };

    const [total, rels] = await Promise.all([
      this.prisma.personRelationship.count({ where }),
      this.prisma.personRelationship.findMany({
        where,
        include: { sourcePerson: PERSON_SUMMARY, targetPerson: PERSON_SUMMARY },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return listEnvelope(await Promise.all(rels.map((r) => this.relationshipScope(r))), total, page, limit);
  }

  async findOne(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
  ) {
    const rel = await this.resolveRelationship(tenantId, institutionId, id);
    this.assertInvolvement(rel, tenantId, institutionId, personId);
    return singleEnvelope(await this.relationshipScope(rel));
  }

  // ---- create --------------------------------------------------------------

  async createRelationship(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    dto: CreateRelationshipDto,
    actor: ActorContext,
  ) {
    if (!institutionId) {
      throw new ForbiddenException('No institution context for this account');
    }
    if (personId === dto.targetPersonId) {
      throw new BadRequestException('A person cannot have a relationship with themselves (I-017)');
    }
    if (!isValidTemporalBounds(dto.startDate, dto.endDate)) {
      throw new BadRequestException('endDate must be greater than or equal to startDate (I-08)');
    }

    if (!(await this.activePerson(tenantId, personId))) {
      throw new NotFoundException('Source person not found');
    }
    if (!(await this.activePerson(tenantId, dto.targetPersonId))) {
      throw new NotFoundException('Target person not found');
    }

    await this.assertPairFree(tenantId, institutionId, personId, dto.targetPersonId, dto.relationshipType);

    let created;
    try {
      created = await this.prisma.personRelationship.create({
        data: {
          tenantId,
          institutionId,
          sourcePersonId: personId,
          targetPersonId: dto.targetPersonId,
          relationshipType: dto.relationshipType,
          startDate: new Date(dto.startDate),
          ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
          isActive: true,
          ...(dto.metadata ? { metadata: this.toJsonValue(dto.metadata) } : {}),
          createdBy: actor.id,
          updatedBy: actor.id,
        },
        include: { sourcePerson: PERSON_SUMMARY, targetPerson: PERSON_SUMMARY },
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException(
          'A relationship of this type already exists between these two persons within the institution (bidirectional single-row model — reverse direction is the same relationship)',
        );
      }
      throw err;
    }

    this.emit(PeopleEvents.PersonRelationshipCreated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: created.id,
      version: created.version,
    });

    return singleEnvelope(await this.relationshipScope(created));
  }

  // ---- update --------------------------------------------------------------

  async updateRelationship(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    dto: UpdateRelationshipDto,
    actor: ActorContext,
  ) {
    if (!institutionId) {
      throw new ForbiddenException('No institution context for this account');
    }
    const rel = await this.resolveRelationship(tenantId, institutionId, id);
    this.assertInvolvement(rel, tenantId, institutionId, personId);
    this.assertVersion(rel.version, dto.version);

    const nextTarget = dto.targetPersonId ?? rel.targetPersonId;
    if (rel.sourcePersonId === nextTarget) {
      throw new BadRequestException('A person cannot have a relationship with themselves (I-017)');
    }

    const nextStart = dto.startDate ?? rel.startDate.toISOString();
    const nextEnd = dto.endDate !== undefined ? dto.endDate : rel.endDate ? rel.endDate.toISOString() : undefined;
    if (!isValidTemporalBounds(nextStart, nextEnd)) {
      throw new BadRequestException('endDate must be greater than or equal to startDate (I-08)');
    }

    if (nextTarget !== rel.targetPersonId || dto.relationshipType !== undefined) {
      const nextType = dto.relationshipType ?? rel.relationshipType;
      if (nextTarget !== rel.targetPersonId || nextType !== rel.relationshipType) {
        await this.assertPairFree(tenantId, institutionId, rel.sourcePersonId, nextTarget, nextType, rel.id);
      }
    }

    if (nextTarget !== rel.targetPersonId && !(await this.activePerson(tenantId, nextTarget))) {
      throw new NotFoundException('Target person not found');
    }

    const data: Prisma.PersonRelationshipUpdateInput = {
      ...(dto.targetPersonId !== undefined ? { targetPersonId: nextTarget } : {}),
      ...(dto.relationshipType !== undefined ? { relationshipType: dto.relationshipType } : {}),
      ...(dto.startDate !== undefined ? { startDate: new Date(dto.startDate) } : {}),
      ...(dto.endDate !== undefined ? { endDate: dto.endDate ? new Date(dto.endDate) : null } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.metadata !== undefined ? { metadata: this.toJsonValue(dto.metadata) } : {}),
      updatedBy: actor.id,
      version: rel.version + 1,
    };

    const updated = await this.prisma.personRelationship.update({
      where: { id: rel.id },
      data,
      include: { sourcePerson: PERSON_SUMMARY, targetPerson: PERSON_SUMMARY },
    });

    this.emit(PeopleEvents.PersonRelationshipUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
      changes: {
        relationshipType: dto.relationshipType,
        targetPersonId: dto.targetPersonId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        isActive: dto.isActive,
      } as Record<string, unknown>,
    });

    return singleEnvelope(await this.relationshipScope(updated));
  }

  // ---- revoke (soft delete; derived "Expired" via endDate) -----------------

  async revokeRelationship(
    tenantId: string,
    institutionId: string | undefined,
    personId: string,
    id: string,
    actor: ActorContext,
  ) {
    const rel = await this.resolveRelationship(tenantId, institutionId, id);
    this.assertInvolvement(rel, tenantId, institutionId, personId);

    const updated = await this.prisma.personRelationship.update({
      where: { id: rel.id },
      data: {
        deletedAt: new Date(),
        deletedBy: actor.id,
        isActive: false,
        updatedBy: actor.id,
        version: rel.version + 1,
      },
    });

    this.emit(PeopleEvents.PersonRelationshipRevoked, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
    });

    return singleEnvelope({
      id: updated.id,
      sourcePersonId: updated.sourcePersonId,
      targetPersonId: updated.targetPersonId,
      relationshipType: updated.relationshipType,
      deletedAt: updated.deletedAt,
      version: updated.version,
    });
  }

  // ---- internals -----------------------------------------------------------

  private toJsonValue(value: Record<string, unknown>): Prisma.InputJsonValue {
    return value as unknown as Prisma.InputJsonValue;
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