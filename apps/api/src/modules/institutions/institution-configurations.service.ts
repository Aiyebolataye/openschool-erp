import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { InstitutionEvents } from './institution.events';
import { InstitutionConfigurationUpsertDto } from './dto/institution-config.dto';

function listEnvelope(items: unknown[], total: number, page: number, limit: number) {
  return { success: true as const, data: { items, total, page, limit } };
}

function singleEnvelope(data: unknown) {
  return { success: true as const, data };
}

/**
 * P4.1 — institution-scoped configuration (InstitutionConfiguration).
 *
 * Every row is tenant-scoped AND institution-scoped; both identifiers are
 * server-derived (JWT tenantId + guarded `:id` path). A client-supplied
 * institutionId can never read/write another tenant's configuration.
 * Versions auto-increment on update (BR-10); an optional `version` in the
 * request enables optimistic concurrency (409 on mismatch). Every write is
 * events + audit.
 */
@Injectable()
export class InstitutionConfigurationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly audit: AuditService,
  ) {}

  private scope(
    tenantId: string,
    institutionId: string,
  ): Prisma.InstitutionConfigurationWhereInput {
    return { tenantId, institutionId };
  }

  async list(tenantId: string, institutionId: string) {
    const items = await this.prisma.institutionConfiguration.findMany({
      where: this.scope(tenantId, institutionId),
      orderBy: { key: 'asc' },
    });
    return listEnvelope(items, items.length, 1, items.length);
  }

  async findByKey(tenantId: string, institutionId: string, key: string) {
    const row = await this.prisma.institutionConfiguration.findFirst({
      where: { ...this.scope(tenantId, institutionId), key },
    });
    if (!row) {
      throw new NotFoundException(
        `configuration key ${key} not found for institution ${institutionId}`,
      );
    }
    return singleEnvelope(row);
  }

  async upsert(
    tenantId: string,
    institutionId: string,
    key: string,
    dto: InstitutionConfigurationUpsertDto,
    actorId: string,
  ) {
    const existing = await this.prisma.institutionConfiguration.findFirst({
      where: { ...this.scope(tenantId, institutionId), key },
    });

    if (existing && dto.version !== undefined && dto.version !== existing.version) {
      throw new ConflictException(
        `configuration ${key} version mismatch: expected ${dto.version}, current ${existing.version}`,
      );
    }

    const value = dto.value as Prisma.InputJsonValue;

    const row = existing
      ? await this.prisma.institutionConfiguration.update({
          where: { id: existing.id },
          data: {
            value,
            version: existing.version + 1,
            updatedBy: actorId,
            updatedAt: new Date(),
          },
        })
      : await this.prisma.institutionConfiguration.create({
          data: {
            tenantId,
            institutionId,
            key,
            value,
            version: 1,
            createdBy: actorId,
          },
        });

    await this.events.emitAsync(InstitutionEvents.ConfigurationChanged, {
      institutionId,
      tenantId,
      configurationId: row.id,
      key,
      version: row.version,
      actorId,
    });

    await this.audit.record({
      tenantId,
      actorId,
      action: existing
        ? 'institution.configuration.update'
        : 'institution.configuration.create',
      entityType: 'institutionConfiguration',
      entityId: row.id,
      changes: {
        key,
        value,
        version: row.version,
        ...(existing ? { previousVersion: existing.version } : {}),
      },
    });

    return singleEnvelope(row);
  }

  async remove(tenantId: string, institutionId: string, key: string, actorId: string) {
    const existing = await this.prisma.institutionConfiguration.findFirst({
      where: { ...this.scope(tenantId, institutionId), key },
    });
    if (!existing) {
      throw new NotFoundException(
        `configuration key ${key} not found for institution ${institutionId}`,
      );
    }

    await this.prisma.institutionConfiguration.delete({
      where: { id: existing.id },
    });

    await this.events.emitAsync(InstitutionEvents.ConfigurationRemoved, {
      institutionId,
      tenantId,
      configurationId: existing.id,
      key,
      actorId,
    });

    await this.audit.record({
      tenantId,
      actorId,
      action: 'institution.configuration.remove',
      entityType: 'institutionConfiguration',
      entityId: existing.id,
      changes: {
        key,
        value: existing.value as Prisma.InputJsonValue,
        version: existing.version,
      },
    });

    return singleEnvelope({ key, deleted: true });
  }
}