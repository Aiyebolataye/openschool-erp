import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AcademicYearStatus, SessionStatus, TermStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class CreateAcademicYearDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class UpdateAcademicYearDto extends PartialType(CreateAcademicYearDto) {
  @IsOptional()
  @IsEnum(AcademicYearStatus)
  status?: AcademicYearStatus;
}

export class CreateSessionDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;
}

export class CreateTermDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class UpdateTermDto extends PartialType(CreateTermDto) {
  @IsOptional()
  @IsEnum(TermStatus)
  status?: TermStatus;
}

export class SetActiveDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}