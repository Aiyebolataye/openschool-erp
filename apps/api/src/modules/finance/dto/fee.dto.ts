import {
  IsEnum,
  IsInt,
  IsNotEmpty,
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
import { FeeItemStatus, Prisma } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

/** decimal(14,2) upper bound — §7.2 fee_items.amount. */
export const FEE_AMOUNT_MAX = 999999999999.99;

export class CreateFeeCategoryDto {
  @ApiProperty({ minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateFeeCategoryDto extends PartialType(CreateFeeCategoryDto) {
  /** Optional optimistic-lock token; 409 when it does not match. */
  @ApiProperty({ required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}

export class CreateFeeItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  feeCategoryId: string;

  @ApiProperty({ minLength: 1, maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  /**
   * Declared charge amount, at most 2 decimal places (no silent rounding:
   * V-FI-03 requires a decimal >= 0 and the column is decimal(14,2)).
   */
  @ApiProperty({ minimum: 0, maximum: FEE_AMOUNT_MAX })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(FEE_AMOUNT_MAX)
  amount: number;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateFeeItemDto extends PartialType(CreateFeeItemDto) {
  @ApiProperty({ required: false, enum: FeeItemStatus })
  @IsOptional()
  @IsEnum(FeeItemStatus)
  status?: FeeItemStatus;

  /** Optional optimistic-lock token; 409 when it does not match. */
  @ApiProperty({ required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}

export class FeeIdParamDto {
  @IsUUID()
  id: string;
}

export class FeeQueryDto {
  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class FeeItemQueryDto extends FeeQueryDto {
  /** Optional category filter for the fee item catalogue. */
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  feeCategoryId?: string;
}

/** decimal -> string for JSON/audit output; Decimal.js serializes as a string. */
export function decimalToString(value: Prisma.Decimal | null | undefined): string | null {
  return value === null || value === undefined ? null : value.toFixed(2);
}
