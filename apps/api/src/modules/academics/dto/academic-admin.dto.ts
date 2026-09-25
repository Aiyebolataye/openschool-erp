import {
  IsBoolean,
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
  CostModel,
  ProgressionType,
} from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

// ------------------------------------------------------------------- grading
export class CreateGradeScaleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateGradeScaleDto extends PartialType(CreateGradeScaleDto) {}

export class AddBoundaryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  grade: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  @Max(100)
  minScore: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  @Max(100)
  maxScore: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  remark?: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  @Max(1000)
  displayOrder: number;
}

export class UpdateBoundaryDto extends PartialType(AddBoundaryDto) {}

export class AddRemarkDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  @Max(100)
  minScore: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  @Max(100)
  maxScore: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  remarkText: string;
}

export class UpdateRemarkDto extends PartialType(AddRemarkDto) {}

// ------------------------------------------------------------------- results
export class CompileResultsDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  termId: string;

  @IsUUID()
  subjectId: string;
}

export class GenerateReportCardsDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  termId: string;
}

// ---------------------------------------------------------------- progression
export class EvaluateProgressionDto {
  @IsUUID()
  studentPersonId: string;

  @IsUUID()
  fromClassId: string;

  @IsOptional()
  @IsUUID()
  toClassId?: string;

  @IsUUID()
  termId: string;

  @IsEnum(ProgressionType)
  progressionType: ProgressionType;

  @IsOptional()
  criteriaMet?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateProgressionDto extends PartialType(EvaluateProgressionDto) {}

// -------------------------------------------------------------------- policy
export class CreatePolicyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  policyType: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  policyKey: string;

  value: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {}

export class EffectivePolicyParamsDto {
  @IsString()
  @MaxLength(50)
  policyType: string;

  @IsString()
  @MaxLength(100)
  policyKey: string;
}

// -------------------------------------------------------------- summer school
export class CreateSummerSchoolDto {
  @IsUUID()
  termId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsDateString()
  registrationStart: string;

  @IsDateString()
  registrationEnd: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsDateString()
  examStartDate?: string;

  @IsOptional()
  @IsDateString()
  examEndDate?: string;

  @IsEnum(CostModel)
  costModel: CostModel;

  @IsOptional()
  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  costAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  maxGrade?: string;

  @IsOptional()
  eligibleGrades?: string[];
}

export class UpdateSummerSchoolDto extends PartialType(CreateSummerSchoolDto) {}

export class StageSummerSchoolDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  open?: boolean;
}

export class RegisterForSummerSchoolDto {
  @IsUUID()
  studentPersonId: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentStatus?: string;
}

export class RecordSummerSchoolResultDto {
  @IsUUID()
  subjectId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  originalGrade: string;

  @IsOptional()
  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  newScore?: number;
}