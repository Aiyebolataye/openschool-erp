import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { StudentStatus } from '@prisma/client';

const ID_NUMBER_REGEX = /^[A-Za-z0-9._-]+$/;

export const ENROLLMENT_TYPES = ['NEW', 'TRANSFER', 'PROMOTED'] as const;
export const WITHDRAWAL_TYPES = ['VOLUNTARY', 'ACADEMIC', 'DISCIPLINARY', 'OTHER'] as const;
export const REFUND_STATUSES = ['PENDING', 'PROCESSED', 'DENIED'] as const;

export class CreateStudentDto {
  @ApiProperty({ required: false, description: 'Unique within Institution (V-S-05)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(ID_NUMBER_REGEX, { message: 'student ID number may contain letters, digits, . _ -' })
  studentNumber?: string;

  @ApiProperty({ required: false, description: 'Defaults to now (V-S-03)' })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @ApiProperty({ example: 'SS1' })
  @IsString()
  @MaxLength(50)
  gradeLevel: string;

  @ApiProperty({ required: false, example: 'SS 1 Science' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  className?: string;

  @ApiProperty({ required: false, example: 'A' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  stream?: string;

  @ApiProperty({ enum: ENROLLMENT_TYPES })
  @Matches(/^(NEW|TRANSFER|PROMOTED)$/, { message: 'enrollmentType must be NEW, TRANSFER or PROMOTED' })
  enrollmentType: string;
}

export class UpdateStudentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(ID_NUMBER_REGEX, { message: 'student ID number may contain letters, digits, . _ -' })
  studentNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @ApiProperty({ required: false, enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class ListStudentsQueryDto {
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

  @ApiProperty({ required: false, enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}

export class EnrollmentDetailDto {
  @ApiProperty({ required: false, example: 'SS2' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gradeLevel?: string;

  @ApiProperty({ required: false, example: 'SS 2 Science' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  className?: string;

  @ApiProperty({ required: false, example: 'A' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  stream?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(/^(NEW|TRANSFER|PROMOTED)$/, { message: 'enrollmentType must be NEW, TRANSFER or PROMOTED' })
  enrollmentType?: string;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class GraduationDetailDto {
  @ApiProperty({ example: '2027-07-31' })
  @IsDateString()
  graduationDate: string;

  @ApiProperty({ required: false, example: 'B' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  finalGrade?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  certificateNumber?: string;

  @ApiProperty({ required: false, description: 'File reference' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  diplomaReference?: string;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class TransferDetailDto {
  @ApiProperty({ example: '2027-09-01' })
  @IsDateString()
  transferDate: string;

  @ApiProperty({ required: false, description: 'Destination institution (must belong to the tenant)' })
  @IsOptional()
  @IsUUID('4')
  destinationInstitutionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  transferReason?: string;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class WithdrawalDetailDto {
  @ApiProperty({ example: '2027-06-30' })
  @IsDateString()
  withdrawalDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  withdrawalReason?: string;

  @ApiProperty({ enum: WITHDRAWAL_TYPES })
  @Matches(/^(VOLUNTARY|ACADEMIC|DISCIPLINARY|OTHER)$/, { message: 'withdrawalType must be VOLUNTARY, ACADEMIC, DISCIPLINARY or OTHER' })
  withdrawalType: string;

  @ApiProperty({ required: false, enum: REFUND_STATUSES })
  @IsOptional()
  @Matches(/^(PENDING|PROCESSED|DENIED)$/, { message: 'refundStatus must be PENDING, PROCESSED or DENIED' })
  refundStatus?: string;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}