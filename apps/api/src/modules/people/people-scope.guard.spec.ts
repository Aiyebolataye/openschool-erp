import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PeopleScopeGuard } from './people-scope.guard';
import { PEOPLE_SCOPE_KEY } from './people-scope.decorator';

function makeContext(request: unknown, handler = {}): any {
  return {
    getHandler: () => handler,
    switchToHttp: () => ({ getRequest: () => request }),
  };
}

function makeGuard(scope: unknown, prismaModel: Record<string, unknown>) {
  const reflector = new Reflector();
  const guard = new PeopleScopeGuard(reflector, {
    person: prismaModel.person,
    student: prismaModel.student,
    institutionMembership: prismaModel.institutionMembership,
    staff: prismaModel.staff,
    parent: prismaModel.parent,
    guardian: prismaModel.guardian,
      personRelationship: prismaModel.personRelationship,
      applicant: prismaModel.applicant,
      peopleDocument: prismaModel.peopleDocument,
  } as any);

  const handler = {};
  const scopeFor = () => scope;
  jest.spyOn(reflector, 'get').mockImplementation((key: string) => {
    if (key === PEOPLE_SCOPE_KEY) return scopeFor();
    return undefined;
  });
  return { guard, handler };
}

const mockPerson = jest.fn();
const mockStudent = jest.fn();
const mockMembership = jest.fn();
const mockStaff = jest.fn();
const mockParent = jest.fn();
const mockGuardian = jest.fn();
const mockRelationship = jest.fn();
const mockApplicant = jest.fn();
const mockPeopleDocument = jest.fn();

const prismaModel = {
  person: { findUnique: mockPerson, findFirst: mockPerson },
  student: { findUnique: mockStudent, findFirst: mockStudent },
  institutionMembership: { findUnique: mockMembership },
  staff: { findFirst: mockStaff },
  parent: { findFirst: mockParent },
  guardian: { findFirst: mockGuardian },
  personRelationship: { findFirst: mockRelationship },
  applicant: { findUnique: mockApplicant, findFirst: mockApplicant },
  peopleDocument: { findUnique: mockPeopleDocument },
};

beforeEach(() => {
  mockPerson.mockReset();
  mockStudent.mockReset();
  mockMembership.mockReset();
  mockStaff.mockReset();
  mockParent.mockReset();
  mockGuardian.mockReset();
  mockRelationship.mockReset();
  mockApplicant.mockReset();
  mockPeopleDocument.mockReset();
});

