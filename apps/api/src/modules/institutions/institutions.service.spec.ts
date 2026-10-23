import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InstitutionStatus } from '@prisma/client';
import { InstitutionsService } from './institutions.service';
import { InstitutionEvents } from './institution.events';

const UUID = '9b1c2d3e-0000-4000-8000-000000000005';

function makeHarness() {
  const emit = jest.fn();
  const record = jest.fn();
  const mocks = {
    institution: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const prisma = mocks as any;
  const service = new InstitutionsService(
    prisma,
    { emitAsync: emit } as any,
    { record } as any,
    { get: jest.fn() } as any,
  );
  return { mocks, emit, record, service };
}

function row(over: Record<string, unknown> = {}) {
  return {
    id: UUID,
    tenantId: 't1',
    name: 'Demo Academy',
    code: 'GA',
    status: InstitutionStatus.PROVISIONING,
    logoUrl: null,
    address: null,
    city: null,
    state: null,
    country: 'NG',
    phone: null,
    email: null,
    website: null,
    motto: null,
    timezone: 'Africa/Lagos',
    currency: 'NGN',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    ...over,
  };
}

describe('InstitutionsService', () => {
  it('create provisions a PROVISIONING institution, emits Provisioned and audits', async () => {
    const { mocks, emit, record, service } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue(null);
    mocks.institution.create.mockResolvedValue(row());

    const out = await service.create(
      { name: 'Demo Academy', code: 'GA' },
      't1',
      'actor-1',
    );

    expect(mocks.institution.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 't1',
          code: 'GA',
          status: InstitutionStatus.PROVISIONING,
        }),
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      InstitutionEvents.Provisioned,
      expect.objectContaining({ institutionId: UUID, tenantId: 't1', actorId: 'actor-1' }),
    );
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 't1', action: 'institution.create', entityType: 'institution', entityId: UUID }),
    );
    expect(out).toEqual(expect.objectContaining({ success: true, data: expect.objectContaining({ id: UUID }) }));
  });

  it('create rejects a duplicate tenant-scoped code with 409, before DB write', async () => {
    const { mocks, service } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue(row());
    await expect(service.create({ name: 'X', code: 'GA' }, 't1', 'actor-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(mocks.institution.create).not.toHaveBeenCalled();
  });

  it('findAll paginates and excludes tombstones by default', async () => {
    const { mocks, service } = makeHarness();
    mocks.institution.count.mockResolvedValue(1);
    mocks.institution.findMany.mockResolvedValue([row()]);

    const out = await service.findAll('t1', { page: 1, limit: 20 });

    expect(mocks.institution.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 't1', deletedAt: null }) }),
    );
    expect(mocks.institution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
    const data = (out as any).data;
    expect(data).toEqual(expect.objectContaining({ items: [expect.objectContaining({ id: UUID })], total: 1, page: 1, limit: 20 }));
  });

  it('findAll includes tombstones when includeArchived is true', async () => {
    const { mocks, service } = makeHarness();
    mocks.institution.count.mockResolvedValue(0);
    mocks.institution.findMany.mockResolvedValue([]);
    await service.findAll('t1', { includeArchived: true });
    expect(mocks.institution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 't1' }) }),
    );
    const where = (mocks.institution.findMany.mock.calls[0][0] as { where: Record<string, unknown> }).where;
    expect(where).not.toHaveProperty('deletedAt');
  });

  it('findOne rejects a cross-tenant/missing institution with 404', async () => {
    const { mocks, service } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue(null);
    await expect(service.findOne(UUID, 't2')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update rejects modification of an ARCHIVED institution with 409', async () => {
    const { mocks, service } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue(row({ status: InstitutionStatus.ARCHIVED }));
    await expect(service.update(UUID, { name: 'Renamed' }, 't1', 'actor-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(mocks.institution.update).not.toHaveBeenCalled();
  });

  it('update emits Updated and audits, returning an enveloped row', async () => {
    const { mocks, emit, record, service } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue(row({ status: InstitutionStatus.ACTIVE }));
    mocks.institution.update.mockResolvedValue(row({ status: InstitutionStatus.ACTIVE, name: 'Renamed' }));

    const out = await service.update(UUID, { name: 'Renamed' }, 't1', 'actor-1');

    expect(mocks.institution.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: UUID }, data: expect.objectContaining({ name: 'Renamed' }) }),
    );
    expect(emit).toHaveBeenCalledWith(
      InstitutionEvents.Updated,
      expect.objectContaining({ institutionId: UUID, tenantId: 't1', actorId: 'actor-1' }),
    );
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'institution.update', entityId: UUID }),
    );
    const data = (out as any).data;
    expect(data).toEqual(expect.objectContaining({ id: UUID, name: 'Renamed' }));
  });

  it('rejects an invalid lifecycle transition with 400', async () => {
    const { mocks, service } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue(row({ status: InstitutionStatus.ACTIVE }));
    await expect(service.activate(UUID, 't1', 'actor-1')).rejects.toBeInstanceOf(BadRequestException);
    expect(mocks.institution.update).not.toHaveBeenCalled();
  });

  it('activate from PROVISIONING transitions, emits Activated and audits with previous/next status', async () => {
    const { mocks, emit, record, service } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue(row({ status: InstitutionStatus.PROVISIONING }));
    mocks.institution.update.mockResolvedValue(row({ status: InstitutionStatus.ACTIVE }));

    const out = await service.activate(UUID, 't1', 'actor-1');

    expect(mocks.institution.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: UUID },
        data: expect.objectContaining({ status: InstitutionStatus.ACTIVE }),
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      InstitutionEvents.Activated,
      expect.objectContaining({ institutionId: UUID, actorId: 'actor-1' }),
    );
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'institution.activate',
        changes: { previousStatus: InstitutionStatus.PROVISIONING, nextStatus: InstitutionStatus.ACTIVE },
      }),
    );
    const data = (out as any).data;
    expect(data.status).toBe(InstitutionStatus.ACTIVE);
  });

  it('restore from ARCHIVED is legal (ARCHIVED -> ACTIVE)', async () => {
    const { mocks, service } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue(row({ status: InstitutionStatus.ARCHIVED }));
    mocks.institution.update.mockResolvedValue(row({ status: InstitutionStatus.ACTIVE }));
    await expect(service.restore(UUID, 't1', 'actor-1')).resolves.toMatchObject({
      success: true,
      data: expect.objectContaining({ status: InstitutionStatus.ACTIVE }),
    });
  });

  it('remove tombstones (deletedAt), emits Deleted and audits institution.remove', async () => {
    const { mocks, emit, record, service } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue(row({ status: InstitutionStatus.ACTIVE }));
    const tombstone = row({ status: InstitutionStatus.ACTIVE, deletedAt: new Date('2026-02-01') });
    mocks.institution.update.mockResolvedValue(tombstone);

    const out = await service.remove(UUID, 't1', 'actor-1');

    expect(mocks.institution.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: UUID }, data: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
    );
    expect(emit).toHaveBeenCalledWith(
      InstitutionEvents.Deleted,
      expect.objectContaining({ institutionId: UUID, tenantId: 't1', actorId: 'actor-1' }),
    );
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'institution.remove', entityId: UUID }),
    );
    const data = (out as any).data;
    expect(data.deletedAt).toBeTruthy();
  });

  it('remove rejects a missing institution with 404', async () => {
    const { mocks, service } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue(null);
    await expect(service.remove(UUID, 't1', 'actor-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(mocks.institution.update).not.toHaveBeenCalled();
  });
});