/**
 * PEOPLE-4 Emergency contacts (People spec §5.3/§6.3; BR-06/BR-017, V-EC-01..07).
 *
 * Tenant-scoped, stored against a Person. `priority` is unique per
 * (tenant, person) — creation/reorder conflicts surface as 409 (I-016).
 * There is no status column on the frozen model (V-EC): a contact is either
 * live or soft-deleted (Remove). PhonePrimary is always required (BR-06).
 */
import {
  BadRequestException,
  ConflictException,
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
import { PeopleEvents, PeopleEventPayload } from './people.events';
import {
  CreateEmergencyContactDto,
  ListEmergencyContactsQueryDto,
  UpdateEmergencyContactDto,
} from './dto/emergency-contact.dto';

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
export class EmergencyContactsService {
  private readonly logger = new Logger(EmergencyContactsService.name);

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

  private async resolveContact(tenantId: string, personId: string, id: string) {
    if (!isUuid(id)) {
      throw new NotFoundException('Emergency contact not found');
    }
    const contact = await this.prisma.emergencyContact.findFirst({
      where: { id, tenantId, personId, deletedAt: null },
    });
    if (!contact) {
      throw new NotFoundException('Emergency contact not found');
    }
    return contact;
  }

  private async assertPersonInTenant(tenantId: string, personId: string): Promise<void> {
    const person = await this.prisma.person.findFirst({
      where: { tenantId, id: personId, deletedAt: null },
      select: { id: true },
    });
    if (!person) {
      throw new NotFoundException('Person not found');
    }
  }

  private async countActiveContacts(tenantId: string, personId: string): Promise<number> {
    return this.prisma.emergencyContact.count({
      where: { tenantId, personId, deletedAt: null },
    });
  }

  private async assertPriorityFree(
    tenantId: string,
    personId: string,
    priority: number,
    excludeId?: string,
  ): Promise<void> {
    const clash = await this.prisma.emergencyContact.findFirst({
      where: {
        tenantId,
        personId,
        priority,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `Priority ${priority} is already assigned to another emergency contact for this person (unique per person; reorder to resolve)`,
      );
    }
  }

  // ---- list / read ---------------------------------------------------------

  async listContacts(tenantId: string, personId: string, query: ListEmergencyContactsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.EmergencyContactWhereInput = {
      tenantId,
      personId,
      deletedAt: null,
    };

    const [total, contacts] = await Promise.all([
      this.prisma.emergencyContact.count({ where }),
      this.prisma.emergencyContact.findMany({
        where,
        orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return listEnvelope(
      contacts.map((c) => ({
        id: c.id,
        personId: c.personId,
        name: c.name,
        phonePrimary: c.phonePrimary,
        phoneSecondary: c.phoneSecondary,
        relationship: c.relationship,
        priority: c.priority,
        email: c.email,
        address: c.address,
        version: c.version,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      total,
      page,
      limit,
    );
  }

  async findOne(tenantId: string, personId: string, id: string) {
    const contact = await this.resolveContact(tenantId, personId, id);
    return singleEnvelope({
      id: contact.id,
      personId: contact.personId,
      name: contact.name,
      phonePrimary: contact.phonePrimary,
      phoneSecondary: contact.phoneSecondary,
      relationship: contact.relationship,
      priority: contact.priority,
      email: contact.email,
      address: contact.address,
      version: contact.version,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    });
  }

  // ---- create --------------------------------------------------------------

  async createContact(
    tenantId: string,
    personId: string,
    dto: CreateEmergencyContactDto,
    actor: ActorContext,
  ) {
    await this.assertPersonInTenant(tenantId, personId);
    await this.assertPriorityFree(tenantId, personId, dto.priority);

    let created;
    try {
      created = await this.prisma.emergencyContact.create({
        data: {
          tenantId,
          personId,
          name: dto.name,
          phonePrimary: dto.phonePrimary,
          ...(dto.phoneSecondary ? { phoneSecondary: dto.phoneSecondary } : {}),
          ...(dto.email ? { email: dto.email } : {}),
          relationship: dto.relationship,
          priority: dto.priority,
          ...(dto.address ? { address: dto.address } : {}),
          createdBy: actor.id,
          updatedBy: actor.id,
        },
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException(
          `Priority ${dto.priority} is already assigned to another emergency contact for this person (unique per person; reorder to resolve)`,
        );
      }
      throw err;
    }

    this.emit(PeopleEvents.EmergencyContactCreated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: created.id,
      version: created.version,
    });

    return singleEnvelope({
      id: created.id,
      personId: created.personId,
      name: created.name,
      phonePrimary: created.phonePrimary,
      phoneSecondary: created.phoneSecondary,
      relationship: created.relationship,
      priority: created.priority,
      email: created.email,
      address: created.address,
      version: created.version,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  // ---- update --------------------------------------------------------------

  async updateContact(
    tenantId: string,
    personId: string,
    id: string,
    dto: UpdateEmergencyContactDto,
    actor: ActorContext,
  ) {
    const contact = await this.resolveContact(tenantId, personId, id);
    this.assertVersion(contact.version, dto.version);

    const nextPrimary = dto.phonePrimary !== undefined ? dto.phonePrimary : contact.phonePrimary;
    const nextSecondary =
      dto.phoneSecondary !== undefined ? dto.phoneSecondary : contact.phoneSecondary;
    if (!nextPrimary && !nextSecondary) {
      throw new BadRequestException(
        'At least one phone number is required for an emergency contact (BR-06); clearing the final phone is not allowed',
      );
    }

    if (dto.priority !== undefined && dto.priority !== contact.priority) {
      await this.assertPriorityFree(tenantId, personId, dto.priority, contact.id);
    }

    const data: Prisma.EmergencyContactUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.phonePrimary !== undefined ? { phonePrimary: nextPrimary } : {}),
      ...(dto.phoneSecondary !== undefined ? { phoneSecondary: nextSecondary } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.relationship !== undefined ? { relationship: dto.relationship } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      updatedBy: actor.id,
      version: contact.version + 1,
    };

    const updated = await this.prisma.emergencyContact.update({
      where: { id: contact.id },
      data,
    });

    this.emit(PeopleEvents.EmergencyContactUpdated, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
      changes: {
        name: dto.name,
        phonePrimary: dto.phonePrimary,
        priority: dto.priority,
      } as Record<string, unknown>,
    });

    return singleEnvelope({
      id: updated.id,
      personId: updated.personId,
      name: updated.name,
      phonePrimary: updated.phonePrimary,
      phoneSecondary: updated.phoneSecondary,
      relationship: updated.relationship,
      priority: updated.priority,
      email: updated.email,
      address: updated.address,
      version: updated.version,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  // ---- remove (soft delete only; no status enum) ---------------------------

  async removeContact(tenantId: string, personId: string, id: string, actor: ActorContext) {
    const contact = await this.resolveContact(tenantId, personId, id);

    const updated = await this.prisma.emergencyContact.update({
      where: { id: contact.id },
      data: {
        deletedAt: new Date(),
        deletedBy: actor.id,
        updatedBy: actor.id,
        version: contact.version + 1,
      },
    });

    this.emit(PeopleEvents.EmergencyContactRemoved, {
      ...this.eventBase(tenantId, actor),
      personId,
      entityId: updated.id,
      version: updated.version,
    });

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