describe('PeopleScopeGuard', () => {
  it('allows handlers without @PeopleScope metadata', async () => {
    const { guard, handler } = makeGuard(undefined, prismaModel);
    await expect(
      guard.canActivate(makeContext({ user: { sub: 'u1', tenantId: 't1' } }, handler)),
    ).resolves.toBe(true);
  });

  it('allows routes without an :id param (service enforces from trusted state)', async () => {
    const { guard, handler } = makeGuard({ model: 'student' }, prismaModel);
    await expect(
      guard.canActivate(
        makeContext(
          { user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['TEACHER'] }, params: {} },
          handler,
        ),
      ),
    ).resolves.toBe(true);
  });

  it('rejects unauthenticated requests (no sub)', async () => {
    const { guard, handler } = makeGuard({ model: 'person' }, prismaModel);
    await expect(
      guard.canActivate(makeContext({ user: {} }, handler)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('person model: allows tenant-matched, rejects cross-tenant (Phase-2 semantics)', async () => {
    const { guard, handler } = makeGuard({ model: 'person' }, prismaModel);
    mockPerson.mockResolvedValue({ id: 'p1', tenantId: 't1' });
    await expect(
      guard.canActivate(
        makeContext(
          { user: { sub: 'u1', tenantId: 't1', roles: ['HR_OFFICER'] }, params: { id: 'p1' } },
          handler,
        ),
      ),
    ).resolves.toBe(true);

    mockPerson.mockResolvedValue({ id: 'p1', tenantId: 't-other' });
    await expect(
      guard.canActivate(
        makeContext(
          { user: { sub: 'u1', tenantId: 't1', roles: ['HR_OFFICER'] }, params: { id: 'p1' } },
          handler,
        ),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('student model: requires active institution membership + tenant/institution match (Phase-2 semantics)', async () => {
    const { guard, handler } = makeGuard({ model: 'student' }, prismaModel);

    // No institution context
    const noInst = makeContext(
      { user: { sub: 'u1', tenantId: 't1', roles: ['TEACHER'] }, params: { id: 's1', personId: 'p1' } },
      handler,
    );
    await expect(guard.canActivate(noInst)).rejects.toBeInstanceOf(ForbiddenException);

    // Inactive membership
    mockMembership.mockResolvedValue({ status: 'INACTIVE' });
    const inactive = makeContext(
      {
        user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['TEACHER'] },
        params: { id: 's1', personId: 'p1' },
      },
      handler,
    );
    await expect(guard.canActivate(inactive)).rejects.toBeInstanceOf(ForbiddenException);

    // Cross-institution student
    mockMembership.mockResolvedValue({ status: 'ACTIVE' });
    mockStudent.mockResolvedValue({ id: 's1', tenantId: 't1', institutionId: 'i2' });
    const cross = makeContext(
      {
        user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['TEACHER'] },
        params: { id: 's1', personId: 'p1' },
      },
      handler,
    );
    await expect(guard.canActivate(cross)).rejects.toBeInstanceOf(ForbiddenException);

    // Matched: allowed
    mockStudent.mockResolvedValue({ id: 's1', tenantId: 't1', institutionId: 'i1' });
    const ok = makeContext(
      {
        user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['TEACHER'] },
        params: { id: 's1', personId: 'p1' },
      },
      handler,
    );
    await expect(guard.canActivate(ok)).resolves.toBe(true);
  });

  it('self-service (PARENT): own person via userId bridge allowed, others Forbidden', async () => {
    const { guard, handler } = makeGuard({ model: 'person' }, prismaModel);
    mockStaff.mockResolvedValue({ personId: 'me' });
    mockStudent.mockResolvedValue(null);
    mockParent.mockResolvedValue(null);
    mockGuardian.mockResolvedValue(null);

    mockPerson.mockResolvedValue({ id: 'me', tenantId: 't1' });
    const own = makeContext(
      { user: { sub: 'u1', tenantId: 't1', roles: ['PARENT'] }, params: { id: 'me' } },
      handler,
    );
    await expect(guard.canActivate(own)).resolves.toBe(true);

    mockPerson.mockResolvedValue({ id: 'other', tenantId: 't1' });
    const other = makeContext(
      { user: { sub: 'u1', tenantId: 't1', roles: ['PARENT'] }, params: { id: 'other' } },
      handler,
    );
    await expect(guard.canActivate(other)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('self-service (PARENT): own student via userId OR PARENT relationship allowed, unrelated Forbidden', async () => {
    const { guard, handler } = makeGuard({ model: 'student' }, prismaModel);
    const selfParentRequest = (id: string, relationship?: { id: string }) => {
      mockRelationship.mockResolvedValue(relationship ?? null);
      return makeContext(
        { user: { sub: 'u1', tenantId: 't1', roles: ['PARENT'] }, params: { id, personId: 'p1' } },
        handler,
      );
    };

    mockStaff.mockResolvedValue({ personId: 'me' });

    // Direct userId match
    mockStudent.mockResolvedValue({ id: 's1', tenantId: 't1', personId: 'p1', userId: 'u1' });
    await expect(guard.canActivate(selfParentRequest('s1'))).resolves.toBe(true);

    // PARENT relationship to the student's person
    mockStudent.mockResolvedValue({ id: 's1', tenantId: 't1', personId: 'p-student', userId: null });
    mockRelationship.mockResolvedValue({ id: 'rel-1' });
    await expect(guard.canActivate(selfParentRequest('s1', { id: 'rel-1' }))).resolves.toBe(true);

    // Unrelated student
    mockRelationship.mockResolvedValue(null);
    await expect(guard.canActivate(selfParentRequest('s1'))).rejects.toBeInstanceOf(ForbiddenException);

    // Missing student record
    mockStudent.mockResolvedValue(null);
    await expect(guard.canActivate(selfParentRequest('s1'))).rejects.toBeInstanceOf(NotFoundException);
  });

  it('staff model: requires active institution membership + tenant/institution match (PEOPLE-3)', async () => {
    const { guard, handler } = makeGuard({ model: 'staff' }, prismaModel);

    // No institution context
    const noInst = makeContext(
      { user: { sub: 'u1', tenantId: 't1', roles: ['HR_OFFICER'] }, params: { id: 'e1', personId: 'p1' } },
      handler,
    );
    await expect(guard.canActivate(noInst)).rejects.toBeInstanceOf(ForbiddenException);

    // Cross-institution staff
    mockMembership.mockResolvedValue({ status: 'ACTIVE' });
    mockStaff.mockResolvedValue({ id: 'e1', tenantId: 't1', institutionId: 'i2' });
    const cross = makeContext(
      {
        user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['HR_OFFICER'] },
        params: { id: 'e1', personId: 'p1' },
      },
      handler,
    );
    await expect(guard.canActivate(cross)).rejects.toBeInstanceOf(ForbiddenException);

    // Cross-tenant staff
    mockStaff.mockResolvedValue({ id: 'e1', tenantId: 't-other', institutionId: 'i1' });
    const crossTenant = makeContext(
      {
        user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['HR_OFFICER'] },
        params: { id: 'e1', personId: 'p1' },
      },
      handler,
    );
    await expect(guard.canActivate(crossTenant)).rejects.toBeInstanceOf(ForbiddenException);

    // Matched: allowed
    mockStaff.mockResolvedValue({ id: 'e1', tenantId: 't1', institutionId: 'i1' });
    const ok = makeContext(
      {
        user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['HR_OFFICER'] },
        params: { id: 'e1', personId: 'p1' },
      },
      handler,
    );
    await expect(guard.canActivate(ok)).resolves.toBe(true);
  });

  it('staff model: resolves EMP public IDs and missing target is NotFound', async () => {
    const { guard, handler } = makeGuard({ model: 'staff' }, prismaModel);
    mockMembership.mockResolvedValue({ status: 'ACTIVE' });

    mockStaff.mockResolvedValue({ id: 'e9', tenantId: 't1', institutionId: 'i1' });
    const byPublic = makeContext(
      {
        user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['HR_OFFICER'] },
        params: { id: 'EMP-2026-000999', personId: 'p1' },
      },
      handler,
    );
    await expect(guard.canActivate(byPublic)).resolves.toBe(true);

    mockStaff.mockResolvedValue(null);
    const missing = makeContext(
      {
        user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['HR_OFFICER'] },
        params: { id: 'EMP-2026-000999', personId: 'p1' },
      },
      handler,
    );
    await expect(guard.canActivate(missing)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('self-service-only callers cannot reach staff scope (defensive; permission guard fires first)', async () => {
    const { guard, handler } = makeGuard({ model: 'staff' }, prismaModel);
    const req = makeContext(
      { user: { sub: 'u1', tenantId: 't1', roles: ['PARENT'] }, params: { id: 'e1', personId: 'p1' } },
      handler,
    );
    await expect(guard.canActivate(req)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('applicant model: needs active membership + tenant/institution match; resolves UUID or APP public id', async () => {
    const { guard, handler } = makeGuard({ model: 'applicant' }, prismaModel);

    // No institution context
    const noInst = makeContext(
      { user: { sub: 'u1', tenantId: 't1', roles: ['STUDENT_MANAGEMENT_OFFICER'] }, params: { id: 'a1' } },
      handler,
    );
    await expect(guard.canActivate(noInst)).rejects.toBeInstanceOf(ForbiddenException);

    // Inactive membership
    mockMembership.mockResolvedValue({ status: 'INACTIVE' });
    const inactive = makeContext(
      {
        user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['STUDENT_MANAGEMENT_OFFICER'] },
        params: { id: 'a1' },
      },
      handler,
    );
    await expect(guard.canActivate(inactive)).rejects.toBeInstanceOf(ForbiddenException);

    // Cross-institution applicant
    mockMembership.mockResolvedValue({ status: 'ACTIVE' });
    mockApplicant.mockResolvedValue({ id: 'a1', tenantId: 't1', institutionId: 'i2', personId: 'p1' });
    const cross = makeContext(
      {
        user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['STUDENT_MANAGEMENT_OFFICER'] },
        params: { id: 'a1' },
      },
      handler,
    );
    await expect(guard.canActivate(cross)).rejects.toBeInstanceOf(ForbiddenException);

    // Matched by UUID: allowed
    mockApplicant.mockResolvedValue({ id: 'a1', tenantId: 't1', institutionId: 'i1', personId: 'p1' });
    const ok = makeContext(
      {
        user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['STUDENT_MANAGEMENT_OFFICER'] },
        params: { id: 'a1' },
      },
      handler,
    );
    await expect(guard.canActivate(ok)).resolves.toBe(true);

    // UUID lookup misses -> falls back to APP public id
    mockApplicant.mockImplementation((args: { where: { id?: string; publicId?: string } }) => {
      if (args.where.id) return Promise.resolve(null);
      return Promise.resolve({ id: 'a9', tenantId: 't1', institutionId: 'i1', personId: 'p1' });
    });
    const byPublic = makeContext(
      {
        user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['STUDENT_MANAGEMENT_OFFICER'] },
        params: { id: 'APP-2026-000099' },
      },
      handler,
    );
    await expect(guard.canActivate(byPublic)).resolves.toBe(true);

    // Missing applicant: NotFound
    mockApplicant.mockResolvedValue(null);
    const missing = makeContext(
      {
        user: { sub: 'u1', tenantId: 't1', institutionId: 'i1', roles: ['STUDENT_MANAGEMENT_OFFICER'] },
        params: { id: 'APP-2026-000000' },
      },
      handler,
    );
    await expect(guard.canActivate(missing)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('peopleDocument model: tenant scoped, UUID-only, missing/non-UUID is NotFound', async () => {
    const { guard, handler } = makeGuard({ model: 'peopleDocument' }, prismaModel);

    const DOC_UUID = '5b1c2d3e-0000-4000-8000-00000000000d';
    mockPeopleDocument.mockResolvedValue({ id: DOC_UUID, tenantId: 't1', personId: 'p1' });
    const ok = makeContext(
      { user: { sub: 'u1', tenantId: 't1', roles: ['HR_OFFICER'] }, params: { id: DOC_UUID } },
      handler,
    );
    await expect(guard.canActivate(ok)).resolves.toBe(true);

    mockPeopleDocument.mockResolvedValue({ id: DOC_UUID, tenantId: 't-other', personId: 'p1' });
    const crossTenant = makeContext(
      { user: { sub: 'u1', tenantId: 't1', roles: ['HR_OFFICER'] }, params: { id: DOC_UUID } },
      handler,
    );
    await expect(guard.canActivate(crossTenant)).rejects.toBeInstanceOf(ForbiddenException);

    mockPeopleDocument.mockClear();
    const nonUuid = makeContext(
      { user: { sub: 'u1', tenantId: 't1', roles: ['HR_OFFICER'] }, params: { id: 'DOC-2026-001' } },
      handler,
    );
    await expect(guard.canActivate(nonUuid)).rejects.toBeInstanceOf(NotFoundException);
    expect(mockPeopleDocument).not.toHaveBeenCalled();

    mockPeopleDocument.mockResolvedValue(null);
    const missing = makeContext(
      { user: { sub: 'u1', tenantId: 't1', roles: ['HR_OFFICER'] }, params: { id: DOC_UUID } },
      handler,
    );
    await expect(guard.canActivate(missing)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('self-service (PARENT/STUDENT) cannot reach applicant or peopleDocument scope', async () => {
    for (const model of ['applicant', 'peopleDocument'] as const) {
      const { guard, handler } = makeGuard({ model }, prismaModel);
      const req = makeContext(
        { user: { sub: 'u1', tenantId: 't1', roles: ['PARENT'] }, params: { id: 'x' } },
        handler,
      );
      await expect(guard.canActivate(req)).rejects.toBeInstanceOf(ForbiddenException);
    }
  });
});