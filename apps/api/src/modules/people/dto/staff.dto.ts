import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { EmploymentType, StaffStatus } from '@prisma/client';

const STAFF_NUMBER_REGEX = /^[A-Za-z0-9._-]+$/;

export class CreateStaffDto {
  @ApiProperty({ required: false, description: 'Unique within Institution (V-ST-03)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(STAFF_NUMBER_REGEX, { message: 'employee ID may contain letters, digits, . _ -' })
  staffNumber?: string;

  @ApiProperty({ example: '2026-09-01', description: 'Required per V-ST-04' })
  @IsDateString()
  hireDate: string;

  @ApiProperty({ enum: EmploymentType, default: EmploymentType.FULL_TIME })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiProperty({ required: false, description: 'Optional userId bridge to an existing User (D1)' })
  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @ApiProperty({ example: 'Senior Teacher' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  position: string;

  @ApiProperty({ required: false, example: 'Science' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  department?: string;

  @ApiProperty({ required: false, description: 'Reporting staff UUID (staff of the same tenant)' })
  @IsOptional()
  @IsUUID('4')
  reportingTo?: string;

  @ApiProperty({ required: false, example: 'Main Campus' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  workLocation?: string;

  @ApiProperty({ required: false, example: 'NG-05' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  salaryGrade?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  contractEndDate?: string;
}

export class UpdateStaffDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(STAFF_NUMBER_REGEX, { message: 'employee ID may contain letters, digits, . _ -' })
  staffNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiProperty({ required: false, enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiProperty({ required: false, enum: StaffStatus })
  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class ListStaffQueryDto {
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

  @ApiProperty({ required: false, description: 'Exact match on publicId/staffNumber, or name/email/position/department term search' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiProperty({ required: false, enum: ['exact', 'fuzzy'], default: 'fuzzy' })
  @IsOptional()
  @IsString()
  searchMode?: 'exact' | 'fuzzy';

  @ApiProperty({ required: false, enum: StaffStatus })
  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;

  @ApiProperty({ required: false, default: 'created_at' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class StaffEmploymentDetailDto {
  @ApiProperty({ example: 'Senior Teacher' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  position: string;

  @ApiProperty({ required: false, example: 'Science' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  department?: string;

  @ApiProperty({ required: false, description: 'Reporting staff UUID (staff of the same tenant)' })
  @IsOptional()
  @IsUUID('4')
  reportingTo?: string;

  @ApiProperty({ required: false, example: 'Main Campus' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  workLocation?: string;

  @ApiProperty({ required: false, example: 'NG-05' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  salaryGrade?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class CreateStaffQualificationDto {
  @ApiProperty({ example: 'B.Sc. Physics' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  qualificationName: string;

  @ApiProperty({ example: 'University of Lagos' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  institutionName: string;

  @ApiProperty({ required: false, example: 'Physics' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fieldOfStudy?: string;

  @ApiProperty({ example: 2005, minimum: 1900, maximum: 2100 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearObtained: number;

  @ApiProperty({ required: false, example: '2:1' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  grade?: string;

  @ApiProperty({ required: false, description: 'File reference (upload out of scope)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  certificateRef?: string;
}

export class UpdateStaffQualificationDto extends CreateStaffQualificationDto {
  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014), staff version' })
  @IsInt()
  @Min(1)
  version: number;
}

export class CreateStaffCertificationDto {
  @ApiProperty({ example: 'TRCN Certificate' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  certificationName: string;

  @ApiProperty({ example: 'Teachers Registration Council' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  issuingBody: string;

  @ApiProperty({ example: '2020-08-01' })
  @IsDateString()
  issueDate: string;

  @ApiProperty({ required: false, description: 'Must be on or after issueDate when provided' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  certificateNumber?: string;

  @ApiProperty({ required: false, description: 'File reference (upload out of scope)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  certificateRef?: string;
}

export class UpdateStaffCertificationDto extends CreateStaffCertificationDto {
  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014), staff version' })
  @IsInt()
  @Min(1)
  version: number;
}