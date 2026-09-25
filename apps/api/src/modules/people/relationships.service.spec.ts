import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PeopleEvents } from './people.events';
import { RelationshipsService } from './relationships.service';

const ACTOR = { id: 'actor-1', email: 'hr@greenfield.edu.ng' };
const UUID = '9b1c2d3e-0000-4000-8000-000000000004';

function makeHarness() {
  const emit = jest.fn();
  const mocks = {
    person: { findFirst: jest.fn() },
    personRelationship: { findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn(), create: jest.fn(), update: jest.fn() },
  };
  const prisma = mocks as any;
  const service = new RelationshipsService(prisma, { emit } as any);
  return { mocks, emit, service };
}

function row(over: Record<string, unknown> = {}) {
  return {
    id: UUID,
    tenantId: 't1',
    institutionId: 'i1',
    sourcePersonId: 'p1',
    targetPersonId: 'p2',
    relationshipType: 'PARENT',
    startDate: new Date('2026-09-01'),
    endDate: null,
    isActive: true,
    metadata: null,
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    sourcePerson: { id: 'p1', firstName: 'Ann', lastName: 'A', email: 'a@x.com', publicId: 'P-2026-001' },
    targetPerson: { id: 'p2', firstName: 'Bob', lastName: 'B', email: 'b@x.com', publicId: 'P-2026-002' },
    ...over,
  };
}

describe('RelationshipsService', () => {
  it('creates a canonical single row (source from :personId, isActive true) and emits PersonRelationshipCreated', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.personRelationship.findFirst.mockResolvedValue(null);
    mocks.personRelationship.create.mockResolvedValue(row());

    const out = await service.createRelationship(
      't1', 'i1', 'p1',
      { targetPersonId: 'p2', relationshipType: 'PARENT', startDate: '2026-09-01' },
      ACTOR,
    );

    expect(mocks.personRelationship.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 't1',
          institutionId: 'i1',
          sourcePersonId: 'p1',
          targetPersonId: 'p2',
          isActive: true,
          createdBy: ACTOR.id,
        }),
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      PeopleEvents.PersonRelationshipCreated,
      expect.objectContaining({ personId: 'p1', actorId: ACTOR.id, entityId: UUID, version: 1 }),
    );
    expect(out).toEqual(expect.objectContaining({ success: true, data: expect.objectContaining({ id: UUID, sourcePersonId: 'p1' }) }));
  });

  it('rejects a self-relationship (I-017) with 400 and an invalid temporal bound (I-08) with 400', async () => {
    const { mocks, service } = makeHarness();
    await expect(
      service.createRelationship('t1', 'i1', 'p1', { targetPersonId: 'p1', relationshipType: 'PARENT', startDate: '2026-09-01' }, ACTOR),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.createRelationship(
        't1', 'i1', 'p1',
        { targetPersonId: 'p2', relationshipType: 'SIBLING', startDate: '2026-12-31', endDate: '2026-01-01' },
        ACTOR,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a missing source/target person with 404', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue(null);
    await expect(
      service.createRelationship('t1', 'i1', 'p1', { targetPersonId: 'p2', relationshipType: 'PARENT', startDate: '2026-09-01' }, ACTOR),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a reverse duplicate (bidirectional single row) with 409, before DB write', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.personRelationship.findFirst.mockResolvedValue({ id: 'existing-row' });

    await expect(
      service.createRelationship('t1', 'i1', 'p1', { targetPersonId: 'p2', relationshipType: 'PARENT', startDate: '2026-09-01' }, ACTOR),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(mocks.personRelationship.create).not.toHaveBeenCalled();
  });

  it('maps a P2002 unique violation to 409 (reverse-create race)', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.personRelationship.findFirst.mockResolvedValue(null);
    mocks.personRelationship.create.mockRejectedValue({ code: 'P2002' });
    await expect(
      service.createRelationship('t1', 'i1', 'p1', { targetPersonId: 'p2', relationshipType: 'PARENT', startDate: '2026-09-01' }, ACTOR),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findOne rejects a non-UUID id as 404 and an uninvolved person as 404', async () => {
    const { mocks, service } = makeHarness();
    await expect(service.findOne('t1', 'i1', 'p1', 'garbage-id')).rejects.toBeInstanceOf(NotFoundException);
    expect(mocks.personRelationship.findFirst).not.toHaveBeenCalled();

    mocks.personRelationship.findFirst.mockResolvedValue(row());
    await expect(service.findOne('t1', 'i1', 'p9', UUID)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update rejects a stale version with 409 and a self-target (I-017) with 400, and emits PersonRelationshipUpdated on success', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.personRelationship.findFirst.mockResolvedValue(row());
    await expect(service.updateRelationship('t1', 'i1', 'p1', UUID, { version: 999 }, ACTOR)).rejects.toHaveProperty('status', 409);

    await expect(
      service.updateRelationship('t1', 'i1', 'p1', UUID, { targetPersonId: 'p1', version: 1 }, ACTOR),
    ).rejects.toBeInstanceOf(BadRequestException);

    mocks.personRelationship.update.mockResolvedValue(row({ endDate: new Date('2030-12-31'), version: 2 }));
    mocks.personRelationship.findFirst.mockReset().mockResolvedValueOnce(row()).mockResolvedValueOnce(null);
    const out = await service.updateRelationship(
      't1', 'i1', 'p1', UUID,
      { relationshipType: 'GUARDIAN', endDate: '2030-12-31', version: 1 },
      ACTOR,
    );

    expect(mocks.personRelationship.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: UUID }, data: expect.objectContaining({ version: 2, relationshipType: 'GUARDIAN' }) }),
    );
    expect(emit).toHaveBeenCalledWith(
      PeopleEvents.PersonRelationshipUpdated,
      expect.objectContaining({ personId: 'p1', entityId: UUID, version: 2 }),
    );
    expect((out as any).data.version).toBe(2);
  });

  it('revoke soft-deletes (isActive false, deletedAt) and emits PersonRelationshipRevoked', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.personRelationship.findFirst.mockResolvedValue(row());
    mocks.personRelationship.update.mockResolvedValue(row({ isActive: false, deletedAt: new Date(), version: 2 }));

    const out = await service.revokeRelationship('t1', 'i1', 'p1', UUID, ACTOR);

    expect(mocks.personRelationship.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: UUID },
        data: expect.objectContaining({ isActive: false, deletedAt: expect.any(Date), version: 2 }),
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      PeopleEvents.PersonRelationshipRevoked,
      expect.objectContaining({ personId: 'p1', actorId: ACTOR.id, entityId: UUID, version: 2 }),
    );
    expect((out as any).data.deletedAt).toBeTruthy();
  });
});