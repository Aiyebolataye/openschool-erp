import {
  IsArray,
  IsDateString,
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
} from 'class-validator';
import {
  AssessmentType,
  AttendanceStatus,
  EnrollmentStatus,
  RegistrationStatus,
} from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @IsUUID()
  studentPersonId: string;

  @IsUUID()
  classId: string;

  @IsUUID()
  termId: string;

  @IsDateString()
  enrollmentDate: string;
}

export class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}

export class RegisterSubjectsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  subjectIds: string[];
}

export class UpdateRegistrationDto {
  @IsOptional()
  @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;
}

export class AttendanceRowDto {
  @IsOptional()
  @IsUUID()
  studentClassEnrollmentId?: string;

  @IsOptional()
  @IsUUID()
  staffPersonId?: string;

  @IsUUID()
  subjectId: string;

  @IsDateString()
  date: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class RecordAttendanceDto {
  @IsArray()
  rows: AttendanceRowDto[];
}

export class CorrectAttendanceDto {
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CreateAssignmentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  subjectId: string;

  @IsUUID()
  classId: string;

  @IsUUID()
  termId: string;

  @IsDateString()
  submissionStart: string;

  @IsDateString()
  submissionEnd: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  maxScore: number;

  @IsOptional()
  attachments?: Record<string, unknown>;
}

export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {}

export class CreateSubmissionDto {
  @IsUUID()
  studentClassEnrollmentId: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  attachments?: Record<string, unknown>;
}

export class GradeSubmissionDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  score: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}

export class CreateAssessmentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsEnum(AssessmentType)
  assessmentType: AssessmentType;

  @IsUUID()
  subjectId: string;

  @IsUUID()
  termId: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  maxScore: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class UpdateAssessmentDto extends PartialType(CreateAssessmentDto) {}

export class RecordAssessmentResultDto {
  @IsUUID()
  studentClassEnrollmentId: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  score: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}