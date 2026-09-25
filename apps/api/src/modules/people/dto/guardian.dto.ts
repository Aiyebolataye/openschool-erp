import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ContactPreference, GuardianStatus } from '@prisma/client';

export class CreateGuardianDto {
  @ApiProperty({ description: 'Required per V-G-03 / BR-09 / I-09; file/document reference (≤500)' })
  @IsString()
  @MaxLength(500)
  legalGuardianshipRef: string;

  @ApiProperty({ required: false, enum: ContactPreference, default: ContactPreference.EMAIL, description: 'V-G-04' })
  @IsOptional()
  @IsEnum(ContactPreference)
  contactPreference?: ContactPreference;

  @ApiProperty({ required: false, description: 'Optional userId bridge to an existing User (D1 / §18.3)' })
  @IsOptional()
  @IsUUID('4')
  userId?: string;
}

export class UpdateGuardianDto {
  @ApiProperty({ required: false, description: 'Legal guardianship document reference (≤500)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  legalGuardianshipRef?: string;

  @ApiProperty({ required: false, enum: ContactPreference, description: 'V-G-04' })
  @IsOptional()
  @IsEnum(ContactPreference)
  contactPreference?: ContactPreference;

  @ApiProperty({ required: false, enum: GuardianStatus, description: 'V-G-05 (ACTIVE ↔ INACTIVE)' })
  @IsOptional()
  @IsEnum(GuardianStatus)
  status?: GuardianStatus;

  @ApiProperty({ required: false, description: 'Optional userId bridge; null clears the link' })
  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class ListGuardiansQueryDto {
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

  @ApiProperty({ required: false, enum: GuardianStatus })
  @IsOptional()
  @IsEnum(GuardianStatus)
  status?: GuardianStatus;

  @ApiProperty({ required: false, enum: ContactPreference })
  @IsOptional()
  @IsEnum(ContactPreference)
  contactPreference?: ContactPreference;

  @ApiProperty({ required: false, description: 'Name/email term search on the linked Person' })
  @IsOptional()
  @MaxLength(255)
  search?: string;
}