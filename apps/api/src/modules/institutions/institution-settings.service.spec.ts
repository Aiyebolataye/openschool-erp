import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InstitutionSettingsService } from './institution-settings.service';
import { InstitutionEvents } from './institution.events';
import { InstitutionSettingKind } from './dto/institution-setting.dto';

const UUID = '9b1c2d3e-0000-4000-8000-000000000008';

function makeHarness() {
  const emit = jest.fn();
  const record = jest.fn();
  const mocks = {
    institutionSetting: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const prisma = mocks as any;
  const service = new InstitutionSettingsService(
    prisma,
    { emitAsync: emit } as any,
    { record } as any,
  );
  return { mocks, emit, record, service };
}

function row(over: Record<string, unknown> = {}) {
  return {
    id: UUID,
    tenantId: 't1',
    institutionId: 'i1',
    key: 'sms.provider',
    value: 'twilio',
    kind: InstitutionSettingKind.STRING,
    version: 1,
    createdBy: 'actor-1',
    updatedBy: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...over,
  };
}

describe('InstitutionSettingsService', () => {
  it('creates with the default kind STRING when kind is omitted', async () => {
    const { mocks, emit, record, service } = makeHarness();
    mocks.institutionSetting.findFirst.mockResolvedValue(null);
    mocks.institutionSetting.create.mockResolvedValue(row());

    const out = await service.upsert('t1', 'i1', 'sms.provider', { value: 'twilio' }, 'actor-1');

    expect(mocks.institutionSetting.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 't1',
          institutionId: 'i1',
          key: 'sms.provider',
          value: 'twilio',
          kind: InstitutionSettingKind.STRING,
          version: 1,
        }),
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      InstitutionEvents.SettingChanged,
      expect.objectContaining({ key: 'sms.provider', kind: InstitutionSettingKind.STRING, version: 1 }),
    );
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'institution.setting.create', entityId: UUID }),
    );
    expect((out as any).data.version).toBe(1);
  });

  it('rejects a value that does not match the requested kind with 400, before any write', async () => {
    const { mocks, service } = makeHarness();
    mocks.institutionSetting.findFirst.mockResolvedValue(null);
    await expect(
      service.upsert('t1', 'i1', 'sms.provider', { value: 'twilio', kind: InstitutionSettingKind.NUMBER }, 'actor-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mocks.institutionSetting.create).not.toHaveBeenCalled();
  });

  it('accepts object/array values for kind JSON and rejects scalars', async () => {
    const { mocks, service } = makeHarness();
    mocks.institutionSetting.findFirst.mockResolvedValue(null);
    mocks.institutionSetting.create.mockResolvedValue(
      row({ key: 'settings.exams', value: { enableExams: true }, kind: InstitutionSettingKind.JSON }),
    );
    await expect(
      service.upsert('t1', 'i1', 'settings.exams', { value: { enableExams: true }, kind: InstitutionSettingKind.JSON }, 'actor-1'),
    ).resolves.toMatchObject({ success: true });

    await expect(
      service.upsert('t1', 'i1', 'settings.exams', { value: 42, kind: InstitutionSettingKind.JSON }, 'actor-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates kind + value and increments version, auditing previousVersion', async () => {
    const { mocks, record, service } = makeHarness();
    mocks.institutionSetting.findFirst.mockResolvedValue(row({ version: 2, kind: InstitutionSettingKind.STRING }));
    mocks.institutionSetting.update.mockResolvedValue(
      row({ version: 3, value: true, kind: InstitutionSettingKind.BOOLEAN, updatedBy: 'actor-1' }),
    );

    const out = await service.upsert(
      't1', 'i1', 'sms.provider',
      { value: true, kind: InstitutionSettingKind.BOOLEAN, version: 2 },
      'actor-1',
    );

    expect(mocks.institutionSetting.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: UUID },
        data: expect.objectContaining({
          value: true,
          kind: InstitutionSettingKind.BOOLEAN,
          version: 3,
          updatedBy: 'actor-1',
        }),
      }),
    );
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'institution.setting.update',
        changes: expect.objectContaining({ previousVersion: 2, version: 3, kind: InstitutionSettingKind.BOOLEAN }),
      }),
    );
    expect((out as any).data.version).toBe(3);
  });

  it('rejects a stale expected version with 409, before any write', async () => {
    const { mocks, service } = makeHarness();
    mocks.institutionSetting.findFirst.mockResolvedValue(row({ version: 4 }));
    await expect(
      service.upsert('t1', 'i1', 'sms.provider', { value: 'x', version: 1 }, 'actor-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(mocks.institutionSetting.update).not.toHaveBeenCalled();
  });

  it('remove emits SettingRemoved and audits remove', async () => {
    const { mocks, emit, record, service } = makeHarness();
    mocks.institutionSetting.findFirst.mockResolvedValue(row({ version: 2 }));
    mocks.institutionSetting.delete.mockResolvedValue(row());

    const out = await service.remove('t1', 'i1', 'sms.provider', 'actor-1');

    expect(emit).toHaveBeenCalledWith(
      InstitutionEvents.SettingRemoved,
      expect.objectContaining({ key: 'sms.provider', actorId: 'actor-1' }),
    );
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'institution.setting.remove', entityId: UUID }),
    );
    expect(out).toEqual(expect.objectContaining({ success: true, data: { key: 'sms.provider', deleted: true } }));
  });

  it('findByKey returns 404 for a missing key', async () => {
    const { mocks, service } = makeHarness();
    mocks.institutionSetting.findFirst.mockResolvedValue(null);
    await expect(service.findByKey('t1', 'i1', 'nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});