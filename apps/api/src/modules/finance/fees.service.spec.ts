import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FeeItemStatus, Prisma } from '@prisma/client';
import { FeeStructureService } from './services/fees.service';

function setup() {
  const prisma = {
    institution: { findFirst: jest.fn() },
    feeCategory: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    feeItem: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const publisher = { publish: jest.fn() };
  const audit = { record: jest.fn().mockResolvedValue(undefined) };
  jest.clearAllMocks();

  prisma.institution.findFirst.mockResolvedValue({ id: 'i1' });

  const service = new FeeStructureService(
    prisma as never,
    publisher as never,
    audit as never,
  );
  return { service, prisma, publisher, audit };
}

const CTX = { tenantId: 't1', institutionId: 'i1', userId: 'u1' };
const CATEGORY = {
  id: 'fc-1',
  tenantId: 't1',
  institutionId: 'i1',
  name: 'Tuition',
  description: null,
  version: 1,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  createdBy: 'u1',
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedBy: null,
  deletedAt: null,
  deletedBy: null,
};

function itemRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'fi-1',
    tenantId: 't1',
    institutionId: 'i1',
    feeCategoryId: 'fc-1',
    name: 'Tuition Term 1',
    amount: new Prisma.Decimal('150000.00'),
    description: null,
    status: FeeItemStatus.ACTIVE,
    version: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    createdBy: 'u1',
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}

