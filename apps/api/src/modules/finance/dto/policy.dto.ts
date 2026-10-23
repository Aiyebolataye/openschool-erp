import {
  IsDateString,
  IsEnum,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PolicyStatus } from '@prisma/client';
import { FeeQueryDto } from './fee.dto';

/**
 * P6.2 — Financial policy DTOs (frozen Finance §6.6 V-FP-01..04, §7.2
 * financial_policies, §6.5 configurable policies, §10.3 Financial Policies).
 *
 * §10.3 `PUT /policies/:id` is "Update policy (new version)" and V-FP-04 says the
 * version is auto-incremented per (policy_type, policy_key), so the client never
 * supplies a version — the service allocates the next one and supersedes the
 * previous ACTIVE row (§5.6 FinancialPolicy: Draft → Active → Superseded).
 */
export const POLICY_TYPES = [
  'CURRENCY',
  'TAX',
  'NUMBERING',
  'PENALTY',
  'REFUND',
  'SCHOLARSHIP',
  'DISCOUNT',
  'INSTALLMENT',
] as const;

export type PolicyType = (typeof POLICY_TYPES)[number];

export class CreateFinancialPolicyDto {
  /**
   * V-FP-01 — required, 1–50 chars, and one of the eight types §7.2 enumerates.
   * `@IsIn` rather than `@IsString` because §7.2 stores the type in a fixed
   * value space; an arbitrary string would be accepted here and then be
   * unfilterable by the policyType queries.
   */
  @ApiProperty({ enum: POLICY_TYPES, minLength: 1, maxLength: 50 })
  @IsString()
  @IsIn(POLICY_TYPES)
  @MaxLength(50)
  policyType: PolicyType;

  /** V-FP-02 — required, 1–100 chars. */
  @ApiProperty({ minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  policyKey: string;

  /** V-FP-03 — required, valid JSON. */
  @ApiProperty({ type: 'object' })
  @IsObject()
  value: Record<string, unknown>;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /** §7.2 effective_from date. */
  @ApiProperty({ required: false, format: 'date' })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  /** §7.2 effective_to date, nullable. */
  @ApiProperty({ required: false, format: 'date' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  /**
   * §5.6 Draft → Active → Superseded. Defaults to DRAFT so a policy is never
   * active the moment it is written; §6.5 defaults are a separate, unresolved
   * question and are not seeded here.
   */
  @ApiProperty({ required: false, enum: PolicyStatus, default: PolicyStatus.DRAFT })
  @IsOptional()
  @IsEnum(PolicyStatus)
  status?: PolicyStatus;
}

export class UpdateFinancialPolicyDto {
  /** V-FP-03 — required on update, valid JSON. */
  @ApiProperty({ type: 'object' })
  @IsObject()
  value: Record<string, unknown>;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false, format: 'date' })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiProperty({ required: false, format: 'date' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiProperty({ required: false, enum: PolicyStatus })
  @IsOptional()
  @IsEnum(PolicyStatus)
  status?: PolicyStatus;
}

export class FinancialPolicyQueryDto extends FeeQueryDto {
  @ApiProperty({ required: false, enum: POLICY_TYPES })
  @IsOptional()
  @IsString()
  @IsIn(POLICY_TYPES)
  policyType?: PolicyType;

  @ApiProperty({ required: false, enum: PolicyStatus })
  @IsOptional()
  @IsEnum(PolicyStatus)
  status?: PolicyStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  policyKey?: string;
}

export class PolicyHistoryQueryDto extends FeeQueryDto {
  @ApiProperty({ required: false, enum: POLICY_TYPES })
  @IsOptional()
  @IsString()
  @IsIn(POLICY_TYPES)
  policyType?: PolicyType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  policyKey?: string;
}
