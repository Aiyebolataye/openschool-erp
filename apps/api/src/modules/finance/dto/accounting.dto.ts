import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  AccountType,
  FinancialPeriodStatus,
  Prisma,
} from '@prisma/client';
import { FEE_AMOUNT_MAX, FeeQueryDto } from './fee.dto';

/**
 * P6.2 — Accounting DTOs (frozen Finance §6.6 V-LA-01..03 / V-JE-01..06,
 * §7.2 ledger_accounts / journal_entries / journal_entry_lines / account_balances
 * / financial_periods, §13 Double-Entry Accounting Foundation).
 */
export const ACCOUNT_TYPES = Object.values(AccountType);
export const FINANCIAL_PERIOD_STATUSES = Object.values(FinancialPeriodStatus);

/**
 * §7.2 journal_entries.reference_type — the column catalogue and §13:1874 both
 * list PAYMENT, REFUND, ADJUSTMENT, WRITE_OFF and MANUAL.
 *
 * Recorded discrepancy: V-JE-03 (§6.6) lists only the first four and omits
 * MANUAL, while §7.2:1187 and §13:1874 both include it. MANUAL is kept because
 * two of the three authoritative statements include it and without it no
 * journal entry can ever be posted in this codebase — the other four reference
 * types all point at tables that are gated behind the Finance legacy-archival
 * decision. Only MANUAL is accepted for now; the other four are rejected with an
 * explicit "not yet available" error rather than silently accepted, because
 * their target tables do not exist in a §7.2-conformant shape yet.
 */
export const JOURNAL_REFERENCE_TYPES = ['MANUAL'] as const;
export type JournalReferenceType = (typeof JOURNAL_REFERENCE_TYPES)[number];

export class CreateLedgerAccountDto {
  /** V-LA-03 — required, unique within institution (§7.2 varchar(20)). */
  @ApiProperty({ minLength: 1, maxLength: 20 })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string;

  /** V-LA-01 — required, 1–100 chars, unique within institution. */
  @ApiProperty({ minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  /** V-LA-02 — required, valid enum. */
  @ApiProperty({ enum: ACCOUNT_TYPES })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class LedgerAccountQueryDto extends FeeQueryDto {
  @ApiProperty({ required: false, enum: ACCOUNT_TYPES })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;
}

/**
 * §7.2 journal_entry_lines — `debit` and `credit`, both >= 0, with the CHECK
 * "exactly one of debit or credit must be non-zero per line".
 */
export class CreateJournalEntryLineDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  ledgerAccountId: string;

  @ApiProperty({ minimum: 0, maximum: FEE_AMOUNT_MAX })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(FEE_AMOUNT_MAX)
  debit: number;

  @ApiProperty({ minimum: 0, maximum: FEE_AMOUNT_MAX })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(FEE_AMOUNT_MAX)
  credit: number;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class PostJournalEntryDto {
  /** V-JE-01 — required, 1–500 chars. */
  @ApiProperty({ minLength: 1, maxLength: 500 })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description: string;

  /** V-JE-02 — required and must be OPEN (I-17). */
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  financialPeriodId: string;

  @ApiProperty({ enum: JOURNAL_REFERENCE_TYPES })
  @IsEnum(JOURNAL_REFERENCE_TYPES as unknown as object)
  referenceType: JournalReferenceType;

  /**
   * §7.2 reference_id uuid. Nullable for a MANUAL entry, which has no external
   * source document — that is the only reference type currently accepted.
   */
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  referenceId?: string;

  /**
   * V-JE-05 — at least 2 lines. Capped so a single posting cannot be used to
   * write an unbounded number of ledger lines in one request.
   */
  @ApiProperty({ type: [CreateJournalEntryLineDto], minItems: 2 })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryLineDto)
  lines: CreateJournalEntryLineDto[];
}

export class CreateFinancialPeriodDto {
  /** §7.2 — varchar(50), UNIQUE per institution. */
  @ApiProperty({ minLength: 1, maxLength: 50 })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  /** §7.2 — cross-domain UUID (Academic Management sessions, §8.2). */
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  academicSessionId: string;

  @ApiProperty({ format: 'date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ format: 'date' })
  @IsDateString()
  endDate: string;
}

export class FinancialPeriodQueryDto extends FeeQueryDto {
  @ApiProperty({ required: false, enum: FINANCIAL_PERIOD_STATUSES })
  @IsOptional()
  @IsEnum(FinancialPeriodStatus)
  status?: FinancialPeriodStatus;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  academicSessionId?: string;
}

export class JournalEntryQueryDto extends FeeQueryDto {
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  financialPeriodId?: string;

  /** §7.2 idx_je_reference. */
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @ApiProperty({ required: false, enum: JOURNAL_REFERENCE_TYPES })
  @IsOptional()
  @IsEnum(JOURNAL_REFERENCE_TYPES as unknown as object)
  referenceType?: JournalReferenceType;
}

export class AccountBalanceQueryDto extends FeeQueryDto {
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  financialPeriodId?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  ledgerAccountId?: string;
}

/** decimal -> string for JSON/audit output; Decimal.js serializes as a string. */
export function money(value: Prisma.Decimal | null | undefined): string | null {
  return value === null || value === undefined ? null : value.toFixed(2);
}
