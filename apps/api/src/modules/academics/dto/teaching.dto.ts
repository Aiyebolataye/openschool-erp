import {
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
import { DayOfWeek, TeachingRole } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeachingAssignmentDto {
  @IsUUID()
  staffPersonId: string;

  @IsUUID()
  subjectId: string;

  @IsUUID()
  classId: string;

  @IsUUID()
  termId: string;

  @IsEnum(TeachingRole)
  role: TeachingRole;

  @ApiProperty({ required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8760)
  workloadHours?: number;
}

export class UpdateTeachingAssignmentDto extends PartialType(CreateTeachingAssignmentDto) {}

export class AssignHomeroomDto {
  @IsUUID()
  staffPersonId: string;
}

export class CreateArmDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  name: string;

  @IsOptional()
  @IsUUID()
  staffPersonId?: string;
}

export class UpdateArmDto extends PartialType(CreateArmDto) {}

export class CreateTimetableDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  termId: string;
}

export class UpdateTimetableDto extends PartialType(CreateTimetableDto) {}

export class CreateTimetableSlotDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsString()
  @MaxLength(10)
  startTime: string;

  @IsString()
  @MaxLength(10)
  endTime: string;

  @IsUUID()
  subjectId: string;

  @IsOptional()
  @IsUUID()
  staffPersonId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  room?: string;
}

export class UpdateTimetableSlotDto extends PartialType(CreateTimetableSlotDto) {}