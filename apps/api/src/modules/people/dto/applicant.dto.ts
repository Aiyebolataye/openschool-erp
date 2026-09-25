import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApplicantSource, ApplicantStatus } from '@prisma/client';

export class CreateApplicantDto {
  @ApiProperty({ description: 'Target grade/class (V-AP-04), 1–100 chars; derives Student gradeLevel on accept' })
  @IsString()
  @MaxLength(100)
  targetGrade: string;

  @ApiProperty({ required: false, description: 'Application date (V-AP-03); defaults to now ISO date' })
  @IsOptional()
  @IsDateString()
  applicationDate?: string;

  @ApiProperty({ required: false, enum: ApplicantSource, default: ApplicantSource.WALK_IN, description: 'V-AP-05 (schema enum; spec V-AP-05 "OTHER" is not stored)' })
  @IsOptional()
  @IsEnum(ApplicantSource)
  source?: ApplicantSource;

  @ApiProperty({ required: false, maxLength: 2000, description: 'Free-text notes (≤2000)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateApplicantDto {
  @ApiProperty({ required: false, description: 'Target grade/class' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  targetGrade?: string;

  @ApiProperty({ required: false, description: 'Application date (valid date)' })
  @IsOptional()
  @IsDateString()
  applicationDate?: string;

  @ApiProperty({ required: false, enum: ApplicantSource })
  @IsOptional()
  @IsEnum(ApplicantSource)
  source?: ApplicantSource;

  @ApiProperty({ required: false, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiProperty({
    required: false,
    enum: ApplicantStatus,
    description: 'Status patch: only APPLIED ↔ UNDER_REVIEW (spec §5.6); terminal states are exclusive to accept/reject/expiry',
  })
  @IsOptional()
  @IsEnum(ApplicantStatus)
  status?: ApplicantStatus;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class AcceptApplicantDto {
  @ApiProperty({ required: false, description: 'Optional explicit gradeLevel for the created Student; defaults to the applicant targetGrade' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  gradeLevel?: string;

  @ApiProperty({ required: false, description: 'Enrollment class name (≤50)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  className?: string;

  @ApiProperty({ required: false, description: 'Enrollment stream (≤50)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  stream?: string;

  @ApiProperty({ required: false, description: 'Enrollment type (≤50); defaults to NEW' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  enrollmentType?: string;

  @ApiProperty({ required: false, description: 'Optional student ID number (≤50, unique per institution/session)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  studentNumber?: string;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class RejectApplicantDto {
  @ApiProperty({ required: false, maxLength: 2000, description: 'Rejection reason; captured in the audit changes payload' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rejectionReason?: string;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class ListApplicantsQueryDto {
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

  @ApiProperty({ required: false, enum: ApplicantStatus })
  @IsOptional()
  @IsEnum(ApplicantStatus)
  status?: ApplicantStatus;

  @ApiProperty({ required: false, enum: ApplicantSource })
  @IsOptional()
  @IsEnum(ApplicantSource)
  source?: ApplicantSource;

  @ApiProperty({ required: false, description: 'Name/email term search on the linked Person' })
  @IsOptional()
  @MaxLength(255)
  search?: string;
}