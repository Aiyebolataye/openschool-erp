import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { InstitutionEvents } from './institution.events';
import {
  InstitutionSettingKind,
  InstitutionSettingUpsertDto,
} from './dto/institution-setting.dto';
import { assertNotReservedConfigKey } from './reserved-config-namespaces';

function listEnvelope(items: unknown[], total: number, page: number, limit: number) {
  return { success: true as const, data: { items, total, page, limit } };
}

function singleEnvelope(data: unknown) {
  return { success: true as const, data };
}

const KIND_MEMBERS: Record<InstitutionSettingKind, string[]> = {
  [InstitutionSettingKind.STRING]: ['string'],
  [InstitutionSettingKind.NUMBER]: ['number'],
  [InstitutionSettingKind.BOOLEAN]: ['boolean'],
  [InstitutionSettingKind.JSON]: ['object', 'array'],
};

/**
 * P4.1 — institution-scoped settings (InstitutionSetting).
 *
 * Same server-derived tenant/institution scoping and optimistic versioning as
 * InstitutionConfiguration, plus a kind-typed value contract: `kind` selects
 * the allowed JSON shape of `value` (STRING/NUMBER/BOOLEAN/JSON) and defaults
 * to STRING. Every write is events + audit.
 *
 * D-2 (Option 1): `institution_settings` is a second institution-scoped
 * key/value surface, so it carries the same reserved `financial.*` namespace
 * rejection as `institution_configurations`. Without this, the reservation
 * would be bypassable by writing financial values through the settings table.
 * `remove` keeps its NotFound contract for absent keys; the reservation is
 * asserted after the existence probe.
 */
@Injectable()
export class InstitutionSettingsService {
  private readonly logger = new Logger(InstitutionSettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly audit: AuditService,
  ) {}

  private scope(tenantId: string, institutionId: string): Prisma.InstitutionSettingWhereInput {
    return { tenantId, institutionId };
  }

  private kindOf(value: unknown): string {
    if (Array.isArray(value)) {
      return 'array';
    }
    if (value === null) {
      return 'null';
    }
    return typeof value;
  }

  private resolveKind(
    dto: InstitutionSettingUpsertDto,
    existingKind: string | undefined,
  ): InstitutionSettingKind {
    return dto.kind ?? (existingKind as InstitutionSettingKind) ?? InstitutionSettingKind.STRING;
  }

  private validateValue(kind: InstitutionSettingKind, value: unknown): void {
    const actual = this.kindOf(value);
    if (!KIND_MEMBERS[kind].includes(actual)) {
      throw new BadRequestException(
        `setting value of type ${actual} is not valid for kind ${kind}`,
      );
    }
  }

  async list(tenantId: string, institutionId: string) {
    const items = await this.prisma.institutionSetting.findMany({
      where: this.scope(tenantId, institutionId),
      orderBy: { key: 'asc' },
    });
    return listEnvelope(items, items.length, 1, items.length);
  }

  async findByKey(tenantId: string, institutionId: string, key: string) {
    const row = await this.prisma.institutionSetting.findFirst({
      where: { ...this.scope(tenantId, institutionId), key },
    });
    if (!row) {
      throw new NotFoundException(
        `setting key ${key} not found for institution ${institutionId}`,
      );
    }
    return singleEnvelope(row);
  }

  async upsert(
    tenantId: string,
    institutionId: string,
    key: string,
    dto: InstitutionSettingUpsertDto,
    actorId: string,
  ) {
    assertNotReservedConfigKey(key, 'settings');

    const existing = await this.prisma.institutionSetting.findFirst({
      where: { ...this.scope(tenantId, institutionId), key },
    });

    if (existing && dto.version !== undefined && dto.version !== existing.version) {
      throw new ConflictException(
        `setting ${key} version mismatch: expected ${dto.version}, current ${existing.version}`,
      );
    }

    const kind = this.resolveKind(dto, existing?.kind);
    this.validateValue(kind, dto.value);
    const value = dto.value as Prisma.InputJsonValue;

    const row = existing
      ? await this.prisma.institutionSetting.update({
          where: { id: existing.id },
          data: {
            value,
            kind,
            version: existing.version + 1,
            updatedBy: actorId,
            updatedAt: new Date(),
          },
        })
      : await this.prisma.institutionSetting.create({
          data: {
            tenantId,
            institutionId,
            key,
            value,
            kind,
            version: 1,
            createdBy: actorId,
          },
        });

    await this.events.emitAsync(InstitutionEvents.SettingChanged, {
      institutionId,
      tenantId,
      settingId: row.id,
      key,
      kind,
      version: row.version,
      actorId,
    });

    await this.audit.record({
      tenantId,
      actorId,
      action: existing ? 'institution.setting.update' : 'institution.setting.create',
      entityType: 'institutionSetting',
      entityId: row.id,
      changes: {
        key,
        value,
        kind,
        version: row.version,
        ...(existing ? { previousVersion: existing.version } : {}),
      },
    });

    this.logger.log(`setting ${key} upserted for institution ${institutionId} (v${row.version})`);
    return singleEnvelope(row);
  }

  async remove(tenantId: string, institutionId: string, key: string, actorId: string) {
    const existing = await this.prisma.institutionSetting.findFirst({
      where: { ...this.scope(tenantId, institutionId), key },
    });
    if (!existing) {
      throw new NotFoundException(
        `setting key ${key} not found for institution ${institutionId}`,
      );
    }

    assertNotReservedConfigKey(key, 'settings');

    await this.prisma.institutionSetting.delete({
      where: { id: existing.id },
    });

    await this.events.emitAsync(InstitutionEvents.SettingRemoved, {
      institutionId,
      tenantId,
      settingId: existing.id,
      key,
      kind: existing.kind,
      actorId,
    });

    await this.audit.record({
      tenantId,
      actorId,
      action: 'institution.setting.remove',
      entityType: 'institutionSetting',
      entityId: existing.id,
      changes: {
        key,
        value: existing.value as Prisma.InputJsonValue,
        kind: existing.kind,
        version: existing.version,
      },
    });

    return singleEnvelope({ key, deleted: true });
  }
}