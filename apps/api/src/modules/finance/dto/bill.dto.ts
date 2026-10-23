import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillStatus } from '@prisma/client';
import { FeeQueryDto } from './fee.dto';

/**
 * P6.2 — Billing DTOs (frozen Finance §7.2 bills, §9.8 Bill → Invoice → Payment
 * flow, §10.3 Bills, BR-03, I-22).
 *
 * §6.6 defines no V-BILL rule group, so the bill's own contract is taken from the
 * §7.2 column catalogue plus the lifecycle in §5.6 (Bill: Generated → Sent →
 * Converted / Cancelled) and I-22 (a bill must be GENERATED to convert).
 */
export const BILL_STATUSES = Object.values(BillStatus);

/**
 * `POST /finance/bills/generate` — "Generate bills from schedule".
 *
 * Generation is per (schedule, student): the §10.3 endpoint and V-FS-02/BR-29
 * define the schedule as session-scoped, and §9.8 step 3 generates the bill for
 * "the student's" schedule. Cohort-wide generation is deliberately NOT exposed
 * here — §14 lists "bulk bill generation optimization" as an outstanding item,
 * and no rule in the frozen spec defines which enrolments a bulk run covers.
 */
export class GenerateBillDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  feeScheduleId: string;

  /**
   * §7.2 bills.student_person_id — a People domain Student. Existence is
   * verified service-level (cross-domain UUID, §8.2); no Prisma relation.
   */
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  studentPersonId: string;

  /** §7.2 — nullable; validated when provided (§8.2). */
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  termId?: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class BillQueryDto extends FeeQueryDto {
  @ApiProperty({ required: false, enum: BILL_STATUSES })
  @IsOptional()
  @IsEnum(BillStatus)
  status?: BillStatus;

  /**
   * Filters §7.2 bills.student_person_id. Named after the column rather than
   * §10.2's generic `studentId` so it can never be confused with the People
   * `student.id` record id — the bill references the person id.
   */
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentPersonId?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  feeScheduleId?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  academicSessionId?: string;
}

export class CancelBillDto {
  /** Why the bill was cancelled. §7.2 bills.notes is the only free-text field. */
  @ApiProperty({ required: false, minLength: 1, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason?: string;

  /** Optional optimistic-lock token; 409 when it does not match. */
  @ApiProperty({ required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}
