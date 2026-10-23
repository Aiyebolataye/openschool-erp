import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  AccountType,
  FinancialPeriodStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventPublisher } from '../../events/event-publisher';
import { AuditService } from '../../audit/audit.service';
import { FinanceContext } from '../finance.types';
import {
  FinanceServiceBase,
  PagedSlice,
  boundedPage,
  institutionWhere,
  ok,
  okList,
} from '../finance.common';
import { FinanceEvents, emitFinanceEventAudited, recordFinanceAuditOnly } from '../finance.events';
import { decimalToString } from '../dto/fee.dto';
import {
  CreateFinancialPeriodDto,
  CreateLedgerAccountDto,
  JOURNAL_REFERENCE_TYPES,
  PostJournalEntryDto,
  money,
} from '../dto/accounting.dto';

type LedgerAccountRow = Prisma.LedgerAccountGetPayload<Record<string, never>>;
type JournalEntryRow = Prisma.JournalEntryGetPayload<{
  include: { lines: { include: { ledgerAccount: true } } };
}>;
type AccountBalanceRow = Prisma.AccountBalanceGetPayload<{
  include: { ledgerAccount: true; financialPeriod: true };
}>;

/** §13.1 — normal balance per account type. */
const DEBIT_NORMAL: ReadonlySet<AccountType> = new Set([
  AccountType.ASSET,
  AccountType.EXPENSE,
]);

/** Journal entry number prefix. §7.2 fixes uniqueness + sequentiality, not the format. */
const ENTRY_NUMBER_PREFIX = 'JE';
const ENTRY_NUMBER_PAD = 8;
/** Bounded retry for the per-institution entry-number counter. */
const ENTRY_NUMBER_ATTEMPTS = 3;

/**
 * P6.2 — Accounting service (frozen Finance §6.6 V-LA-01..03 / V-JE-01..06,
 * §6.4 I-04/I-07/I-17/I-29/I-30, §7.2 accounting tables, §10.3 Accounting, §13).
 *
 * Not implemented, deliberately:
 * - `POST /accounting/periods/:id/close` (finance:period:manage). §13.4 defines
 *   what closing does, but the authority allowed to close a period is an open
 *   D-7 question, so the operation is not exposed. Creating a period is.
 * - Journal entries whose reference is PAYMENT, REFUND, ADJUSTMENT or WRITE_OFF.
 *   V-JE-04 requires the referenced record to exist, and none of those tables has
 *   a §7.2-conformant shape yet (they are gated behind the Finance
 *   legacy-archival decision), so only MANUAL is accepted.
 */
@Injectable()
export class AccountingService extends FinanceServiceBase {
  constructor(
    prisma: PrismaService,
    publisher: EventPublisher,
    audit: AuditService,
  ) {
    super(prisma, publisher, audit);
  }

