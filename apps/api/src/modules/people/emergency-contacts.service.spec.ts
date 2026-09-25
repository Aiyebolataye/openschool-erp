import { BadRequestException, ConflictException, HttpException, NotFoundException } from '@nestjs/common';
import { PeopleEvents } from './people.events';
import { EmergencyContactsService } from './emergency-contacts.service';

const ACTOR = { id: 'actor-1', email: 'hr@greenfield.edu.ng' };
const UUID = '9b1c2d3e-0000-4000-8000-000000000003';

function makeHarness() {
  const emit = jest.fn();
  const mocks = {
    person: { findFirst: jest.fn() },
    emergencyContact: { findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn(), create: jest.fn(), update: jest.fn() },
  };
  const prisma = mocks as any;
  const service = new EmergencyContactsService(prisma, { emit } as any);
  return { mocks, emit, service };
}

function row(over: Record<string, unknown> = {}) {
  return {
    id: UUID,
    tenantId: 't1',
    personId: 'p1',
    name: 'Aunt Jane',
    phonePrimary: '+2348012345678',
    phoneSecondary: null,
    relationship: 'AUNT',
    priority: 1,
    email: null,
    address: null,
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...over,
  };
}

describe('EmergencyContactsService', () => {
  it('creates a contact: verifies person + free priority, emits EmergencyContactCreated', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.emergencyContact.findFirst.mockResolvedValue(null);
    mocks.emergencyContact.create.mockResolvedValue(row());

    const out = await service.createContact(
      't1', 'p1',
      { name: 'Aunt Jane', phonePrimary: '+2348012345678', relationship: 'AUNT', priority: 1 },
      ACTOR,
    );

    expect(mocks.emergencyContact.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tenantId: 't1', personId: 'p1', priority: 1, createdBy: ACTOR.id }) }),
    );
    expect(emit).toHaveBeenCalledWith(
      PeopleEvents.EmergencyContactCreated,
      expect.objectContaining({ personId: 'p1', actorId: ACTOR.id, entityId: UUID, version: 1 }),
    );
    expect(out).toEqual(expect.objectContaining({ success: true, data: expect.objectContaining({ id: UUID, priority: 1 }) }));
  });

  it('create rejects unknown person with 404', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue(null);
    await expect(
      service.createContact('t1', 'p1', { name: 'Aunt Jane', phonePrimary: '+2348012345678', relationship: 'AUNT', priority: 1 }, ACTOR),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create rejects a duplicate priority for the same person with 409', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.emergencyContact.findFirst.mockResolvedValue({ id: 'clashing-id' });
    await expect(
      service.createContact('t1', 'p1', { name: 'Aunt Jane', phonePrimary: '+2348012345678', relationship: 'AUNT', priority: 1 }, ACTOR),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('create maps a P2002 unique violation (priority) to 409', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findFirst.mockResolvedValue({ id: 'p1' });
    mocks.emergencyContact.findFirst.mockResolvedValue(null);
    mocks.emergencyContact.create.mockRejectedValue({ code: 'P2002' });
    await expect(
      service.createContact('t1', 'p1', { name: 'Aunt Jane', phonePrimary: '+2348012345678', relationship: 'AUNT', priority: 2 }, ACTOR),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findOne rejects a non-UUID id as 404 without a DB lookup', async () => {
    const { mocks, service } = makeHarness();
    await expect(service.findOne('t1', 'p1', 'garbage-id')).rejects.toBeInstanceOf(NotFoundException);
    expect(mocks.emergencyContact.findFirst).not.toHaveBeenCalled();
  });

  it('list orders by (priority, createdAt) ascending and returns the page envelope', async () => {
    const { mocks, service } = makeHarness();
    mocks.emergencyContact.count.mockResolvedValue(2);
    mocks.emergencyContact.findMany.mockResolvedValue([row({ priority: 1 }), row({ id: '...2', priority: 2 })]);

    const out = await service.listContacts('t1', 'p1', {});

    expect(mocks.emergencyContact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }] }),
    );
    expect(out.data.items).toHaveLength(2);
    expect(out.data.total).toBe(2);
  });

  it('update rejects clearing the final phone (BR-06) with 400 and a stale version with 409', async () => {
    const { mocks, service } = makeHarness();
    mocks.emergencyContact.findFirst.mockResolvedValue(row({ phonePrimary: undefined, phoneSecondary: undefined }));
    await expect(
      service.updateContact('t1', 'p1', UUID, { phonePrimary: undefined, phoneSecondary: undefined, version: 1 }, ACTOR),
    ).rejects.toBeInstanceOf(BadRequestException);

    mocks.emergencyContact.findFirst.mockResolvedValue(row());
    await expect(service.updateContact('t1', 'p1', UUID, { version: 999 }, ACTOR)).rejects.toBeInstanceOf(HttpException);
  });

  it('update bumps version, re-verifies priority, emits EmergencyContactUpdated', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.emergencyContact.findFirst.mockResolvedValueOnce(row()).mockResolvedValueOnce(null);
    mocks.emergencyContact.update.mockResolvedValue(row({ priority: 2, version: 2 }));

    const out = await service.updateContact('t1', 'p1', UUID, { priority: 2, version: 1 }, ACTOR);

    expect(mocks.emergencyContact.findFirst).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ priority: 2, id: { not: UUID }, deletedAt: null }) }),
    );
    expect(mocks.emergencyContact.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: UUID }, data: expect.objectContaining({ priority: 2, version: 2 }) }),
    );
    expect(emit).toHaveBeenCalledWith(
      PeopleEvents.EmergencyContactUpdated,
      expect.objectContaining({ personId: 'p1', entityId: UUID, version: 2 }),
    );
    expect((out as any).data.version).toBe(2);
  });

  it('remove soft-deletes and emits EmergencyContactRemoved', async () => {
    const { mocks, emit, service } = makeHarness();
    mocks.emergencyContact.findFirst.mockResolvedValue(row());
    mocks.emergencyContact.update.mockResolvedValue(row({ deletedAt: new Date(), version: 2 }));

    const out = await service.removeContact('t1', 'p1', UUID, ACTOR);

    expect(mocks.emergencyContact.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: UUID }, data: expect.objectContaining({ deletedAt: expect.any(Date), version: 2 }) }),
    );
    expect(emit).toHaveBeenCalledWith(
      PeopleEvents.EmergencyContactRemoved,
      expect.objectContaining({ personId: 'p1', actorId: ACTOR.id, entityId: UUID, version: 2 }),
    );
    expect((out as any).data.deletedAt).toBeTruthy();
  });
});