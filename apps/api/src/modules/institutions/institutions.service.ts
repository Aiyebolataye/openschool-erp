import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InstitutionStatus, Prisma, Institution } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { InstitutionEvents } from './institution.events';
import {
  CreateInstitutionDto,
  UpdateInstitutionDto,
} from './dto/institution.dto';
import { ListInstitutionsQueryDto } from './dto/list-institutions-query.dto';

function listEnvelope(items: unknown[], total: number, page: number, limit: number) {
  return { success: true as const, data: { items, total, page, limit } };
}

function singleEnvelope(data: unknown) {
  return { success: true as const, data };
}

const ALLOWED_TRANSITIONS: Record<InstitutionStatus, InstitutionStatus[]> = {
  [InstitutionStatus.PROVISIONING]: [
    InstitutionStatus.ACTIVE,
    InstitutionStatus.DEACTIVATED,
    InstitutionStatus.SUSPENDED,
    InstitutionStatus.ARCHIVED,
  ],
  [InstitutionStatus.ACTIVE]: [
    InstitutionStatus.SUSPENDED,
    InstitutionStatus.DEACTIVATED,
    InstitutionStatus.ARCHIVED,
  ],
  [InstitutionStatus.DEACTIVATED]: [
    InstitutionStatus.ACTIVE,
    InstitutionStatus.ARCHIVED,
  ],
  [InstitutionStatus.SUSPENDED]: [
    InstitutionStatus.ACTIVE,
    InstitutionStatus.DEACTIVATED,
    InstitutionStatus.ARCHIVED,
  ],
  [InstitutionStatus.ARCHIVED]: [InstitutionStatus.ACTIVE],
};

@Injectable()
export class InstitutionsService {
  private readonly logger = new Logger(InstitutionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateInstitutionDto, tenantId: string, actorId: string) {
    const existing = await this.prisma.institution.findFirst({
      where: { tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`institution code "${dto.code}" already exists in tenant`);
    }
    const institution = await this.prisma.institution.create({
      data: {
        name: dto.name,
        code: dto.code,
        status: InstitutionStatus.PROVISIONING,
        logoUrl: dto.logoUrl,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        phone: dto.phone,
        email: dto.email,
        website: dto.website,
        motto: dto.motto,
        timezone: dto.timezone,
        currency: dto.currency,
        tenantId,
      },
    });
    await this.events.emitAsync(InstitutionEvents.Provisioned, {
      institutionId: institution.id,
      tenantId,
      actorId,
    });
    await this.audit.record({
      tenantId,
      actorId,
      action: 'institution.create',
      entityType: 'institution',
      entityId: institution.id,
    });
    this.logger.log(`institution ${institution.id} provisioned for tenant ${tenantId}`);
    return singleEnvelope(institution);
  }

  async findAll(tenantId: string, query: ListInstitutionsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const includeArchived = query.includeArchived === true;

    const where: Prisma.InstitutionWhereInput = {
      tenantId,
      ...(includeArchived ? {} : { deletedAt: null }),
    };

    const [total, items] = await Promise.all([
      this.prisma.institution.count({ where }),
      this.prisma.institution.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return listEnvelope(items, total, page, limit);
  }

  async findOne(id: string, tenantId: string) {
    return singleEnvelope(await this.resolveInstitution(id, tenantId));
  }

  private async resolveInstitution(id: string, tenantId: string): Promise<Institution> {
    const institution = await this.prisma.institution.findFirst({
      where: { id, tenantId },
    });
    if (!institution) {
      throw new NotFoundException(`institution ${id} not found in tenant ${tenantId}`);
    }
    return institution;
  }

  async update(id: string, dto: UpdateInstitutionDto, tenantId: string, actorId: string) {
    const current = await this.resolveInstitution(id, tenantId);
    if (current.status === InstitutionStatus.ARCHIVED) {
      throw new ConflictException('archived institution cannot be modified');
    }
    const institution = await this.prisma.institution.update({
      where: { id },
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        phone: dto.phone,
        email: dto.email,
        website: dto.website,
        motto: dto.motto,
        timezone: dto.timezone,
        currency: dto.currency,
      },
    });
    await this.events.emitAsync(InstitutionEvents.Updated, {
      institutionId: id,
      tenantId,
      actorId,
    });
    await this.audit.record({
      tenantId,
      actorId,
      action: 'institution.update',
      entityType: 'institution',
      entityId: id,
    });
    return singleEnvelope(institution);
  }

  private async transition(
    id: string,
    next: InstitutionStatus,
    tenantId: string,
    actorId: string,
    event: string,
    audit: string,
  ) {
    const current = await this.resolveInstitution(id, tenantId);
    const allowed = ALLOWED_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `invalid institution lifecycle transition ${current.status} -> ${next} for ${id}`,
      );
    }
    const updated = await this.prisma.institution.update({
      where: { id },
      data: { status: next, updatedAt: new Date() },
    });
    await this.events.emitAsync(event, { institutionId: id, tenantId, actorId });
    await this.audit.record({
      tenantId,
      actorId,
      action: audit,
      entityType: 'institution',
      entityId: id,
      changes: { previousStatus: current.status, nextStatus: next },
    });
    return singleEnvelope(updated);
  }

  activate(id: string, tenantId: string, actorId: string) {
    return this.transition(id, InstitutionStatus.ACTIVE, tenantId, actorId, InstitutionEvents.Activated, 'institution.activate');
  }

  suspend(id: string, tenantId: string, actorId: string) {
    return this.transition(id, InstitutionStatus.SUSPENDED, tenantId, actorId, InstitutionEvents.Suspended, 'institution.suspend');
  }

  restore(id: string, tenantId: string, actorId: string) {
    return this.transition(id, InstitutionStatus.ACTIVE, tenantId, actorId, InstitutionEvents.Restored, 'institution.restore');
  }

  archive(id: string, tenantId: string, actorId: string) {
    return this.transition(id, InstitutionStatus.ARCHIVED, tenantId, actorId, InstitutionEvents.Archived, 'institution.archive');
  }

  async remove(id: string, tenantId: string, actorId: string) {
    await this.findOne(id, tenantId);
    const updated = await this.prisma.institution.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.events.emitAsync(InstitutionEvents.Deleted, {
      institutionId: id,
      tenantId,
      actorId,
    });
    await this.audit.record({
      tenantId,
      actorId,
      action: 'institution.remove',
      entityType: 'institution',
      entityId: id,
      changes: { deletedAt: updated.deletedAt },
    });
    this.logger.log(`institution ${id} tombstoned for tenant ${tenantId}`);
    return singleEnvelope(updated);
  }
}