describe('FeeStructureService — P6.1 fee catalogue invariants', () => {
  it('requires an institution context for every fee operation', async () => {
    const { service, prisma } = setup();
    const ctx = { tenantId: 't1', userId: 'u1' };

    await expect(service.listCategories(ctx)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      service.createItem(ctx, {
        feeCategoryId: 'fc-1',
        name: 'Tuition',
        amount: 1000,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.feeCategory.count).not.toHaveBeenCalled();
  });

  it('rejects a duplicate fee category name inside the same institution', async () => {
    const { service, prisma } = setup();
    prisma.feeCategory.findFirst.mockResolvedValue(CATEGORY);

    await expect(
      service.createCategory(CTX, { name: 'Tuition' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.feeCategory.create).not.toHaveBeenCalled();
  });

  it('creates a category scoped to the trusted tenant + institution and emits the event with a shared eventId', async () => {
    const { service, prisma, publisher, audit } = setup();
    prisma.feeCategory.findFirst.mockResolvedValue(null);
    prisma.feeCategory.create.mockResolvedValue(CATEGORY);

    const result = await service.createCategory(CTX, { name: 'Tuition' });

    expect(result.success).toBe(true);
    expect(prisma.feeCategory.create.mock.calls[0][0].data).toMatchObject({
      tenantId: 't1',
      institutionId: 'i1',
      name: 'Tuition',
      createdBy: 'u1',
    });
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(publisher.publish.mock.calls[0][0]).toBe(
      'finance.fee-category.created',
    );
    const eventId = publisher.publish.mock.calls[0][3].eventId;
    expect(eventId).toEqual(expect.any(String));
    expect(audit.record.mock.calls[0][0]).toMatchObject({
      action: 'finance.fee-category.created',
      entityType: 'feeCategory',
      entityId: 'fc-1',
      eventId,
    });
  });

  it('scopes the category list to the caller institution and never reads another institution', async () => {
    const { service, prisma } = setup();
    prisma.feeCategory.count.mockResolvedValue(1);
    prisma.feeCategory.findMany.mockResolvedValue([CATEGORY]);

    const result = await service.listCategories(CTX, 1, 20);

    expect(result.data).toMatchObject({ total: 1, page: 1, limit: 20 });
    const where = prisma.feeCategory.count.mock.calls[0][0].where;
    expect(where).toMatchObject({ tenantId: 't1', institutionId: 'i1' });
  });

  it('returns 404 for a category outside the caller institution', async () => {
    const { service, prisma } = setup();
    prisma.feeCategory.findFirst.mockResolvedValue(null);

    await expect(
      service.updateCategory(CTX, 'fc-other', { description: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a stale version on update', async () => {
    const { service, prisma } = setup();
    prisma.feeCategory.findFirst.mockResolvedValue(CATEGORY);

    await expect(
      service.updateCategory(CTX, 'fc-1', {
        name: 'Tuition Fees',
        version: 99,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.feeCategory.update).not.toHaveBeenCalled();
  });

  it('rejects a rename onto another existing category name in the same institution', async () => {
    const { service, prisma } = setup();
    // 1st lookup resolves the target category, 2nd lookup finds the duplicate.
    prisma.feeCategory.findFirst
      .mockResolvedValueOnce(CATEGORY)
      .mockResolvedValueOnce({ ...CATEGORY, id: 'fc-2', name: 'Tuition Fees' });

    await expect(
      service.updateCategory(CTX, 'fc-1', { name: 'Tuition Fees', version: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.feeCategory.update).not.toHaveBeenCalled();
  });

  it('increments the version on update and emits the update event', async () => {
    const { service, prisma, publisher } = setup();
    prisma.feeCategory.findFirst
      .mockResolvedValueOnce(CATEGORY)
      .mockResolvedValueOnce(null);
    prisma.feeCategory.update.mockResolvedValue({
      ...CATEGORY,
      name: 'Tuition Fees',
      version: 2,
    });

    const result = await service.updateCategory(CTX, 'fc-1', {
      name: 'Tuition Fees',
      version: 1,
    });

    expect((result.data as { version: number }).version).toBe(2);
    expect(prisma.feeCategory.update.mock.calls[0][0].data.version).toBe(2);
    expect(publisher.publish.mock.calls[0][0]).toBe(
      'finance.fee-category.updated',
    );
  });

  it('enforces BR-030 / V-FI-02: a fee item requires an existing category', async () => {
    const { service, prisma } = setup();
    prisma.feeCategory.findFirst.mockResolvedValue(null);

    await expect(
      service.createItem(CTX, {
        feeCategoryId: 'fc-missing',
        name: 'Tuition Term 1',
        amount: 150000,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.feeItem.create).not.toHaveBeenCalled();
  });

  it('stores the declared amount at 2dp, defaults to ACTIVE and audits the amount', async () => {
    const { service, prisma, audit } = setup();
    prisma.feeCategory.findFirst.mockResolvedValue(CATEGORY);
    prisma.feeItem.create.mockResolvedValue(itemRow());

    const result = await service.createItem(CTX, {
      feeCategoryId: 'fc-1',
      name: 'Tuition Term 1',
      amount: 150000,
    });

    expect(prisma.feeItem.create.mock.calls[0][0].data).toMatchObject({
      tenantId: 't1',
      institutionId: 'i1',
      feeCategoryId: 'fc-1',
      status: FeeItemStatus.ACTIVE,
    });
    const storedAmount = prisma.feeItem.create.mock.calls[0][0].data
      .amount as Prisma.Decimal;
    expect(storedAmount.toFixed(2)).toBe('150000.00');
    // Amounts are serialized as fixed 2-decimal strings, never floats.
    expect((result.data as { amount: string }).amount).toBe('150000.00');
    expect(audit.record.mock.calls[0][0].changes).toMatchObject({
      amount: '150000.00',
    });
  });

  it('refuses to reassign a fee item to a category in another institution', async () => {
    const { service, prisma } = setup();
    prisma.feeItem.findFirst.mockResolvedValue(itemRow());
    prisma.feeCategory.findFirst.mockResolvedValue(null);

    await expect(
      service.updateItem(CTX, 'fi-1', { feeCategoryId: 'fc-other' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.feeItem.update).not.toHaveBeenCalled();
  });

  it('filters the item list by category inside the caller institution', async () => {
    const { service, prisma } = setup();
    prisma.feeItem.count.mockResolvedValue(1);
    prisma.feeItem.findMany.mockResolvedValue([itemRow()]);

    const result = await service.listItems(CTX, 1, 20, 'fc-1');
    const list = result.data as { items: { amount: string }[] };

    expect(list.items[0].amount).toBe('150000.00');
    expect(prisma.feeItem.count.mock.calls[0][0].where).toMatchObject({
      tenantId: 't1',
      institutionId: 'i1',
      feeCategoryId: 'fc-1',
    });
  });
});
