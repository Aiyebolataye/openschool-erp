import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ClassStatus, GradeLevelStatus, SubjectStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsUUID()
  headStaffId?: string;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}

export class CreateSubjectDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {
  @IsOptional()
  @IsEnum(SubjectStatus)
  status?: SubjectStatus;
}

export class CreateSubjectGroupDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  subjectIds?: string[];
}

export class UpdateSubjectGroupDto extends PartialType(CreateSubjectGroupDto) {}

export class GrantSubjectsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  subjectIds: string[];
}

export class GradeLevelDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  @Max(1000)
  displayOrder: number;
}

export class UpdateGradeLevelDto extends PartialType(GradeLevelDto) {
  @IsOptional()
  @IsEnum(GradeLevelStatus)
  status?: GradeLevelStatus;
}

export class CreateStreamDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}

export class UpdateStreamDto extends PartialType(CreateStreamDto) {}

export class CreateClassDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsUUID()
  gradeLevelId: string;

  @IsOptional()
  @IsUUID()
  streamId?: string;

  @ApiProperty({ minimum: 0, default: 0 })
  @IsInt()
  @Min(0)
  @Max(10000)
  capacity: number;
}

export class UpdateClassDto extends PartialType(CreateClassDto) {
  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;
}