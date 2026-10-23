import {
  IsBoolean,
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
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { FeeScheduleStatus } from '@prisma/client';
import { FEE_AMOUNT_MAX, FeeQueryDto } from './fee.dto';

/**
 * P6.2 — Fee schedule DTOs (frozen Finance §6.6 V-FS-01..03, §7.2 fee_schedules
 * / fee_schedule_items, §10.3 Fee Schedules).
 *
 * BR-29: fee schedules are session-scoped, so `academicSessionId` is required on
 * create and immutable afterwards — §10.3 exposes no way to move a published or
 * draft schedule to another session, and re-pointing it would silently re-charge
 * a different cohort.
 */
export class CreateFeeScheduleDto {
  @ApiProperty({ minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  /** V-FS-02 — must exist (service-level check, cross-domain per §8.2). */
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  academicSessionId: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  feeTemplateId?: string;
}

/**
 * `academicSessionId` is omitted rather than merely optional: the create DTO
 * documents it as immutable, and a partial type would still let a caller send
 * it and have the service re-point the schedule at another cohort. Omitting it
 * removes the property from the whitelist, so under the app's
 * `forbidNonWhitelisted` ValidationPipe a request carrying
 * `academicSessionId` is rejected with 400 instead of being silently honoured.
 */
export class UpdateFeeScheduleDto extends PartialType(
  OmitType(CreateFeeScheduleDto, ['academicSessionId'] as const),
) {
  /** Optional optimistic-lock token; 409 when it does not match. */
  @ApiProperty({ required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}

/**
 * V-FS-03 — status is a required valid enum. It is not settable through this
 * DTO: §5.6 gives FeeSchedule exactly one transition (Draft → Published) and
 * §10.3 exposes publication as its own `POST /publish` action, so status is
 * never a free-form field on update. The enum is referenced here to keep the
 * accepted set in one place.
 */
export const FEE_SCHEDULE_STATUSES = Object.values(FeeScheduleStatus);

export class AddFeeScheduleItemDto {
  /** I-11 / BR-030 — the referenced fee item must exist in this institution. */
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  feeItemId: string;

  /**
   * §7.2 fee_schedule_items.amount is the "override amount for this schedule",
   * so it is required and defaults to nothing: the caller states the charge for
   * this schedule rather than inheriting the catalogue price implicitly.
   */
  @ApiProperty({ minimum: 0, maximum: FEE_AMOUNT_MAX })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(FEE_AMOUNT_MAX)
  amount: number;

  /** §7.2 — default true; false marks an optional fee. */
  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  mandatory?: boolean;
}

export class FeeScheduleQueryDto extends FeeQueryDto {
  @ApiProperty({ required: false, enum: FEE_SCHEDULE_STATUSES })
  @IsOptional()
  @IsEnum(FeeScheduleStatus)
  status?: FeeScheduleStatus;

  /** §10.2 — academicSessionId is a declared common query parameter. */
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  academicSessionId?: string;
}

export class ScheduleItemParamDto {
  @IsUUID()
  itemId: string;
}