  // ------------------------------------------------------- ledger accounts
  async listLedgerAccounts(
    ctx: FinanceContext,
    query: { page?: number; limit?: number; accountType?: AccountType },
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const where: Prisma.LedgerAccountWhereInput = {
      ...institutionWhere(ctx.tenantId, institutionId),
      deletedAt: null,
      ...(query.accountType ? { accountType: query.accountType } : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.ledgerAccount.count({ where }),
      this.prisma.ledgerAccount.findMany({
        where,
        orderBy: { code: 'asc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(rows, total, p, l);
  }

  /** V-LA-01 (name) and V-LA-03 (code) are both unique per institution (§7.2). */
  async createLedgerAccount(ctx: FinanceContext, dto: CreateLedgerAccountDto) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    await this.resolveInstitution(tenantId, institutionId);

    const clash = await this.prisma.ledgerAccount.findFirst({
      where: {
        tenantId,
        institutionId,
        deletedAt: null,
        OR: [{ code: dto.code }, { name: dto.name }],
      },
      select: { code: true, name: true },
    });
    if (clash) {
      throw new ConflictException(
        clash.code === dto.code
          ? `ledger account code "${dto.code}" already exists`
          : `ledger account name "${dto.name}" already exists`,
      );
    }

    const account = await this.prisma.ledgerAccount.create({
      data: {
        tenantId,
        institutionId,
        code: dto.code,
        name: dto.name,
        accountType: dto.accountType,
        description: dto.description,
        isActive: true,
        createdBy: ctx.userId,
      },
    });

    // §5.8 declares no domain event for creating a ledger account, so this is an
    // audit row only — emitting JournalEntryPosted here would claim a posting.
    await recordFinanceAuditOnly(this.audit, 'ledger-account.created', {
      tenantId,
      institutionId,
      entityType: 'ledgerAccount',
      entityId: account.id,
      actorId: ctx.userId,
      changes: {
        code: account.code,
        name: account.name,
        accountType: account.accountType,
        isActive: account.isActive,
      },
    });

    return ok(account);
  }

  // --------------------------------------------------------- journal entries
  async listJournalEntries(
    ctx: FinanceContext,
    query: { page?: number; limit?: number; financialPeriodId?: string; referenceId?: string; referenceType?: string },
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const where: Prisma.JournalEntryWhereInput = {
      ...institutionWhere(ctx.tenantId, institutionId),
      ...(query.financialPeriodId ? { financialPeriodId: query.financialPeriodId } : {}),
      ...(query.referenceId ? { referenceId: query.referenceId } : {}),
      ...(query.referenceType ? { referenceType: query.referenceType } : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.journalEntry.count({ where }),
      this.prisma.journalEntry.findMany({
        where,
        orderBy: { postedAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
        include: { lines: { include: { ledgerAccount: true } } },
      }),
    ]);
    return okList(rows.map((row) => this.serializeEntry(row)), total, p, l);
  }

  async getJournalEntry(ctx: FinanceContext, id: string) {
    const institutionId = this.assertInstitutionContext(ctx);
    const entry = await this.resolveEntry(ctx.tenantId, institutionId, id);
    return ok(this.serializeEntry(entry));
  }

  private async resolveEntry(
    tenantId: string,
    institutionId: string,
    id: string,
  ): Promise<JournalEntryRow> {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, tenantId, institutionId },
      include: { lines: { include: { ledgerAccount: true } } },
    });
    if (!entry) {
      throw new NotFoundException(`journal entry ${id} not found`);
    }
    return entry;
  }

  /**
   * Posts one balanced double-entry journal entry and updates every touched
   * account balance in the same transaction (I-30).
   *
   * Validation, in order, all before the write:
   * - V-JE-02 / I-17 / §13.4 — the period must be OPEN.
   * §7.2 CHECK — exactly one of debit or credit is non-zero on each line.
   * - V-JE-05 — at least 2 lines (also enforced by the DTO).
   * - I-29 — every line references an existing, active ledger account.
   * - V-JE-06 / I-04 / BR-013 / §13.2 — total debits equal total credits.
   */
  async postJournalEntry(ctx: FinanceContext, dto: PostJournalEntryDto) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    await this.resolveInstitution(tenantId, institutionId);

    if (!(JOURNAL_REFERENCE_TYPES as readonly string[]).includes(dto.referenceType)) {
      throw new BadRequestException(
        `journal reference type ${dto.referenceType} is not available yet; only ${JOURNAL_REFERENCE_TYPES.join(', ')} can be posted until the payment, refund, adjustment and write-off tables exist`,
      );
    }

    const period = await this.prisma.financialPeriod.findFirst({
      where: {
        id: dto.financialPeriodId,
        tenantId,
        institutionId,
        deletedAt: null,
      },
    });
    if (!period) {
      throw new NotFoundException(`financial period ${dto.financialPeriodId} not found`);
    }
    if (period.status !== FinancialPeriodStatus.OPEN) {
      throw new ConflictException(
        `financial period ${period.id} is ${period.status}; only an OPEN period accepts journal entries`,
      );
    }

    if (dto.lines.length < 2) {
      throw new BadRequestException('a journal entry requires at least 2 lines');
    }

    const accountIds = [...new Set(dto.lines.map((line) => line.ledgerAccountId))];
    const accounts = await this.prisma.ledgerAccount.findMany({
      where: {
        id: { in: accountIds },
        tenantId,
        institutionId,
        deletedAt: null,
      },
    });
    const accountById = new Map(accounts.map((account) => [account.id, account]));

    let totalDebit = new Prisma.Decimal(0);
    let totalCredit = new Prisma.Decimal(0);

    for (const [index, line] of dto.lines.entries()) {
      const debit = new Prisma.Decimal(line.debit);
      const credit = new Prisma.Decimal(line.credit);
      const debitNonZero = !debit.isZero();
      const creditNonZero = !credit.isZero();

      // §7.2 — "exactly one of debit or credit must be non-zero per line".
      if (debitNonZero === creditNonZero) {
        throw new BadRequestException(
          `line ${index + 1} must carry exactly one of debit or credit, not ${debitNonZero && creditNonZero ? 'both' : 'neither'}`,
        );
      }

      const account = accountById.get(line.ledgerAccountId);
      if (!account) {
        throw new NotFoundException(
          `ledger account ${line.ledgerAccountId} not found in institution ${institutionId}`,
        );
      }
      if (!account.isActive) {
        // I-29 — lines must reference ACTIVE ledger accounts.
        throw new BadRequestException(
          `ledger account ${account.code} is inactive and cannot be posted to`,
        );
      }

      totalDebit = totalDebit.add(debit);
      totalCredit = totalCredit.add(credit);
    }

    if (!totalDebit.equals(totalCredit)) {
      throw new BadRequestException(
        `journal entry does not balance: total debit ${totalDebit.toFixed(2)} != total credit ${totalCredit.toFixed(2)}`,
      );
    }

    // §7.2 — entry_number is UNIQUE per institution and sequential. The counter
    // is derived from existing rows inside the posting transaction; the unique
    // index is the real guard, so a lost race is retried a bounded number of
    // times rather than surfacing as a 500.
    //
    // Only the transaction is retried. Once it commits, the entry is durable, so
    // the event/audit emission deliberately sits outside this loop: retrying a
    // post-commit failure would post a SECOND entry for a write that already
    // succeeded.
    let lastError: unknown;
    let posted: JournalEntryRow | undefined;
    for (let attempt = 0; attempt < ENTRY_NUMBER_ATTEMPTS && !posted; attempt += 1) {
      const entryNumber = await this.nextEntryNumber(
        tenantId,
        institutionId,
        this.prisma,
      );
      try {
        posted = await this.prisma.$transaction(async (tx) => {
          // §7.2 declares reference_id NOT NULL, and a MANUAL entry has no
          // external source document, so the entry is its own reference: the id
          // is minted up front and reused as reference_id. That keeps the column
          // non-null and keeps idx_je_reference meaningful without inventing a
          // source record that does not exist.
          const entryId = randomUUID();

          await tx.journalEntry.create({
            data: {
              id: entryId,
              tenantId,
              institutionId,
              entryNumber,
              description: dto.description,
              referenceType: dto.referenceType,
              referenceId: dto.referenceId ?? entryId,
              financialPeriodId: period.id,
              totalDebit,
              totalCredit,
              postedAt: new Date(),
              reversed: false,
              createdBy: ctx.userId,
              lines: {
                create: dto.lines.map((line, index) => ({
                  tenantId,
                  institutionId,
                  ledgerAccountId: line.ledgerAccountId,
                  lineNumber: index + 1,
                  debit: new Prisma.Decimal(line.debit),
                  credit: new Prisma.Decimal(line.credit),
                  description: line.description,
                  createdBy: ctx.userId,
                })),
              },
            },
          });

          // I-30 — balances move in the same transaction as the entry.
          for (const line of dto.lines) {
            const account = accountById.get(line.ledgerAccountId);
            if (!account) continue;
            const debit = new Prisma.Decimal(line.debit);
            const credit = new Prisma.Decimal(line.credit);
            const debitNormal = DEBIT_NORMAL.has(account.accountType);

            const existing = await tx.accountBalance.findFirst({
              where: {
                tenantId,
                ledgerAccountId: line.ledgerAccountId,
                financialPeriodId: period.id,
              },
            });

            if (existing) {
              const nextTotalDebit = existing.totalDebit.add(debit);
              const nextTotalCredit = existing.totalCredit.add(credit);
              const nextClosing = debitNormal
                ? existing.openingBalance.add(nextTotalDebit).minus(nextTotalCredit)
                : existing.openingBalance.add(nextTotalCredit).minus(nextTotalDebit);
              await tx.accountBalance.update({
                where: { id: existing.id },
                data: {
                  totalDebit: nextTotalDebit,
                  totalCredit: nextTotalCredit,
                  closingBalance: nextClosing,
                  updatedBy: ctx.userId,
                },
              });
            } else {
              const closing = debitNormal ? debit.minus(credit) : credit.minus(debit);
              await tx.accountBalance.create({
                data: {
                  tenantId,
                  institutionId,
                  ledgerAccountId: line.ledgerAccountId,
                  financialPeriodId: period.id,
                  openingBalance: new Prisma.Decimal(0),
                  totalDebit: debit,
                  totalCredit: credit,
                  closingBalance: closing,
                  createdBy: ctx.userId,
                },
              });
            }
          }

          // Re-read with the relations the response needs. I-07 keeps a posted
          // entry immutable, so nothing can change between the write and this
          // read inside the same transaction.
          return tx.journalEntry.findUniqueOrThrow({
            where: { id: entryId },
            include: { lines: { include: { ledgerAccount: true } } },
          });
        });
      } catch (error) {
        lastError = error;
        const isUniqueViolation =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002';
        if (!isUniqueViolation) {
          throw error;
        }
      }
    }

    if (!posted) {
      throw new ConflictException(
        'could not allocate a unique journal entry number after several attempts',
        { cause: lastError },
      );
    }

    const entry = posted;

    // The entry is committed, so this is outside the retry loop by construction.
    // A failure here surfaces to the caller but never re-posts the entry. The
    // single eventId is still shared by the event and the audit row, so the D-4
    // dedup collapses a redelivery exactly as it did when this ran inside the
    // transaction's try block.
    await emitFinanceEventAudited(
      this.publisher,
      this.audit,
      FinanceEvents.JournalEntryPosted,
      {
        tenantId,
        institutionId,
        entityType: 'journalEntry',
        entityId: entry.id,
        actorId: ctx.userId,
        payload: {
          entryNumber: entry.entryNumber,
          referenceType: entry.referenceType,
          financialPeriodId: entry.financialPeriodId,
        },
        // §129 — the audit row carries the amounts.
        changes: {
          entryNumber: entry.entryNumber,
          totalDebit: decimalToString(entry.totalDebit),
          totalCredit: decimalToString(entry.totalCredit),
          lineCount: entry.lines.length,
          financialPeriodId: entry.financialPeriodId,
        },
      },
    );

    return ok(this.serializeEntry(entry));
  }

  /**
   * Sequential per-institution entry number. Only rows whose number carries this
   * prefix are considered, so a number minted by any other producer can never be
   * read as a gap to fill.
   */
  private async nextEntryNumber(
    tenantId: string,
    institutionId: string,
    client: PrismaService | Prisma.TransactionClient,
  ): Promise<string> {
    const latest = await client.journalEntry.findFirst({
      where: {
        tenantId,
        institutionId,
        entryNumber: { startsWith: `${ENTRY_NUMBER_PREFIX}-` },
      },
      orderBy: { entryNumber: 'desc' },
      select: { entryNumber: true },
    });
    const lastNumeric = latest
      ? Number.parseInt(latest.entryNumber.slice(ENTRY_NUMBER_PREFIX.length + 1), 10)
      : 0;
    const next = (Number.isFinite(lastNumeric) ? lastNumeric : 0) + 1;
    return `${ENTRY_NUMBER_PREFIX}-${String(next).padStart(ENTRY_NUMBER_PAD, '0')}`;
  }

  // ---------------------------------------------------------------- balances
  async listBalances(
    ctx: FinanceContext,
    query: { page?: number; limit?: number; financialPeriodId?: string; ledgerAccountId?: string },
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const where: Prisma.AccountBalanceWhereInput = {
      ...institutionWhere(ctx.tenantId, institutionId),
      ...(query.financialPeriodId ? { financialPeriodId: query.financialPeriodId } : {}),
      ...(query.ledgerAccountId ? { ledgerAccountId: query.ledgerAccountId } : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.accountBalance.count({ where }),
      this.prisma.accountBalance.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
        include: { ledgerAccount: true, financialPeriod: true },
      }),
    ]);
    return okList(rows.map((row) => this.serializeBalance(row)), total, p, l);
  }

  // -------------------------------------------------------- financial periods
  async listPeriods(
    ctx: FinanceContext,
    query: {
      page?: number;
      limit?: number;
      status?: FinancialPeriodStatus;
      academicSessionId?: string;
    },
  ) {
    const institutionId = this.assertInstitutionContext(ctx);
    const { page: p, limit: l } = boundedPage(query.page, query.limit);
    const where: Prisma.FinancialPeriodWhereInput = {
      ...institutionWhere(ctx.tenantId, institutionId),
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.academicSessionId ? { academicSessionId: query.academicSessionId } : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.financialPeriod.count({ where }),
      this.prisma.financialPeriod.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return okList(rows, total, p, l);
  }

  async createPeriod(ctx: FinanceContext, dto: CreateFinancialPeriodDto) {
    const institutionId = this.assertInstitutionContext(ctx);
    const tenantId = ctx.tenantId;
    await this.resolveInstitution(tenantId, institutionId);

    // §7.2 — UNIQUE (tenant_id, institution_id, name).
    const duplicate = await this.prisma.financialPeriod.findFirst({
      where: { tenantId, institutionId, name: dto.name, deletedAt: null },
      select: { id: true },
    });
    if (duplicate) {
      throw new ConflictException(`financial period "${dto.name}" already exists`);
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end.getTime() < start.getTime()) {
      throw new BadRequestException('endDate must not be before startDate');
    }

    // §8.2 — cross-domain session reference, verified by lookup.
    const session = await this.prisma.academicSession.findFirst({
      where: { id: dto.academicSessionId, tenantId, institutionId },
      select: { id: true },
    });
    if (!session) {
      throw new NotFoundException(
        `academic session ${dto.academicSessionId} not found in institution ${institutionId}`,
      );
    }

    // §13.4 — periods align with academic sessions. Overlap is rejected so a
    // session can never be billed or posted into two competing open periods.
    const overlapping = await this.prisma.financialPeriod.findFirst({
      where: {
        tenantId,
        institutionId,
        deletedAt: null,
        academicSessionId: dto.academicSessionId,
        startDate: { lte: end },
        endDate: { gte: start },
      },
      select: { id: true, name: true },
    });
    if (overlapping) {
      throw new ConflictException(
        `financial period "${overlapping.name}" already covers part of this date range for the same academic session`,
      );
    }

    const period = await this.prisma.financialPeriod.create({
      data: {
        tenantId,
        institutionId,
        name: dto.name,
        academicSessionId: dto.academicSessionId,
        startDate: start,
        endDate: end,
        // §5.6 / §13.4 — a new period starts OPEN; only an explicit close moves it on.
        status: FinancialPeriodStatus.OPEN,
        createdBy: ctx.userId,
      },
    });

    // §5.8 declares FinancialPeriodClosed, not a "period opened" event, so
    // opening a period records an audit row only.
    await recordFinanceAuditOnly(this.audit, 'financial-period.created', {
      tenantId,
      institutionId,
      entityType: 'financialPeriod',
      entityId: period.id,
      actorId: ctx.userId,
      changes: {
        name: period.name,
        status: period.status,
        startDate: period.startDate.toISOString().slice(0, 10),
        endDate: period.endDate.toISOString().slice(0, 10),
        academicSessionId: period.academicSessionId,
      },
    });

    return ok(period);
  }

  private serializeEntry(entry: JournalEntryRow) {
    return {
      ...entry,
      totalDebit: decimalToString(entry.totalDebit),
      totalCredit: decimalToString(entry.totalCredit),
      lines: entry.lines.map((line) => ({
        ...line,
        debit: decimalToString(line.debit),
        credit: decimalToString(line.credit),
      })),
    };
  }

  private serializeBalance(balance: AccountBalanceRow) {
    return {
      ...balance,
      openingBalance: money(balance.openingBalance),
      totalDebit: money(balance.totalDebit),
      totalCredit: money(balance.totalCredit),
      closingBalance: money(balance.closingBalance),
    };
  }
}

export type { PagedSlice, LedgerAccountRow };
