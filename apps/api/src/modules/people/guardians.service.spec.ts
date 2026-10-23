import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PeopleEvents } from './people.events';
import { GuardiansService } from './guardians.service';

const ACTOR = { id: 'actor-1', email: 'hr@greenfield.edu.ng' };
const UUID = '9b1c2d3e-0000-4000-8000-000000000002';

function makeHarness() {
  const emit = jest.fn();
  const mocks = {
    person: { findFirst: jest.fn() },
    guardian: { findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn(), create: jest.fn(), update: jest.fn() },
    institution: { findFirst: jest.fn() },
    user: { findFirst: jest.fn() },
    personRelationship: { findMany: jest.fn() },
  };
  const txGuardian = { create: jest.fn() };
  const txPersonInstitution = { upsert: jest.fn() };
  const prisma = {
    ...mocks,
    $transaction: jest.fn(async (cb: any) => cb({ guardian: txGuardian, personInstitution: txPersonInstitution })),
  } as any;
  const service = new GuardiansService(prisma, { emit } as any);
  return { mocks, txGuardian, txPersonInstitution, emit, service };
}

function row(over: Record<string, unknown> = {}) {
  return {
    id: UUID,
    tenantId: 't1',
    personId: 'p1',
    institutionId: 'i1',
    status: 'ACTIVE',
    contactPreference: 'EMAIL',
    legalGuardianshipRef: 'CUSTODY-REF-001',
    version: 1,
    userId: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    person: { id: 'p1', firstName: 'Jane', lastName: 'Doe', email: 'jane@x.com', publicId: 'P-2026-001' },
    institution: { id: 'i1', name: 'Demo', code: 'GF' },
    ...over,
  };
}

describe('GuardiansService', () => {
  it('creates a guardian: writes legalGuardianshipRef, GUARDIAN personInstitution, emits GuardianCreated', async () => {
    const { mocks, txGuardian, txPersonInstitution, emit, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.guardian.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(row());
    mocks.institution.findFirst.mockResolvedValue({ id: 'i1' });
    mocks.personRelationship.findMany.mockResolvedValue([]);
    txGuardian.create.mockResolvedValue({ id: UUID });

    const out = await service.createGuardian(
      't1', 'i1', 'p1',
      { legalGuardianshipRef: 'CUSTODY-REF-001', contactPreference: 'SMS', userId: undefined },
      ACTOR,
    );

    expect(txGuardian.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ legalGuardianshipRef: 'CUSTODY-REF-001', status: 'ACTIVE', contactPreference: 'SMS' }),
      }),
    );
    expect(txPersonInstitution.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ roleContext: 'GUARDIAN', assignedBy: ACTOR.id }) }),
    );
    expect(emit).toHaveBeenCalledWith(
      PeopleEvents.GuardianCreated,
      expect.objectContaining({ personId: 'p1', actorId: ACTOR.id, entityId: UUID, version: 1 }),
    );
    expect(out).toEqual(expect.objectContaining({ success: true, data: expect.objectContaining({ id: UUID, wardsCount: 0 }) }));
  });

  it('create rejects unknown person with 404 and duplicate row with 409', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue(null);
    await expect(service.createGuardian('t1', 'i1', 'p1', { legalGuardianshipRef: 'REF' }, ACTOR)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.guardian.findFirst.mockResolvedValue({ id: 'other-uuid' });
    await expect(service.createGuardian('t1', 'i1', 'p1', { legalGuardianshipRef: 'REF' }, ACTOR)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('create maps a P2002 unique violation to 409', async () => {
    const { mocks, txGuardian, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.guardian.findFirst.mockResolvedValue(null);
    mocks.institution.findFirst.mockResolvedValue({ id: 'i1' });
    txGuardian.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.createGuardian('t1', 'i1', 'p1', { legalGuardianshipRef: 'REF' }, ACTOR)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('findOne rejects a non-UUID id as 404 without a DB lookup', async () => {
    const { mocks, service } = makeHarness();
    await expect(service.findOne('t1', 'i1', 'p1', 'garbage-id')).rejects.toBeInstanceOf(NotFoundException);
    expect(mocks.guardian.findFirst).not.toHaveBeenCalled();
  });

  it('findOne enforces nested ownership (person mismatch 404, institution mismatch 403)', async () => {
    const { mocks, service } = makeHarness();
    mocks.guardian.findFirst.mockResolvedValue(row());
    await expect(service.findOne('t1', 'i1', 'other-person', UUID)).rejects.toBeInstanceOf(NotFoundException);
    mocks.guardian.findFirst.mockResolvedValue(row({ institutionId: 'i-other' }));
    await expect(service.findOne('t1', 'i1', 'p1', UUID)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('update bumps version, applies status transition, emits GuardianUpdated', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.guardian.findFirst.mockResolvedValue(row());
    mocks.personRelationship.findMany.mockResolvedValue([]);
    mocks.guardian.update.mockResolvedValue(row({ status: 'INACTIVE', version: 2 }));

    const out = await service.updateGuardian(
      't1', 'i1', 'p1', UUID,
      { status: 'INACTIVE', legalGuardianshipRef: 'CUSTODY-REF-002', version: 1 },
      ACTOR,
    );

    expect(mocks.guardian.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: UUID }, data: expect.objectContaining({ version: 2, status: 'INACTIVE' }) }),
    );
    expect(emit).toHaveBeenCalledWith(
      PeopleEvents.GuardianUpdated,
      expect.objectContaining({ personId: 'p1', entityId: UUID, version: 2, actorId: ACTOR.id }),
    );
    expect((out as any).data.version).toBe(2);
  });

  it('update rejects a stale version with 409 and an invalid transition (INACTIVE -> ACTIVE) with 409', async () => {
    const { mocks, service } = makeHarness();
    mocks.guardian.findFirst.mockResolvedValue(row());
    await expect(service.updateGuardian('t1', 'i1', 'p1', UUID, { version: 999 }, ACTOR)).rejects.toHaveProperty('status', 409);

    mocks.guardian.findFirst.mockResolvedValue(row({ status: 'INACTIVE' }));
    await expect(
      service.updateGuardian('t1', 'i1', 'p1', UUID, { status: 'ACTIVE', version: 1 }, ACTOR),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('soft delete stamps deletedAt and does NOT fabricate a GuardianRemoved event', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.guardian.findFirst.mockResolvedValue(row());
    mocks.guardian.update.mockResolvedValue(row({ deletedAt: new Date(), version: 2 }));

    const out = await service.softDeleteGuardian('t1', 'i1', 'p1', UUID, ACTOR);

    expect(mocks.guardian.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: UUID }, data: expect.objectContaining({ deletedAt: expect.any(Date), version: 2 }) }),
    );
    expect((out as any).data.deletedAt).toBeTruthy();
    expect(emit).not.toHaveBeenCalledWith(expect.stringContaining('Removed'), expect.anything());
  });
});