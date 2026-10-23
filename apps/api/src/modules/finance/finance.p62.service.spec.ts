import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import {
  AccountType,
  BillStatus,
  DiscountStatus,
  DiscountType,
  FeeItemStatus,
  FeeScheduleStatus,
  FinancialPeriodStatus,
  PolicyStatus,
  Prisma,
} from '@prisma/client';
import { FeeStructureService } from './services/fees.service';
import { BillingService } from './services/billing.service';
import { AccountingService } from './services/accounting.service';
import { DiscountService } from './services/discount.service';
import { FinancialPolicyService } from './services/policy.service';
import { CreateDiscountDto } from './dto/discount.dto';
import { CreateFinancialPolicyDto, POLICY_TYPES } from './dto/policy.dto';
import { UpdateFeeScheduleDto } from './dto/schedule.dto';
import { PostJournalEntryDto } from './dto/accounting.dto';

const CTX = { tenantId: 't1', institutionId: 'i1', userId: 'u1' };
const NO_CTX = { tenantId: 't1', userId: 'u1' };

function basePrisma() {
  return {
    institution: { findFirst: jest.fn().mockResolvedValue({ id: 'i1' }) },
    academicSession: { findFirst: jest.fn(), findMany: jest.fn() },
    term: { findFirst: jest.fn() },
    student: { findFirst: jest.fn() },
    feeCategory: { findFirst: jest.fn(), count: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    feeItem: { findFirst: jest.fn(), count: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    feeTemplate: { findFirst: jest.fn() },
    feeSchedule: { findFirst: jest.fn(), count: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    feeScheduleItem: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    bill: { findFirst: jest.fn(), count: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    discount: { findFirst: jest.fn(), count: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    ledgerAccount: { findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
    financialPeriod: { findFirst: jest.fn(), count: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    journalEntry: { findFirst: jest.fn(), count: jest.fn(), findMany: jest.fn(), create: jest.fn(), findUniqueOrThrow: jest.fn() },
    accountBalance: { findFirst: jest.fn(), count: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    financialPolicy: { findFirst: jest.fn(), count: jest.fn(), findMany: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
    $transaction: jest.fn(),
  };
}

function setup<T>(Service: new (...args: never[]) => T) {
  const prisma = basePrisma();
  const publisher = { publish: jest.fn() };
  const audit = { record: jest.fn().mockResolvedValue(undefined) };
  jest.clearAllMocks();
  prisma.institution.findFirst.mockResolvedValue({ id: 'i1' });
  const service = new Service(prisma as never, publisher as never, audit as never);
  return { service, prisma, publisher, audit };
}

const SESSION = { id: 'as-1' };
const STUDENT = { id: 'st-1', personId: 'per-1' };
const PERIOD = {
  id: 'fp-1',
  tenantId: 't1',
  institutionId: 'i1',
  name: '2026 Term 1',
  academicSessionId: 'as-1',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-06-30'),
  status: FinancialPeriodStatus.OPEN,
  version: 1,
  createdAt: new Date(),
  createdBy: 'u1',
  updatedAt: new Date(),
  updatedBy: null,
  deletedAt: null,
  deletedBy: null,
};

function scheduleItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'fsi-1',
    tenantId: 't1',
    institutionId: 'i1',
    feeScheduleId: 'fs-1',
    feeItemId: 'fi-1',
    amount: new Prisma.Decimal('1000.00'),
    mandatory: true,
    version: 1,
    createdAt: new Date(),
    createdBy: 'u1',
    updatedAt: new Date(),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    feeItem: { id: 'fi-1', name: 'Tuition', amount: new Prisma.Decimal('1000.00'), status: FeeItemStatus.ACTIVE },
    ...overrides,
  };
}

function schedule(overrides: Record<string, unknown> = {}) {
  return {
    id: 'fs-1',
    tenantId: 't1',
    institutionId: 'i1',
    name: '2026 Term 1 Schedule',
    academicSessionId: 'as-1',
    feeTemplateId: null,
    status: FeeScheduleStatus.DRAFT,
    version: 1,
    createdAt: new Date(),
    createdBy: 'u1',
    updatedAt: new Date(),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    items: [],
    ...overrides,
  };
}

function account(overrides: Record<string, unknown> = {}) {
  return {
    id: 'la-1',
    tenantId: 't1',
    institutionId: 'i1',
    code: '1000',
    name: 'Cash',
    accountType: AccountType.ASSET,
    description: null,
    isActive: true,
    version: 1,
    createdAt: new Date(),
    createdBy: 'u1',
    updatedAt: new Date(),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}

// ===========================================================================
describe('FeeStructureService — schedules (P6.2)', () => {
  it('rejects a create without an institution context', async () => {
    const { service } = setup(FeeStructureService);
    await expect(
      service.createSchedule(NO_CTX, {
        name: 'S',
        academicSessionId: 'as-1',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects a schedule whose academic session is not in the institution (V-FS-02)', async () => {
    const { service, prisma } = setup(FeeStructureService);
    prisma.academicSession.findFirst.mockResolvedValue(null);
    await expect(
      service.createSchedule(CTX, { name: 'S', academicSessionId: 'as-9' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a duplicate (session, name) per §7.2 unique key', async () => {
    const { service, prisma } = setup(FeeStructureService);
    prisma.academicSession.findFirst.mockResolvedValue(SESSION);
    prisma.feeSchedule.findFirst.mockResolvedValue({ id: 'fs-9' });
    await expect(
      service.createSchedule(CTX, { name: 'S', academicSessionId: 'as-1' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates a DRAFT schedule and emits FeeScheduleCreated', async () => {
    const { service, prisma, publisher } = setup(FeeStructureService);
    prisma.academicSession.findFirst.mockResolvedValue(SESSION);
    prisma.feeSchedule.findFirst.mockResolvedValue(null);
    prisma.feeSchedule.create.mockResolvedValue(schedule());

    const result = await service.createSchedule(CTX, {
      name: '2026 Term 1 Schedule',
      academicSessionId: 'as-1',
    });

    expect(prisma.feeSchedule.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: FeeScheduleStatus.DRAFT }),
      }),
    );
    expect(publisher.publish).toHaveBeenCalledWith(
      'finance.fee-schedule.created',
      't1',
      expect.anything(),
      expect.anything(),
    );
    expect(result.success).toBe(true);
  });

  it('refuses to update a PUBLISHED schedule (immutability, cf. I-05)', async () => {
    const { service, prisma } = setup(FeeStructureService);
    prisma.feeSchedule.findFirst.mockResolvedValue(
      schedule({ status: FeeScheduleStatus.PUBLISHED }),
    );
    await expect(
      service.updateSchedule(CTX, 'fs-1', { name: 'Renamed' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.feeSchedule.update).not.toHaveBeenCalled();
  });

  it('rejects re-publishing an already published schedule', async () => {
    const { service, prisma } = setup(FeeStructureService);
    prisma.feeSchedule.findFirst.mockResolvedValue(
      schedule({ status: FeeScheduleStatus.PUBLISHED }),
    );
    await expect(service.publishSchedule(CTX, 'fs-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('publishes a DRAFT schedule and emits FeeSchedulePublished', async () => {
    const { service, prisma, publisher } = setup(FeeStructureService);
    prisma.feeSchedule.findFirst.mockResolvedValue(schedule());
    prisma.feeSchedule.update.mockResolvedValue(
      schedule({ status: FeeScheduleStatus.PUBLISHED, version: 2 }),
    );
    const result = await service.publishSchedule(CTX, 'fs-1');
    expect(publisher.publish).toHaveBeenCalledWith(
      'finance.fee-schedule.published',
      't1',
      expect.anything(),
      expect.anything(),
    );
    expect((result as { data: { status: string } }).data.status).toBe(
      FeeScheduleStatus.PUBLISHED,
    );
  });

  it('rejects a schedule item referencing an inactive fee item (I-23)', async () => {
    const { service, prisma } = setup(FeeStructureService);
    prisma.feeSchedule.findFirst.mockResolvedValue(schedule());
    prisma.feeItem.findFirst.mockResolvedValue(null);
    await expect(
      service.addScheduleItem(CTX, 'fs-1', { feeItemId: 'fi-1', amount: 10 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a duplicate fee item on the same schedule (§7.2 unique key)', async () => {
    const { service, prisma } = setup(FeeStructureService);
    prisma.feeSchedule.findFirst.mockResolvedValue(schedule());
    prisma.feeItem.findFirst.mockResolvedValue({
      id: 'fi-1',
      status: FeeItemStatus.ACTIVE,
    });
    prisma.feeScheduleItem.findFirst.mockResolvedValue({ id: 'fsi-9', deletedAt: null });
    await expect(
      service.addScheduleItem(CTX, 'fs-1', { feeItemId: 'fi-1', amount: 10 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('revives a soft-deleted schedule item instead of violating the unique key', async () => {
    const { service, prisma } = setup(FeeStructureService);
    prisma.feeSchedule.findFirst.mockResolvedValue(schedule());
    prisma.feeItem.findFirst.mockResolvedValue({ id: 'fi-1', status: FeeItemStatus.ACTIVE });
    prisma.feeScheduleItem.findFirst.mockResolvedValue({ id: 'fsi-1', deletedAt: new Date() });
    prisma.feeScheduleItem.update.mockResolvedValue(scheduleItem());
    await service.addScheduleItem(CTX, 'fs-1', { feeItemId: 'fi-1', amount: 10 });
    expect(prisma.feeScheduleItem.create).not.toHaveBeenCalled();
    expect(prisma.feeScheduleItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'fsi-1' } }),
    );
  });

  it('keeps academicSessionId immutable on update (BR-29)', async () => {
    const { service, prisma } = setup(FeeStructureService);
    // First findFirst resolves the schedule; the second is the rename-collision
    // check, which must find nothing.
    prisma.feeSchedule.findFirst
      .mockResolvedValueOnce(schedule())
      .mockResolvedValue(null);
    prisma.feeSchedule.update.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve(schedule(data)),
    );
    // A stray academicSessionId must not reach the write.
    await service.updateSchedule(CTX, 'fs-1', {
      name: 'Renamed',
      academicSessionId: 'as-2',
    } as never);
    const written = prisma.feeSchedule.update.mock.calls[0][0].data as Record<string, unknown>;
    expect(written.academicSessionId).toBeUndefined();
    expect(written.name).toBe('Renamed');
  });

  it('rejects a rename that collides with another schedule in the same session', async () => {
    const { service, prisma } = setup(FeeStructureService);
    prisma.feeSchedule.findFirst
      .mockResolvedValueOnce(schedule())
      .mockResolvedValueOnce({ id: 'fs-9' });
    await expect(
      service.updateSchedule(CTX, 'fs-1', { name: 'Taken' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

// ===========================================================================
describe('BillingService (P6.2)', () => {
  const published = () =>
    schedule({ status: FeeScheduleStatus.PUBLISHED, items: [] });

  it('refuses to bill from a DRAFT schedule', async () => {
    const { service, prisma } = setup(BillingService);
    prisma.feeSchedule.findFirst.mockResolvedValue(schedule());
    await expect(
      service.generateBill(CTX, { feeScheduleId: 'fs-1', studentPersonId: 'per-1' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a student that is not in the institution (§8.2 lookup)', async () => {
    const { service, prisma } = setup(BillingService);
    prisma.feeSchedule.findFirst.mockResolvedValue(published());
    prisma.student.findFirst.mockResolvedValue(null);
    await expect(
      service.generateBill(CTX, { feeScheduleId: 'fs-1', studentPersonId: 'per-9' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a second active bill for the same student and schedule', async () => {
    const { service, prisma } = setup(BillingService);
    prisma.feeSchedule.findFirst.mockResolvedValue(published());
    prisma.student.findFirst.mockResolvedValue(STUDENT);
    prisma.bill.findFirst.mockResolvedValue({ id: 'b-9', status: BillStatus.GENERATED });
    await expect(
      service.generateBill(CTX, { feeScheduleId: 'fs-1', studentPersonId: 'per-1' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('sums mandatory and optional items and inherits the session from the schedule', async () => {
    const { service, prisma, publisher, audit } = setup(BillingService);
    prisma.feeSchedule.findFirst.mockResolvedValue(
      schedule({
        status: FeeScheduleStatus.PUBLISHED,
        items: [
          scheduleItem({ amount: new Prisma.Decimal('1000.00'), mandatory: true }),
          scheduleItem({
            id: 'fsi-2',
            feeItemId: 'fi-2',
            amount: new Prisma.Decimal('250.50'),
            mandatory: false,
          }),
        ],
      }),
    );
    prisma.student.findFirst.mockResolvedValue(STUDENT);
    prisma.bill.findFirst.mockResolvedValue(null);
    prisma.bill.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'b-1', ...data }),
    );

    const result = await service.generateBill(CTX, {
      feeScheduleId: 'fs-1',
      studentPersonId: 'per-1',
    });

    expect(prisma.bill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          academicSessionId: 'as-1',
          status: BillStatus.GENERATED,
          totalAmount: new Prisma.Decimal('1250.50'),
        }),
      }),
    );
    expect((result as { data: { totalAmount: string } }).data.totalAmount).toBe('1250.50');
    expect(publisher.publish).toHaveBeenCalledWith(
      'finance.bill.generated',
      't1',
      expect.anything(),
      expect.anything(),
    );
    // The mandatory/optional split is on the audit row so the total is reviewable.
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: expect.objectContaining({
          mandatorySubtotal: '1000.00',
          optionalSubtotal: '250.50',
          itemCount: 2,
        }),
      }),
    );
  });

  it('excludes soft-deleted schedule items from the total', async () => {
    const { service, prisma } = setup(BillingService);
    prisma.feeSchedule.findFirst.mockResolvedValue(
      schedule({
        status: FeeScheduleStatus.PUBLISHED,
        items: [
          scheduleItem({ amount: new Prisma.Decimal('100.00') }),
          scheduleItem({
            id: 'fsi-2',
            amount: new Prisma.Decimal('999.00'),
            deletedAt: new Date(),
          }),
        ],
      }),
    );
    prisma.student.findFirst.mockResolvedValue(STUDENT);
    prisma.bill.findFirst.mockResolvedValue(null);
    prisma.bill.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'b-1', ...data }),
    );
    await service.generateBill(CTX, { feeScheduleId: 'fs-1', studentPersonId: 'per-1' });
    expect(prisma.bill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalAmount: new Prisma.Decimal('100.00') }),
      }),
    );
  });

  it('refuses to cancel a CONVERTED bill', async () => {
    const { service, prisma } = setup(BillingService);
    prisma.bill.findFirst.mockResolvedValue({ id: 'b-1', status: BillStatus.CONVERTED, version: 1 });
    await expect(service.cancelBill(CTX, 'b-1', {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects cancelling an already cancelled bill', async () => {
    const { service, prisma } = setup(BillingService);
    prisma.bill.findFirst.mockResolvedValue({ id: 'b-1', status: BillStatus.CANCELLED, version: 2 });
    await expect(service.cancelBill(CTX, 'b-1', {})).rejects.toBeInstanceOf(ConflictException);
  });

  it('cancels a generated bill and bumps the version', async () => {
    const { service, prisma, publisher } = setup(BillingService);
    prisma.bill.findFirst.mockResolvedValue({
      id: 'b-1',
      status: BillStatus.GENERATED,
      version: 1,
      notes: null,
      totalAmount: new Prisma.Decimal('100.00'),
    });
    prisma.bill.update.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'b-1', ...data }),
    );
    await service.cancelBill(CTX, 'b-1', { reason: 'Duplicate' });
    expect(prisma.bill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: BillStatus.CANCELLED, version: 2 }),
      }),
    );
    expect(publisher.publish).toHaveBeenCalledWith(
      'finance.bill.cancelled',
      't1',
      expect.anything(),
      expect.anything(),
    );
  });
});

// ===========================================================================
describe('AccountingService (P6.2)', () => {
  function txHarness() {
    const tx = {
      journalEntry: { create: jest.fn().mockResolvedValue({}), findUniqueOrThrow: jest.fn() },
      accountBalance: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(), update: jest.fn() },
    };
    return tx;
  }

  /** An account_balances row that already exists for (account, period). */
  function existingBalance(overrides: Record<string, unknown> = {}) {
    return {
      id: 'ab-1',
      tenantId: 't1',
      institutionId: 'i1',
      ledgerAccountId: 'la-1',
      financialPeriodId: 'fp-1',
      openingBalance: new Prisma.Decimal('0.00'),
      totalDebit: new Prisma.Decimal('0.00'),
      totalCredit: new Prisma.Decimal('0.00'),
      closingBalance: new Prisma.Decimal('0.00'),
      createdAt: new Date(),
      createdBy: 'u1',
      updatedAt: new Date(),
      updatedBy: null,
      ...overrides,
    };
  }

  function p2002() {
    return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });
  }

  function postedEntry(overrides: Record<string, unknown> = {}) {
    return {
      id: 'je-1',
      entryNumber: 'JE-00000001',
      referenceType: 'MANUAL',
      totalDebit: new Prisma.Decimal('50.00'),
      totalCredit: new Prisma.Decimal('50.00'),
      postedAt: new Date(),
      reversed: false,
      reversedBy: null,
      financialPeriodId: 'fp-1',
      lines: [],
      ...overrides,
    };
  }

  it('rejects a duplicate ledger account code (V-LA-03)', async () => {
    const { service, prisma } = setup(AccountingService);
    prisma.ledgerAccount.findFirst.mockResolvedValue({ code: '1000', name: 'Cash' });
    await expect(
      service.createLedgerAccount(CTX, {
        code: '1000',
        name: 'Cash on hand',
        accountType: AccountType.ASSET,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates a ledger account active by default and does not fake a journal event', async () => {
    const { service, prisma, publisher, audit } = setup(AccountingService);
    prisma.ledgerAccount.findFirst.mockResolvedValue(null);
    prisma.ledgerAccount.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'la-1', ...data }),
    );
    await service.createLedgerAccount(CTX, {
      code: '1000',
      name: 'Cash',
      accountType: AccountType.ASSET,
    });
    expect(prisma.ledgerAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isActive: true }) }),
    );
    expect(publisher.publish).not.toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'finance.ledger-account.created' }),
    );
  });

  it('rejects a journal entry whose period is not OPEN (V-JE-02 / I-17)', async () => {
    const { service, prisma } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue({
      ...PERIOD,
      status: FinancialPeriodStatus.CLOSED,
    });
    await expect(
      service.postJournalEntry(CTX, {
        description: 'd',
        financialPeriodId: 'fp-1',
        referenceType: 'MANUAL',
        lines: [
          { ledgerAccountId: 'la-1', debit: 10, credit: 0 },
          { ledgerAccountId: 'la-2', debit: 0, credit: 10 },
        ],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a line carrying both debit and credit (§7.2 CHECK)', async () => {
    const { service, prisma } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue(PERIOD);
    prisma.ledgerAccount.findMany.mockResolvedValue([account()]);
    await expect(
      service.postJournalEntry(CTX, {
        description: 'd',
        financialPeriodId: 'fp-1',
        referenceType: 'MANUAL',
        lines: [
          { ledgerAccountId: 'la-1', debit: 10, credit: 10 },
          { ledgerAccountId: 'la-1', debit: 0, credit: 10 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an unbalanced entry (V-JE-06 / I-04)', async () => {
    const { service, prisma } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue(PERIOD);
    prisma.ledgerAccount.findMany.mockResolvedValue([account()]);
    await expect(
      service.postJournalEntry(CTX, {
        description: 'd',
        financialPeriodId: 'fp-1',
        referenceType: 'MANUAL',
        lines: [
          { ledgerAccountId: 'la-1', debit: 10, credit: 0 },
          { ledgerAccountId: 'la-1', debit: 0, credit: 5 },
        ],
      }),
    ).rejects.toThrow(/does not balance/);
  });

  it('rejects a line referencing an inactive ledger account (I-29)', async () => {
    const { service, prisma } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue(PERIOD);
    prisma.ledgerAccount.findMany.mockResolvedValue([account({ isActive: false })]);
    await expect(
      service.postJournalEntry(CTX, {
        description: 'd',
        financialPeriodId: 'fp-1',
        referenceType: 'MANUAL',
        lines: [
          { ledgerAccountId: 'la-1', debit: 10, credit: 0 },
          { ledgerAccountId: 'la-1', debit: 0, credit: 10 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a reference type that is not yet postable', async () => {
    const { service, prisma } = setup(AccountingService);
    await expect(
      service.postJournalEntry(CTX, {
        description: 'd',
        financialPeriodId: 'fp-1',
        referenceType: 'PAYMENT' as never,
        lines: [
          { ledgerAccountId: 'la-1', debit: 10, credit: 0 },
          { ledgerAccountId: 'la-1', debit: 0, credit: 10 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('posts a balanced MANUAL entry and moves balances in the same transaction (I-30)', async () => {
    const { service, prisma, publisher, audit } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue(PERIOD);
    prisma.ledgerAccount.findMany.mockResolvedValue([
      account(),
      account({ id: 'la-2', code: '4000', name: 'Tuition Revenue', accountType: AccountType.REVENUE }),
    ]);
    prisma.journalEntry.findFirst.mockResolvedValue(null);

    const tx = txHarness();
    tx.journalEntry.findUniqueOrThrow.mockResolvedValue({
      id: 'je-1',
      entryNumber: 'JE-00000001',
      referenceType: 'MANUAL',
      totalDebit: new Prisma.Decimal('100.00'),
      totalCredit: new Prisma.Decimal('100.00'),
      postedAt: new Date(),
      reversed: false,
      reversedBy: null,
      financialPeriodId: 'fp-1',
      lines: [],
    });
    prisma.$transaction.mockImplementation((fn: (t: typeof tx) => unknown) => fn(tx));

    const result = await service.postJournalEntry(CTX, {
      description: 'Opening accrual',
      financialPeriodId: 'fp-1',
      referenceType: 'MANUAL',
      lines: [
        { ledgerAccountId: 'la-1', debit: 100, credit: 0 },
        { ledgerAccountId: 'la-2', debit: 0, credit: 100 },
      ],
    });

    expect(tx.journalEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ entryNumber: 'JE-00000001' }),
      }),
    );
    // ASSET is debit-normal, REVENUE credit-normal (§13.1).
    expect(tx.accountBalance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ledgerAccountId: 'la-1',
          closingBalance: new Prisma.Decimal('100.00'),
        }),
      }),
    );
    expect(tx.accountBalance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ledgerAccountId: 'la-2',
          closingBalance: new Prisma.Decimal('100.00'),
        }),
      }),
    );
    expect(publisher.publish).toHaveBeenCalledWith(
      'finance.journal-entry.posted',
      't1',
      expect.anything(),
      expect.anything(),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: expect.objectContaining({ totalDebit: '100.00', totalCredit: '100.00' }),
      }),
    );
    expect((result as { data: { entryNumber: string } }).data.entryNumber).toBe('JE-00000001');
  });

  it('continues the entry number sequence from the latest row', async () => {
    const { service, prisma } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue(PERIOD);
    prisma.ledgerAccount.findMany.mockResolvedValue([account()]);
    prisma.journalEntry.findFirst.mockResolvedValue({ entryNumber: 'JE-00000007' });

    const tx = txHarness();
    tx.journalEntry.findUniqueOrThrow.mockResolvedValue({ id: 'je-2', lines: [] });
    prisma.$transaction.mockImplementation((fn: (t: typeof tx) => unknown) => fn(tx));

    await service.postJournalEntry(CTX, {
      description: 'd',
      financialPeriodId: 'fp-1',
      referenceType: 'MANUAL',
      lines: [
        { ledgerAccountId: 'la-1', debit: 5, credit: 0 },
        { ledgerAccountId: 'la-1', debit: 0, credit: 5 },
      ],
    });
    expect(tx.journalEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ entryNumber: 'JE-00000008' }),
      }),
    );
  });

  it('updates the existing balance row instead of creating a second one (I-30)', async () => {
    const { service, prisma } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue(PERIOD);
    prisma.ledgerAccount.findMany.mockResolvedValue([
      account(),
      account({ id: 'la-2', code: '4000', name: 'Tuition Revenue', accountType: AccountType.REVENUE }),
    ]);
    prisma.journalEntry.findFirst.mockResolvedValue(null);

    const tx = txHarness();
    // la-1 already has a bucket for this period; la-2 has none.
    tx.accountBalance.findFirst
      .mockResolvedValueOnce(
        existingBalance({
          totalDebit: new Prisma.Decimal('100.00'),
          closingBalance: new Prisma.Decimal('100.00'),
        }),
      )
      .mockResolvedValueOnce(null);
    tx.journalEntry.findUniqueOrThrow.mockResolvedValue(postedEntry());
    prisma.$transaction.mockImplementation((fn: (t: typeof tx) => unknown) => fn(tx));

    await service.postJournalEntry(CTX, {
      description: 'Second posting into an existing bucket',
      financialPeriodId: 'fp-1',
      referenceType: 'MANUAL',
      lines: [
        { ledgerAccountId: 'la-1', debit: 50, credit: 0 },
        { ledgerAccountId: 'la-2', debit: 0, credit: 50 },
      ],
    });

    // The existing row is updated in place, keyed by its own id.
    expect(tx.accountBalance.update).toHaveBeenCalledTimes(1);
    expect(tx.accountBalance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ab-1' },
        data: expect.objectContaining({
          totalDebit: new Prisma.Decimal('150.00'),
          totalCredit: new Prisma.Decimal('0.00'),
          // ASSET is debit-normal (§13.1): 0 + 150 - 0.
          closingBalance: new Prisma.Decimal('150.00'),
          updatedBy: 'u1',
        }),
      }),
    );
    // No duplicate row for the account that already had a balance.
    expect(tx.accountBalance.create).toHaveBeenCalledTimes(1);
    expect(tx.accountBalance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ledgerAccountId: 'la-2' }),
      }),
    );
  });

  it('accumulates onto a credit-normal existing balance with the credit-normal sign (§13.1)', async () => {
    const { service, prisma } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue(PERIOD);
    prisma.ledgerAccount.findMany.mockResolvedValue([
      account(),
      account({ id: 'la-2', code: '4000', name: 'Tuition Revenue', accountType: AccountType.REVENUE }),
    ]);
    prisma.journalEntry.findFirst.mockResolvedValue(null);

    const tx = txHarness();
    // REVENUE bucket already holds 40 debit / 200 credit, so its closing balance
    // is 160 on the credit-normal convention. A further credit must RAISE it.
    tx.accountBalance.findFirst
      .mockResolvedValueOnce(
        existingBalance({
          ledgerAccountId: 'la-2',
          totalDebit: new Prisma.Decimal('40.00'),
          totalCredit: new Prisma.Decimal('200.00'),
          closingBalance: new Prisma.Decimal('160.00'),
        }),
      )
      .mockResolvedValueOnce(null);
    tx.journalEntry.findUniqueOrThrow.mockResolvedValue(postedEntry());
    prisma.$transaction.mockImplementation((fn: (t: typeof tx) => unknown) => fn(tx));

    await service.postJournalEntry(CTX, {
      description: 'Additional revenue recognised',
      financialPeriodId: 'fp-1',
      referenceType: 'MANUAL',
      lines: [
        { ledgerAccountId: 'la-2', debit: 0, credit: 25 },
        { ledgerAccountId: 'la-1', debit: 25, credit: 0 },
      ],
    });

    expect(tx.accountBalance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ab-1' },
        data: expect.objectContaining({
          totalDebit: new Prisma.Decimal('40.00'),
          totalCredit: new Prisma.Decimal('225.00'),
          // Credit-normal: 0 + 225 - 40.
          closingBalance: new Prisma.Decimal('185.00'),
        }),
      }),
    );
    expect(tx.accountBalance.create).toHaveBeenCalledTimes(1);
    expect(tx.accountBalance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ledgerAccountId: 'la-1' }),
      }),
    );
  });

  it('a debit lowers a credit-normal closing balance on update (§13.1)', async () => {
    const { service, prisma } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue(PERIOD);
    prisma.ledgerAccount.findMany.mockResolvedValue([
      account(),
      account({ id: 'la-2', code: '4000', name: 'Tuition Revenue', accountType: AccountType.REVENUE }),
    ]);
    prisma.journalEntry.findFirst.mockResolvedValue(null);

    const tx = txHarness();
    tx.accountBalance.findFirst
      .mockResolvedValueOnce(
        existingBalance({
          ledgerAccountId: 'la-2',
          totalDebit: new Prisma.Decimal('40.00'),
          totalCredit: new Prisma.Decimal('200.00'),
          closingBalance: new Prisma.Decimal('160.00'),
        }),
      )
      .mockResolvedValueOnce(null);
    tx.journalEntry.findUniqueOrThrow.mockResolvedValue(postedEntry());
    prisma.$transaction.mockImplementation((fn: (t: typeof tx) => unknown) => fn(tx));

    await service.postJournalEntry(CTX, {
      description: 'Contra-revenue reversal',
      financialPeriodId: 'fp-1',
      referenceType: 'MANUAL',
      lines: [
        { ledgerAccountId: 'la-2', debit: 10, credit: 0 },
        { ledgerAccountId: 'la-1', debit: 0, credit: 10 },
      ],
    });

    // The sign is the discriminator: on a credit-normal account a debit must
    // REDUCE the closing balance, not increase it.
    expect(tx.accountBalance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalDebit: new Prisma.Decimal('50.00'),
          totalCredit: new Prisma.Decimal('200.00'),
          // Credit-normal: 0 + 200 - 50, i.e. 160 -> 150.
          closingBalance: new Prisma.Decimal('150.00'),
        }),
      }),
    );
  });

  it('retries a P2002 raised by the transaction and emits the event exactly once', async () => {
    const { service, prisma, publisher, audit } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue(PERIOD);
    prisma.ledgerAccount.findMany.mockResolvedValue([
      account(),
      account({ id: 'la-2', code: '4000', name: 'Tuition Revenue', accountType: AccountType.REVENUE }),
    ]);
    // The counter is re-read per attempt, so the retry sees a fresh number.
    prisma.journalEntry.findFirst
      .mockResolvedValueOnce({ entryNumber: 'JE-00000001' })
      .mockResolvedValueOnce({ entryNumber: 'JE-00000002' });

    const committed = txHarness();
    committed.journalEntry.findUniqueOrThrow.mockResolvedValue(
      postedEntry({ id: 'je-2', entryNumber: 'JE-00000002' }),
    );
    prisma.$transaction
      .mockRejectedValueOnce(p2002())
      .mockImplementationOnce((fn: (t: typeof committed) => unknown) => fn(committed));

    const result = await service.postJournalEntry(CTX, {
      description: 'Lost race on the entry number',
      financialPeriodId: 'fp-1',
      referenceType: 'MANUAL',
      lines: [
        { ledgerAccountId: 'la-1', debit: 50, credit: 0 },
        { ledgerAccountId: 'la-2', debit: 0, credit: 50 },
      ],
    });

    // The first attempt rolled back, so only the second attempt emitted. One
    // shared eventId keeps the D-4 dedup a single audit row.
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(audit.record).toHaveBeenCalledTimes(1);
    expect((result as { data: { entryNumber: string } }).data.entryNumber).toBe('JE-00000002');
  });

  it('maps an entry number that stays contended to a 409 rather than a 500', async () => {
    const { service, prisma, publisher, audit } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue(PERIOD);
    prisma.ledgerAccount.findMany.mockResolvedValue([
      account(),
      account({ id: 'la-2', code: '4000', name: 'Tuition Revenue', accountType: AccountType.REVENUE }),
    ]);
    prisma.journalEntry.findFirst.mockResolvedValue({ entryNumber: 'JE-00000001' });
    prisma.$transaction.mockRejectedValue(p2002());

    await expect(
      service.postJournalEntry(CTX, {
        description: 'Always contended',
        financialPeriodId: 'fp-1',
        referenceType: 'MANUAL',
        lines: [
          { ledgerAccountId: 'la-1', debit: 50, credit: 0 },
          { ledgerAccountId: 'la-2', debit: 0, credit: 50 },
        ],
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    // Bounded retries: nothing committed, so nothing was emitted.
    expect(prisma.$transaction).toHaveBeenCalledTimes(3);
    expect(publisher.publish).not.toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
  });

  it('does not re-post when the post-commit audit emission fails', async () => {
    const { service, prisma, audit } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue(PERIOD);
    prisma.ledgerAccount.findMany.mockResolvedValue([
      account(),
      account({ id: 'la-2', code: '4000', name: 'Tuition Revenue', accountType: AccountType.REVENUE }),
    ]);
    prisma.journalEntry.findFirst.mockResolvedValue(null);

    const tx = txHarness();
    tx.journalEntry.findUniqueOrThrow.mockResolvedValue(postedEntry());
    prisma.$transaction.mockImplementation((fn: (t: typeof tx) => unknown) => fn(tx));
    // The transaction has already COMMITTED when the audit write fails.
    audit.record.mockRejectedValue(p2002());

    // The failure surfaces to the caller rather than being masked as a 409.
    await expect(
      service.postJournalEntry(CTX, {
        description: 'Committed, then the audit write failed',
        financialPeriodId: 'fp-1',
        referenceType: 'MANUAL',
        lines: [
          { ledgerAccountId: 'la-1', debit: 50, credit: 0 },
          { ledgerAccountId: 'la-2', debit: 0, credit: 50 },
        ],
      }),
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);

    // Exactly one entry exists. A P2002 raised after the commit must never drive
    // a second posting of an entry that is already durable.
    expect(tx.journalEntry.create).toHaveBeenCalledTimes(1);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('rejects an overlapping financial period for the same session (§13.4)', async () => {
    const { service, prisma } = setup(AccountingService);
    prisma.financialPeriod.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'fp-9', name: 'Other' });
    prisma.academicSession.findFirst.mockResolvedValue(SESSION);
    await expect(
      service.createPeriod(CTX, {
        name: '2026 Term 2',
        academicSessionId: 'as-1',
        startDate: '2026-05-01',
        endDate: '2026-10-01',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates a financial period OPEN with an audit row and no domain event', async () => {
    const { service, prisma, publisher, audit } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue(null);
    prisma.academicSession.findFirst.mockResolvedValue(SESSION);
    prisma.financialPeriod.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'fp-1', ...data }),
    );
    await service.createPeriod(CTX, {
      name: '2026 Term 1',
      academicSessionId: 'as-1',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
    });
    expect(prisma.financialPeriod.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: FinancialPeriodStatus.OPEN }),
      }),
    );
    expect(publisher.publish).not.toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'finance.financial-period.created' }),
    );
  });

  it('rejects a period whose end date precedes its start date', async () => {
    const { service, prisma } = setup(AccountingService);
    prisma.financialPeriod.findFirst.mockResolvedValue(null);
    prisma.academicSession.findFirst.mockResolvedValue(SESSION);
    await expect(
      service.createPeriod(CTX, {
        name: 'Bad',
        academicSessionId: 'as-1',
        startDate: '2026-06-30',
        endDate: '2026-01-01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

// ===========================================================================
describe('DiscountService (P6.2)', () => {
  it('rejects a percentage discount above 100 (V-DC-03)', async () => {
    const { service } = setup(DiscountService);
    await expect(
      service.createDiscount(CTX, {
        name: 'Too much',
        discountType: DiscountType.PERCENTAGE,
        value: 150,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts a fixed discount above 100 (V-DC-03 caps PERCENTAGE only)', async () => {
    const { service, prisma } = setup(DiscountService);
    prisma.discount.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'd-1', ...data }),
    );
    await expect(
      service.createDiscount(CTX, {
        name: 'Sibling bursary',
        discountType: DiscountType.FIXED,
        value: 5000,
      }),
    ).resolves.toMatchObject({ success: true });
  });

  it('rejects a zero-value discount', async () => {
    const { service } = setup(DiscountService);
    await expect(
      service.createDiscount(CTX, {
        name: 'Free',
        discountType: DiscountType.FIXED,
        value: 0,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an unknown applicable session (§8.2)', async () => {
    const { service, prisma } = setup(DiscountService);
    prisma.academicSession.findMany.mockResolvedValue([]);
    await expect(
      service.createDiscount(CTX, {
        name: 'D',
        discountType: DiscountType.FIXED,
        value: 10,
        applicableSessionIds: ['00000000-0000-4000-8000-000000000001'],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a discount DRAFT and emits DiscountCreated', async () => {
    const { service, prisma, publisher } = setup(DiscountService);
    prisma.discount.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'd-1', ...data }),
    );
    const result = await service.createDiscount(CTX, {
      name: 'Early bird',
      discountType: DiscountType.PERCENTAGE,
      value: 10,
    });
    expect(prisma.discount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: DiscountStatus.DRAFT }),
      }),
    );
    expect(publisher.publish).toHaveBeenCalledWith(
      'finance.discount.created',
      't1',
      expect.anything(),
      expect.anything(),
    );
    expect((result as { data: { value: string } }).data.value).toBe('10.00');
  });

  it('rejects a version mismatch on update', async () => {
    const { service, prisma } = setup(DiscountService);
    prisma.discount.findFirst.mockResolvedValue({
      id: 'd-1',
      discountType: DiscountType.FIXED,
      value: new Prisma.Decimal('10.00'),
      version: 2,
    });
    await expect(
      service.updateDiscount(CTX, 'd-1', { value: 20, version: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('audits an update without re-emitting DiscountCreated (§5.8 declares no update event)', async () => {
    const { service, prisma, publisher, audit } = setup(DiscountService);
    prisma.discount.findFirst.mockResolvedValue({
      id: 'd-1',
      discountType: DiscountType.FIXED,
      value: new Prisma.Decimal('10.00'),
      version: 1,
    });
    prisma.discount.update.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'd-1', name: 'D', ...data }),
    );
    await service.updateDiscount(CTX, 'd-1', { value: 20 });
    expect(publisher.publish).not.toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'finance.discount.updated' }),
    );
  });

  it('rejects a discount update that would make an existing percentage exceed 100', async () => {
    const { service, prisma } = setup(DiscountService);
    prisma.discount.findFirst.mockResolvedValue({
      id: 'd-1',
      discountType: DiscountType.PERCENTAGE,
      value: new Prisma.Decimal('10.00'),
      version: 1,
    });
    await expect(
      service.updateDiscount(CTX, 'd-1', { discountType: DiscountType.PERCENTAGE, value: 120 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

// ===========================================================================
describe('FinancialPolicyService (P6.2)', () => {
  // Version allocation, supersession and insert run in one transaction, so the
  // mocked tx client is the surface these assertions target.
  function txPolicyHarness() {
    const tx = {
      financialPolicy: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) =>
          Promise.resolve({ id: 'fp-new', ...data }),
        ),
      },
    };
    return tx;
  }

  function withTransaction(prisma: ReturnType<typeof basePrisma>) {
    const tx = txPolicyHarness();
    prisma.$transaction.mockImplementation((fn: (t: typeof tx) => unknown) => fn(tx));
    return tx;
  }

  it('allocates version 1 on first create and defaults to DRAFT', async () => {
    const { service, prisma, publisher } = setup(FinancialPolicyService);
    prisma.financialPolicy.findFirst.mockResolvedValue(null);
    const tx = withTransaction(prisma);
    const result = await service.createPolicy(CTX, {
      policyType: 'CURRENCY',
      policyKey: 'settlement',
      value: { code: 'NGN' },
    });
    expect(tx.financialPolicy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: 1, status: PolicyStatus.DRAFT }),
      }),
    );
    // A DRAFT first version must not retire anything.
    expect(tx.financialPolicy.updateMany).not.toHaveBeenCalled();
    expect(publisher.publish).toHaveBeenCalledWith(
      'finance.financial-policy.created',
      't1',
      expect.anything(),
      expect.anything(),
    );
    expect((result as { data: { version: number } }).data.version).toBe(1);
  });

  it('supersedes the previous ACTIVE version when a new ACTIVE version is created', async () => {
    const { service, prisma } = setup(FinancialPolicyService);
    prisma.financialPolicy.findFirst.mockResolvedValue({ version: 2 });
    const tx = withTransaction(prisma);
    await service.createPolicy(CTX, {
      policyType: 'CURRENCY',
      policyKey: 'settlement',
      value: { code: 'USD' },
      status: PolicyStatus.ACTIVE,
    });
    expect(tx.financialPolicy.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: PolicyStatus.SUPERSEDED },
      }),
    );
    expect(tx.financialPolicy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: 3, status: PolicyStatus.ACTIVE }),
      }),
    );
  });

  it('appends a new version on update instead of mutating the row (V-FP-04)', async () => {
    const { service, prisma, publisher } = setup(FinancialPolicyService);
    prisma.financialPolicy.findFirst
      .mockResolvedValueOnce({
        id: 'fp-1',
        policyType: 'TAX',
        policyKey: 'vat',
        version: 1,
        status: PolicyStatus.ACTIVE,
        description: null,
        effectiveFrom: new Date('2026-01-01'),
        effectiveTo: null,
      })
      .mockResolvedValueOnce({ version: 1 });
    const tx = withTransaction(prisma);

    const result = await service.updatePolicy(CTX, 'fp-1', { value: { rate: 7.5 } });
    expect(tx.financialPolicy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: 2, status: PolicyStatus.ACTIVE }),
      }),
    );
    // The referenced row is retired, but only as part of the same transaction.
    expect(tx.financialPolicy.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ NOT: { id: 'fp-1' } }),
      }),
    );
    expect(publisher.publish).toHaveBeenCalledWith(
      'finance.financial-policy.updated',
      't1',
      expect.anything(),
      expect.anything(),
    );
    expect((result as { data: { version: number } }).data.version).toBe(2);
  });

  it('leaves the version in force alone when the new version is a DRAFT', async () => {
    const { service, prisma } = setup(FinancialPolicyService);
    prisma.financialPolicy.findFirst
      .mockResolvedValueOnce({
        id: 'fp-1',
        policyType: 'TAX',
        policyKey: 'vat',
        version: 1,
        status: PolicyStatus.ACTIVE,
        description: null,
        effectiveFrom: new Date('2026-01-01'),
        effectiveTo: null,
      })
      .mockResolvedValueOnce({ version: 1 });
    const tx = withTransaction(prisma);

    await service.updatePolicy(CTX, 'fp-1', { value: {}, status: PolicyStatus.DRAFT });
    expect(tx.financialPolicy.updateMany).not.toHaveBeenCalled();
    expect(tx.financialPolicy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: 2, status: PolicyStatus.DRAFT }),
      }),
    );
  });

  it('maps a lost version race to 409 rather than a 500', async () => {
    const { service, prisma } = setup(FinancialPolicyService);
    prisma.financialPolicy.findFirst.mockResolvedValue({ version: 1 });
    prisma.$transaction.mockRejectedValue({ code: 'P2002' });
    await expect(
      service.createPolicy(CTX, {
        policyType: 'TAX',
        policyKey: 'vat',
        value: {},
        status: PolicyStatus.ACTIVE,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('refuses to revise a SUPERSEDED version (§5.6 is terminal)', async () => {
    const { service, prisma } = setup(FinancialPolicyService);
    prisma.financialPolicy.findFirst.mockResolvedValue({
      id: 'fp-1',
      policyType: 'TAX',
      policyKey: 'vat',
      version: 1,
      status: PolicyStatus.SUPERSEDED,
    });
    await expect(
      service.updatePolicy(CTX, 'fp-1', { value: {} }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects an effective window that ends before it starts', async () => {
    const { service } = setup(FinancialPolicyService);
    await expect(
      service.createPolicy(CTX, {
        policyType: 'TAX',
        policyKey: 'vat',
        value: {},
        effectiveFrom: '2026-06-30',
        effectiveTo: '2026-01-01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

// ===========================================================================
describe('P6.2 DTO validation (app ValidationPipe policy)', () => {
  // Mirrors src/app-http.ts so these assert the behaviour a request actually gets.
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  });

  const validate = (dto: new () => unknown, body: Record<string, unknown>) =>
    pipe.transform(body, { type: 'body', metatype: dto } as never);

  it('rejects academicSessionId on a schedule update (BR-29 immutability)', async () => {
    await expect(
      validate(UpdateFeeScheduleDto, { name: 'Renamed', academicSessionId: 'as-2' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts a schedule update that omits the session', async () => {
    await expect(validate(UpdateFeeScheduleDto, { name: 'Renamed' })).resolves.toMatchObject({
      name: 'Renamed',
    });
  });

  it('rejects a policy type outside the eight §7.2 values', async () => {
    await expect(
      validate(CreateFinancialPolicyDto, { policyType: 'NOT_A_TYPE', policyKey: 'k', value: {} }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts every §7.2 policy type', async () => {
    for (const policyType of POLICY_TYPES) {
      await expect(
        validate(CreateFinancialPolicyDto, { policyType, policyKey: 'k', value: {} }),
      ).resolves.toMatchObject({ policyType });
    }
  });

  it('rejects a zero discount value (V-DC-03, > 0) at the edge', async () => {
    await expect(
      validate(CreateDiscountDto, { name: 'd', discountType: 'FIXED', value: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts a percentage over 100 at the DTO; the service caps it by type', async () => {
    // class-validator cannot see discountType, so the absolute bound is wider
    // than the percentage cap. The cap is asserted in the DiscountService block.
    await expect(
      validate(CreateDiscountDto, { name: 'd', discountType: 'PERCENTAGE', value: 150 }),
    ).resolves.toMatchObject({ value: 150 });
  });

  it('rejects a discount value with more than two decimal places', async () => {
    await expect(
      validate(CreateDiscountDto, { name: 'd', discountType: 'FIXED', value: 1.005 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a journal line carrying both debit and credit', async () => {
    await expect(
      validate(PostJournalEntryDto, {
        description: 'd',
        financialPeriodId: '11111111-1111-4111-8111-111111111111',
        referenceType: 'MANUAL',
        lines: [
          { ledgerAccountId: '22222222-2222-4222-8222-222222222222', debit: 10, credit: 10 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a journal reference type other than MANUAL', async () => {
    await expect(
      validate(PostJournalEntryDto, {
        description: 'd',
        financialPeriodId: '11111111-1111-4111-8111-111111111111',
        referenceType: 'PAYMENT',
        lines: [
          { ledgerAccountId: '22222222-2222-4222-8222-222222222222', debit: 10, credit: 0 },
          { ledgerAccountId: '33333333-3333-4333-8333-333333333333', debit: 0, credit: 10 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
