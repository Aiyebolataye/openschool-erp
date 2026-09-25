import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PeopleEvents } from './people.events';
import { PeopleMergeService } from './people-merge.service';

const ACTOR = { id: 'actor-1', email: 'hr@greenfield.edu.ng' };

function personRow(over: Record<string, unknown> = {}) {
  return {
    id: 'p-id',
    publicId: 'P-2026-001',
    tenantId: 't1',
    firstName: 'John',
    lastName: 'Doe',
    middleName: null,
    email: 'john@x.com',
    phone: null,
    dateOfBirth: null,
    gender: 'MALE',
    address: null,
    bloodGroup: null,
    stateOfOrigin: null,
    updatedAt: new Date('2026-01-01'),
    version: 1,
    ...over,
  };
}

function roleModelMock() {
  return { findMany: jest.fn(), updateMany: jest.fn(), update: jest.fn() };
}

function makeHarness() {
  const emit = jest.fn();
  const mocks: any = {
    person: { findFirst: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    auditLog: { count: jest.fn(), findMany: jest.fn() },
    student: roleModelMock(),
    staff: roleModelMock(),
    parent: roleModelMock(),
    guardian: roleModelMock(),
    applicant: roleModelMock(),
    personProfile: { findFirst: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
    personInstitution: { findMany: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
    peopleDocument: { updateMany: jest.fn() },
    emergencyContact: { findMany: jest.fn(), update: jest.fn() },
    personRelationship: { updateMany: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(mocks)),
  };
  const prisma = mocks as any;
  const service = new PeopleMergeService(prisma, { emit } as any);
  return { mocks, emit, service };
}

function defaultEmptyTx(mocks: ReturnType<typeof makeHarness>['mocks']) {
  for (const model of ['student', 'staff', 'parent', 'guardian', 'applicant'] as const) {
    mocks[model].findMany.mockResolvedValue([]);
    mocks[model].updateMany.mockResolvedValue({ count: 0 });
  }
  mocks.personProfile.findFirst.mockResolvedValue(null);
  mocks.personProfile.updateMany.mockResolvedValue({ count: 0 });
  mocks.personInstitution.findMany.mockResolvedValue([]);
  mocks.personInstitution.updateMany.mockResolvedValue({ count: 0 });
  mocks.peopleDocument.updateMany.mockResolvedValue({ count: 0 });
  mocks.emergencyContact.findMany.mockResolvedValue([]);
  mocks.personRelationship.findMany.mockResolvedValue([]);
  mocks.personRelationship.updateMany.mockResolvedValue({ count: 0 });
  mocks.person.update.mockResolvedValue({ id: 'target', version: 2 });
}

describe('PeopleMergeService', () => {
  it('getSuggestions groups same-tenant persons by normalized email / phone / name+dob', async () => {
    const { mocks, service } = makeHarness();
    mocks.person.findMany.mockResolvedValue([
      personRow({ id: 'a', publicId: 'P-2026-001', firstName: 'Ann', lastName: 'A', email: 'Same@X.com' }),
      personRow({ id: 'b', publicId: 'P-2026-002', firstName: 'Ann', lastName: 'A', email: 'same@x.com' }),
      personRow({ id: 'c', publicId: 'P-2026-003', firstName: 'Bob', lastName: 'B', email: null, phone: '+234-800-0001' }),
      personRow({ id: 'd', publicId: 'P-2026-004', firstName: 'Bob', lastName: 'B', email: null, phone: '+2348000001' }),
    ]);
    const out = await service.getSuggestions('t1', {});
    expect(out.success).toBe(true);
    const items = out.data.items as Array<{ sourcePersonId: string; targetPersonId: string; matchBasis: string[] }>;
    expect(items).toHaveLength(2);
    expect(items[0].matchBasis).toContain('email');
    expect(items[1].matchBasis).toContain('phone');
  });

  it('mergePeople rejects sameness/missing with 400/404', async () => {
    const { mocks, service } = makeHarness();
    await expect(
      service.mergePeople('t1', { sourcePersonId: 'a', targetPersonId: 'a' }, ACTOR),
    ).rejects.toBeInstanceOf(BadRequestException);

    mocks.person.findFirst.mockResolvedValue(null);
    await expect(
      service.mergePeople('t1', { sourcePersonId: 'a', targetPersonId: 'b' }, ACTOR),
    ).rejects.toBeInstanceOf(NotFoundException);

    mocks.person.findFirst.mockResolvedValueOnce(personRow({ id: 'a' })).mockResolvedValue(null);
    await expect(
      service.mergePeople('t1', { sourcePersonId: 'a', targetPersonId: 'b' }, ACTOR),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('mergePeople keeps target identity by default (newest non-null -> null-safe keep) and emits PersonMerged', async () => {
    const { mocks, emit, service } = makeHarness();
    defaultEmptyTx(mocks);
    mocks.person.findFirst
      .mockResolvedValueOnce(personRow({ id: 'src', publicId: 'P-2026-0001', firstName: 'Old', email: 'old@x.com' }))
      .mockResolvedValueOnce(personRow({ id: 'tgt', publicId: 'P-2026-0002', firstName: 'New', email: 'new@x.com' }));
    mocks.person.findUnique.mockResolvedValue(personRow({ id: 'tgt', version: 2 }));

    const out = await service.mergePeople('t1', { sourcePersonId: 'src', targetPersonId: 'tgt' }, ACTOR);

    expect(mocks.person.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'tgt' },
        data: expect.objectContaining({ firstName: 'New', email: 'new@x.com', version: 2 }),
      }),
    );
    expect(mocks.person.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'src' },
        data: expect.objectContaining({ deletedAt: expect.any(Date), deletedBy: ACTOR.id }),
      }),
    );
    expect(emit).toHaveBeenCalledWith(PeopleEvents.PersonMerged, expect.objectContaining({
      personId: 'tgt',
      entityId: 'tgt',
      changes: expect.objectContaining({ sourcePersonId: 'src', targetPersonId: 'tgt' }),
    }));
    const eventPayload = emit.mock.calls.find((c) => c[0] === PeopleEvents.PersonMerged)[1] as {
      changes: { fieldResolutions: Record<string, unknown>; keptFields: Record<string, unknown> };
    };
    expect(eventPayload.changes.fieldResolutions.email).toEqual({ previousValue: 'old@x.com', keptValue: 'new@x.com' });
    expect(out).toEqual(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ targetPersonId: 'tgt', sourcePersonId: 'src', sourcePersonPublicId: 'P-2026-0001' }),
    }));
  });

  it('conflictOverrides win over newest-non-null; source fills null target fields', async () => {
    const { mocks, service } = makeHarness();
    defaultEmptyTx(mocks);
    mocks.person.findFirst
      .mockResolvedValueOnce(personRow({ id: 'src', phone: '+234100', bloodGroup: 'O+' }))
      .mockResolvedValueOnce(personRow({ id: 'tgt', phone: null, bloodGroup: 'B+' }));
    mocks.person.findUnique.mockResolvedValue(personRow({ id: 'tgt', version: 2 }));

    await service.mergePeople(
      't1',
      {
        sourcePersonId: 'src',
        targetPersonId: 'tgt',
        conflictOverrides: { bloodGroup: 'AB+' } as Record<string, string>,
      },
      ACTOR,
    );
    expect(mocks.person.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ phone: '+234100', bloodGroup: 'AB+' }) }),
    );
  });

  it('consolidates role rows, profiles, assignments, contacts and relationships inside the transaction', async () => {
    const { mocks, service } = makeHarness();
    defaultEmptyTx(mocks);
    mocks.person.findFirst
      .mockResolvedValueOnce(personRow({ id: 'src', firstName: 'Old' }))
      .mockResolvedValueOnce(personRow({ id: 'tgt', firstName: 'New' }));
    mocks.person.findUnique.mockResolvedValue(personRow({ id: 'tgt', version: 2 }));

    // Role collision: source student at i1, target student also at i1
    mocks.student.findMany
      .mockResolvedValueOnce([{ id: 'rs1', institutionId: 'i1' }])
      .mockResolvedValueOnce([{ institutionId: 'i1' }]);
    // Profile: target has none -> adopt source profile
    mocks.personProfile.findFirst
      .mockResolvedValueOnce({ id: 'prof1', bio: 'bio' })
      .mockResolvedValueOnce(null);
    // Assignment collision: same roleContext@institution on both
    mocks.personInstitution.findMany
      .mockResolvedValueOnce([{ id: 'as1', institutionId: 'i1', roleContext: 'APPLICANT' }])
      .mockResolvedValueOnce([{ institutionId: 'i1', roleContext: 'APPLICANT' }]);
    // EC: target occupies 1 and 2; source has priority 2 -> renumbered
    mocks.emergencyContact.findMany
      .mockResolvedValueOnce([{ priority: 1 }, { priority: 2 }])
      .mockResolvedValueOnce([{ id: 'ec1', priority: 2 }]);
    // Relationship dupes after re-point
    mocks.personRelationship.findMany.mockResolvedValue([
      { id: 'rel1', sourcePersonId: 'tgt', targetPersonId: 'x', relationshipType: 'PARENT', institutionId: 'i1', createdAt: new Date('2026-01-01') },
      { id: 'rel2', sourcePersonId: 'x', targetPersonId: 'tgt', relationshipType: 'PARENT', institutionId: 'i1', createdAt: new Date('2026-01-02') },
      { id: 'rel3', sourcePersonId: 'tgt', targetPersonId: 'x', relationshipType: 'PARENT', institutionId: 'i1', createdAt: new Date('2026-01-03') },
    ]);

    await service.mergePeople('t1', { sourcePersonId: 'src', targetPersonId: 'tgt' }, ACTOR);

    expect(mocks.student.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'rs1' },
      data: expect.objectContaining({ deletedAt: expect.any(Date) }),
    }));
    expect(mocks.student.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ personId: 'src' }),
      data: expect.objectContaining({ personId: 'tgt' }),
    }));
    expect(mocks.personProfile.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { personId: 'src' },
      data: expect.objectContaining({ personId: 'tgt' }),
    }));
    expect(mocks.personInstitution.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'as1' },
      data: expect.objectContaining({ deletedAt: expect.any(Date) }),
    }));
    expect(mocks.emergencyContact.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'ec1' },
      data: expect.objectContaining({ personId: 'tgt', priority: 3 }),
    }));
    expect(mocks.personRelationship.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'rel3' },
      data: expect.objectContaining({ deletedAt: expect.any(Date) }),
    }));
  });

  it('getMergeHistory reads the people.person.merged audit trail', async () => {
    const { mocks, service } = makeHarness();
    mocks.auditLog.count.mockResolvedValue(1);
    mocks.auditLog.findMany.mockResolvedValue([
      {
        id: 'log-1',
        actorId: ACTOR.id,
        createdAt: new Date('2026-09-01'),
        entityId: 'tgt',
        changes: { sourcePersonId: 'src', targetPersonId: 'tgt', fieldResolutions: { email: {} } },
      },
    ]);
    const out = await service.getMergeHistory('t1', {});
    expect(mocks.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { tenantId: 't1', action: 'people.person.merged' },
    }));
    expect(out.data.items[0]).toEqual(expect.objectContaining({
      sourcePersonId: 'src',
      targetPersonId: 'tgt',
      fieldResolutions: expect.any(Object),
    }));
  });
});