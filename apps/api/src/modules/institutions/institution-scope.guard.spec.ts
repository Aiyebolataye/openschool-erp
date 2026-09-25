import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InstitutionScopeGuard } from './institution-scope.guard';

const UUID = '9b1c2d3e-0000-4000-8000-000000000006';

function makeHarness() {
  const mocks = {
    institution: { findFirst: jest.fn() },
    institutionMembership: { findUnique: jest.fn() },
  };
  const prisma = mocks as any;
  const guard = new InstitutionScopeGuard(prisma);
  return { mocks, guard };
}

function context(user: Record<string, unknown> | undefined, params: Record<string, string>) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  } as any;
}

describe('InstitutionScopeGuard', () => {
  it('fails closed on a missing trusted actor', async () => {
    const { guard } = makeHarness();
    await expect(guard.canActivate(context(undefined, { id: UUID }))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(guard.canActivate(context({ sub: 'u1' }, { id: UUID }))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('passes through when no :id is present (permission guard still applies)', async () => {
    const { mocks, guard } = makeHarness();
    await expect(
      guard.canActivate(context({ sub: 'u1', tenantId: 't1' }, {})),
    ).resolves.toBe(true);
    expect(mocks.institution.findFirst).not.toHaveBeenCalled();
  });

  it('rejects an unknown institution with 404', async () => {
    const { mocks, guard } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue(null);
    await expect(
      guard.canActivate(context({ sub: 'u1', tenantId: 't1' }, { id: UUID })),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('fails closed on a cross-tenant institution (server-derived tenant scope)', async () => {
    const { mocks, guard } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue({ id: UUID, tenantId: 't2' });
    await expect(
      guard.canActivate(context({ sub: 'u1', tenantId: 't1' }, { id: UUID })),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(mocks.institutionMembership.findUnique).not.toHaveBeenCalled();
  });

  it('fails closed without an active membership', async () => {
    const { mocks, guard } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue({ id: UUID, tenantId: 't1' });

    mocks.institutionMembership.findUnique.mockResolvedValue(null);
    await expect(
      guard.canActivate(context({ sub: 'u1', tenantId: 't1' }, { id: UUID })),
    ).rejects.toBeInstanceOf(ForbiddenException);

    mocks.institutionMembership.findUnique.mockResolvedValue({ status: 'INACTIVE' });
    await expect(
      guard.canActivate(context({ sub: 'u1', tenantId: 't1' }, { id: UUID })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows an ACTIVE membership in the caller tenant', async () => {
    const { mocks, guard } = makeHarness();
    mocks.institution.findFirst.mockResolvedValue({ id: UUID, tenantId: 't1' });
    mocks.institutionMembership.findUnique.mockResolvedValue({ status: 'ACTIVE' });

    await expect(
      guard.canActivate(context({ sub: 'u1', tenantId: 't1' }, { id: UUID })),
    ).resolves.toBe(true);
    expect(mocks.institutionMembership.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId_institutionId_userId: {
            tenantId: 't1',
            institutionId: UUID,
            userId: 'u1',
          },
        },
      }),
    );
  });
});