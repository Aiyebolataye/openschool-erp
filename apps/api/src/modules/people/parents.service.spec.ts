import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PeopleEvents } from './people.events';
import { ParentsService } from './parents.service';

const ACTOR = { id: 'actor-1', email: 'hr@greenfield.edu.ng' };
const UUID = '9b1c2d3e-0000-4000-8000-000000000001';

function makeHarness() {
  const emit = jest.fn();
  const mocks = {
    person: { findFirst: jest.fn() },
    parent: { findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn(), create: jest.fn(), update: jest.fn() },
    institution: { findFirst: jest.fn() },
    user: { findFirst: jest.fn() },
    personRelationship: { findMany: jest.fn() },
  };
  const txParent = { create: jest.fn() };
  const txPersonInstitution = { upsert: jest.fn() };
  const prisma = {
    ...mocks,
    $transaction: jest.fn(async (cb: any) => cb({ parent: txParent, personInstitution: txPersonInstitution })),
  } as any;
  const service = new ParentsService(prisma, { emit } as any);
  return { mocks, txParent, txPersonInstitution, emit, service };
}

function row(over: Record<string, unknown> = {}) {
  return {
    id: UUID,
    tenantId: 't1',
    personId: 'p1',
    institutionId: 'i1',
    status: 'ACTIVE',
    contactPreference: 'EMAIL',
    version: 1,
    userId: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    person: { id: 'p1', firstName: 'Jane', lastName: 'Doe', email: 'jane@x.com', publicId: 'P-2026-001' },
    institution: { id: 'i1', name: 'Demo', code: 'GF' },
    ...over,
  };
}

describe('ParentsService', () => {
  it('creates a parent: PARENT personInstitution upsert + ParentCreated event (version 1)', async () => {
    const { mocks, txParent, txPersonInstitution, emit, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.parent.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(row());
    mocks.institution.findFirst.mockResolvedValue({ id: 'i1' });
    mocks.personRelationship.findMany.mockResolvedValue([]);
    txParent.create.mockResolvedValue({ id: UUID });

    const out = await service.createParent('t1', 'i1', 'p1', { contactPreference: 'PHONE' }, ACTOR);

    expect(txPersonInstitution.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId_personId_institutionId_roleContext: {
            tenantId: 't1',
            personId: 'p1',
            institutionId: 'i1',
            roleContext: 'PARENT',
          },
        },
        create: expect.objectContaining({ roleContext: 'PARENT', assignedBy: ACTOR.id }),
      }),
    );
    expect(txParent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ACTIVE', contactPreference: 'PHONE', createdBy: ACTOR.id }),
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      PeopleEvents.ParentCreated,
      expect.objectContaining({ personId: 'p1', actorId: ACTOR.id, entityId: UUID, version: 1 }),
    );
    expect(out).toEqual(expect.objectContaining({ success: true, data: expect.objectContaining({ id: UUID, childrenCount: 0 }) }));
  });

  it('create rejects unknown person with 404', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue(null);
    await expect(service.createParent('t1', 'i1', 'p1', {}, ACTOR)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create rejects an existing (tenant,person,institution) row with 409', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.parent.findFirst.mockResolvedValue({ id: 'other-uuid' });
    await expect(service.createParent('t1', 'i1', 'p1', {}, ACTOR)).rejects.toBeInstanceOf(ConflictException);
  });

  it('create maps a P2002 unique violation to 409', async () => {
    const { mocks, txParent, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.parent.findFirst.mockResolvedValue(null);
    mocks.institution.findFirst.mockResolvedValue({ id: 'i1' });
    txParent.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.createParent('t1', 'i1', 'p1', {}, ACTOR)).rejects.toBeInstanceOf(ConflictException);
  });

  it('findOne rejects a non-UUID id as 404 without a DB lookup', async () => {
    const { mocks, service } = makeHarness();
    await expect(service.findOne('t1', 'i1', 'p1', 'garbage-id')).rejects.toBeInstanceOf(NotFoundException);
    expect(mocks.parent.findFirst).not.toHaveBeenCalled();
  });

  it('findOne enforces nested ownership (person mismatch 404, institution mismatch 403)', async () => {
    const { mocks, service } = makeHarness();
    mocks.parent.findFirst.mockResolvedValue(row());
    await expect(service.findOne('t1', 'i1', 'other-person', UUID)).rejects.toBeInstanceOf(NotFoundException);
    mocks.parent.findFirst.mockResolvedValue(row({ institutionId: 'i-other' }));
    await expect(service.findOne('t1', 'i1', 'p1', UUID)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('update bumps version, applies status transition, emits ParentUpdated', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.parent.findFirst.mockResolvedValue(row());
    mocks.personRelationship.findMany.mockResolvedValue([]);
    mocks.parent.update.mockResolvedValue(row({ status: 'INACTIVE', version: 2 }));

    const out = await service.updateParent('t1', 'i1', 'p1', UUID, { status: 'INACTIVE', version: 1 }, ACTOR);

    expect(mocks.parent.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: UUID }, data: expect.objectContaining({ version: 2, status: 'INACTIVE' }) }),
    );
    expect(emit).toHaveBeenCalledWith(
      PeopleEvents.ParentUpdated,
      expect.objectContaining({ personId: 'p1', entityId: UUID, version: 2, actorId: ACTOR.id }),
    );
    expect((out as any).data.version).toBe(2);
  });

  it('update rejects a stale version with 409', async () => {
    const { mocks, service } = makeHarness();
    mocks.parent.findFirst.mockResolvedValue(row());
    await expect(service.updateParent('t1', 'i1', 'p1', UUID, { version: 999 }, ACTOR)).rejects.toHaveProperty('status', 409);
  });

  it('update rejects an invalid status transition (INACTIVE -> ACTIVE) with 409', async () => {
    const { mocks, service } = makeHarness();
    mocks.parent.findFirst.mockResolvedValue(row({ status: 'INACTIVE' }));
    await expect(
      service.updateParent('t1', 'i1', 'p1', UUID, { status: 'ACTIVE', version: 1 }, ACTOR),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('soft delete stamps deletedAt and does NOT fabricate a ParentRemoved event', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.parent.findFirst.mockResolvedValue(row());
    mocks.parent.update.mockResolvedValue(row({ deletedAt: new Date(), version: 2 }));

    const out = await service.softDeleteParent('t1', 'i1', 'p1', UUID, ACTOR);

    expect(mocks.parent.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: UUID }, data: expect.objectContaining({ deletedAt: expect.any(Date), version: 2 }) }),
    );
    expect((out as any).data.deletedAt).toBeTruthy();
    expect(emit).not.toHaveBeenCalledWith(expect.stringContaining('Removed'), expect.anything());
  });
});