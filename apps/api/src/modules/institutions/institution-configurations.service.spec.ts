import { ConflictException, NotFoundException } from '@nestjs/common';
import { InstitutionConfigurationsService } from './institution-configurations.service';
import { InstitutionEvents } from './institution.events';

const UUID = '9b1c2d3e-0000-4000-8000-000000000007';

function makeHarness() {
  const emit = jest.fn();
  const record = jest.fn();
  const mocks = {
    institutionConfiguration: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const prisma = mocks as any;
  const service = new InstitutionConfigurationsService(
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
    key: 'school.logo',
    value: '#2563EB',
    version: 1,
    createdBy: 'actor-1',
    updatedBy: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...over,
  };
}

describe('InstitutionConfigurationsService', () => {
  it('list scopes strictly by tenant + institution and envelops the rows', async () => {
    const { mocks, service } = makeHarness();
    mocks.institutionConfiguration.findMany.mockResolvedValue([row()]);

    const out = await service.list('t1', 'i1');

    expect(mocks.institutionConfiguration.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 't1', institutionId: 'i1' },
        orderBy: { key: 'asc' },
      }),
    );
    const data = (out as any).data;
    expect(data.items).toHaveLength(1);
  });

  it('findByKey returns 404 for a missing key', async () => {
    const { mocks, service } = makeHarness();
    mocks.institutionConfiguration.findFirst.mockResolvedValue(null);
    await expect(service.findByKey('t1', 'i1', 'nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('upsert creates with version 1, emits ConfigurationChanged and audits create', async () => {
    const { mocks, emit, record, service } = makeHarness();
    mocks.institutionConfiguration.findFirst.mockResolvedValue(null);
    mocks.institutionConfiguration.create.mockResolvedValue(row({ version: 1 }));

    const out = await service.upsert('t1', 'i1', 'school.logo', { value: '#2563EB' }, 'actor-1');

    expect(mocks.institutionConfiguration.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 't1',
          institutionId: 'i1',
          key: 'school.logo',
          value: '#2563EB',
          version: 1,
          createdBy: 'actor-1',
        }),
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      InstitutionEvents.ConfigurationChanged,
      expect.objectContaining({ institutionId: 'i1', key: 'school.logo', version: 1, actorId: 'actor-1' }),
    );
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'institution.configuration.create',
        entityType: 'institutionConfiguration',
        entityId: UUID,
      }),
    );
    expect((out as any).data.version).toBe(1);
  });

  it('upsert updates version+1 and audits update with previousVersion', async () => {
    const { mocks, emit, record, service } = makeHarness();
    mocks.institutionConfiguration.findFirst.mockResolvedValue(row({ version: 3 }));
    mocks.institutionConfiguration.update.mockResolvedValue(
      row({ version: 4, value: '#000000', updatedBy: 'actor-1' }),
    );

    const out = await service.upsert('t1', 'i1', 'school.logo', { value: '#000000', version: 3 }, 'actor-1');

    expect(mocks.institutionConfiguration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: UUID },
        data: expect.objectContaining({ value: '#000000', version: 4, updatedBy: 'actor-1' }),
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      InstitutionEvents.ConfigurationChanged,
      expect.objectContaining({ version: 4 }),
    );
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'institution.configuration.update',
        changes: expect.objectContaining({ previousVersion: 3, version: 4 }),
      }),
    );
    expect((out as any).data.version).toBe(4);
  });

  it('rejects a stale expected version with 409, before any write', async () => {
    const { mocks, service } = makeHarness();
    mocks.institutionConfiguration.findFirst.mockResolvedValue(row({ version: 5 }));
    await expect(
      service.upsert('t1', 'i1', 'school.logo', { value: 'x', version: 2 }, 'actor-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(mocks.institutionConfiguration.update).not.toHaveBeenCalled();
    expect(mocks.institutionConfiguration.create).not.toHaveBeenCalled();
  });

  it('remove deletes, emits ConfigurationRemoved and audits remove', async () => {
    const { mocks, emit, record, service } = makeHarness();
    mocks.institutionConfiguration.findFirst.mockResolvedValue(row({ version: 2, value: '#fff' }));
    mocks.institutionConfiguration.delete.mockResolvedValue(row());

    const out = await service.remove('t1', 'i1', 'school.logo', 'actor-1');

    expect(mocks.institutionConfiguration.delete).toHaveBeenCalledWith({ where: { id: UUID } });
    expect(emit).toHaveBeenCalledWith(
      InstitutionEvents.ConfigurationRemoved,
      expect.objectContaining({ key: 'school.logo', actorId: 'actor-1' }),
    );
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'institution.configuration.remove',
        entityId: UUID,
        changes: expect.objectContaining({ key: 'school.logo', version: 2 }),
      }),
    );
    expect(out).toEqual(expect.objectContaining({ success: true, data: { key: 'school.logo', deleted: true } }));
  });

  it('remove returns 404 for a missing key', async () => {
    const { mocks, service } = makeHarness();
    mocks.institutionConfiguration.findFirst.mockResolvedValue(null);
    await expect(service.remove('t1', 'i1', 'nope', 'actor-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(mocks.institutionConfiguration.delete).not.toHaveBeenCalled();
  });
});