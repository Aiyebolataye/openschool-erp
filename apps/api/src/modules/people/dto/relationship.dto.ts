import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { RelationshipType } from '@prisma/client';

export class CreateRelationshipDto {
  @ApiProperty({ description: 'Target Person UUID (the route :personId is the source). V-PR-02' })
  @IsUUID('4')
  targetPersonId: string;

  @ApiProperty({ enum: RelationshipType, description: 'V-PR-03' })
  @IsEnum(RelationshipType)
  relationshipType: RelationshipType;

  @ApiProperty({ example: '2026-09-01', description: 'Required per V-PR-04 / BR-08' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ required: false, description: 'Must be ≥ startDate (V-PR-05 / I-08)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, description: 'Free-form metadata (valid JSON)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateRelationshipDto {
  @ApiProperty({ required: false, description: 'Target Person UUID (V-PR-02)' })
  @IsOptional()
  @IsUUID('4')
  targetPersonId?: string;

  @ApiProperty({ required: false, enum: RelationshipType, description: 'V-PR-03' })
  @IsOptional()
  @IsEnum(RelationshipType)
  relationshipType?: RelationshipType;

  @ApiProperty({ required: false, description: 'V-PR-04' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'Must be ≥ startDate (V-PR-05 / I-08)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, description: 'Advisory active flag (temporal expiry is derived from endDate)' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, description: 'Free-form metadata (valid JSON)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class ListRelationshipsQueryDto {
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

  @ApiProperty({ required: false, enum: RelationshipType })
  @IsOptional()
  @IsEnum(RelationshipType)
  relationshipType?: RelationshipType;
}