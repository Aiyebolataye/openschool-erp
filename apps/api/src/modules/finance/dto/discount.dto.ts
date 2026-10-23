import {
  ArrayMaxSize,
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
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { DiscountCondition, DiscountStatus, DiscountType } from '@prisma/client';
import { FEE_AMOUNT_MAX, FeeQueryDto } from './fee.dto';

/**
 * P6.2 — Discount definition DTOs (frozen Finance §6.6 V-DC-01..05, §7.2
 * discounts, §5.6 Discount: Draft → Active → Inactive, §10.3 Discounts).
 *
 * Definition-only. `POST /discounts/:id/apply` and the
 * `DELETE /discounts/:id/apply/:applicationId` pair in §10.3 are NOT exposed:
 * they apply a discount to an *invoice*, and the canonical invoice table is
 * gated behind the Finance legacy-archival decision. Nothing in this file
 * computes a discounted amount.
 */
export const DISCOUNT_TYPES = Object.values(DiscountType);
export const DISCOUNT_CONDITIONS = Object.values(DiscountCondition);
export const DISCOUNT_STATUSES = Object.values(DiscountStatus);

/** V-DC-03 — if PERCENTAGE, value must be <= 100. */
export const DISCOUNT_PERCENTAGE_MAX = 100;

export class CreateDiscountDto {
  /** V-DC-01 — required, 1–100 chars. */
  @ApiProperty({ minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  /** V-DC-02 — required, valid enum. */
  @ApiProperty({ enum: DISCOUNT_TYPES })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  /**
   * V-DC-03 — required, decimal > 0; <= 100 when PERCENTAGE.
   *
   * Two bounds live here and one in the service. `@Min(0.01)` enforces the
   * "> 0" half at the edge, so the declared `exclusiveMinimum` matches what the
   * pipe actually rejects. The "<= 100 when PERCENTAGE" half depends on
   * `discountType`, which class-validator cannot see in isolation, so the wider
   * absolute bound is declared here and the type-conditional cap is asserted in
   * `DiscountService.assertValue`.
   */
  @ApiProperty({ minimum: 0, exclusiveMinimum: true, maximum: FEE_AMOUNT_MAX })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(FEE_AMOUNT_MAX)
  value: number;

  /** V-DC-04 — optional, valid enum. */
  @ApiProperty({ required: false, enum: DISCOUNT_CONDITIONS, default: DiscountCondition.NONE })
  @IsOptional()
  @IsEnum(DiscountCondition)
  condition?: DiscountCondition;

  /** §7.2 — nullable, null = unlimited. */
  @ApiProperty({ required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxApplications?: number;

  @ApiProperty({ required: false, format: 'date' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiProperty({ required: false, format: 'date' })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  /**
   * §7.2 applicable_session_ids — json, nullable, array of session IDs,
   * null = all sessions. Session ids are cross-domain UUIDs validated one by one
   * in the service (§8.2); they are stored as JSON because the catalogue defines
   * no join table for them.
   */
  @ApiProperty({ required: false, type: [String], maxItems: 100 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('4', { each: true })
  applicableSessionIds?: string[];
}

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {
  /** V-DC-05 — required valid enum; settable on update per §5.6 Draft → Active → Inactive. */
  @ApiProperty({ required: false, enum: DISCOUNT_STATUSES })
  @IsOptional()
  @IsEnum(DiscountStatus)
  status?: DiscountStatus;

  /** Optional optimistic-lock token; 409 when it does not match. */
  @ApiProperty({ required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}

export class DiscountQueryDto extends FeeQueryDto {
  @ApiProperty({ required: false, enum: DISCOUNT_STATUSES })
  @IsOptional()
  @IsEnum(DiscountStatus)
  status?: DiscountStatus;

  @ApiProperty({ required: false, enum: DISCOUNT_TYPES })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;
}
