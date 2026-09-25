import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ContactPreference, ParentStatus } from '@prisma/client';

export class CreateParentDto {
  @ApiProperty({ required: false, enum: ContactPreference, default: ContactPreference.EMAIL, description: 'V-PA-03' })
  @IsOptional()
  @IsEnum(ContactPreference)
  contactPreference?: ContactPreference;

  @ApiProperty({ required: false, description: 'Optional userId bridge to an existing User (D1 / §18.3)' })
  @IsOptional()
  @IsUUID('4')
  userId?: string;
}

export class UpdateParentDto {
  @ApiProperty({ required: false, enum: ContactPreference, description: 'V-PA-03' })
  @IsOptional()
  @IsEnum(ContactPreference)
  contactPreference?: ContactPreference;

  @ApiProperty({ required: false, enum: ParentStatus, description: 'V-PA-04 (ACTIVE ↔ INACTIVE)' })
  @IsOptional()
  @IsEnum(ParentStatus)
  status?: ParentStatus;

  @ApiProperty({ required: false, description: 'Optional userId bridge; null clears the link' })
  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class ListParentsQueryDto {
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

  @ApiProperty({ required: false, enum: ParentStatus })
  @IsOptional()
  @IsEnum(ParentStatus)
  status?: ParentStatus;

  @ApiProperty({ required: false, enum: ContactPreference })
  @IsOptional()
  @IsEnum(ContactPreference)
  contactPreference?: ContactPreference;

  @ApiProperty({ required: false, description: 'Name/email term search on the linked Person' })
  @IsOptional()
  @MaxLength(255)
  search?: string;
}