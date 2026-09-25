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
import { DocumentStatus } from '@prisma/client';

export class CreatePeopleDocumentDto {
  @ApiProperty({ description: 'Document type (≤100), e.g. BIRTH_CERTIFICATE, PASSPORT, TRANSCRIPT' })
  @IsString()
  @MaxLength(100)
  documentType: string;

  @ApiProperty({ description: 'Document name (≤200)' })
  @IsString()
  @MaxLength(200)
  documentName: string;

  @ApiProperty({ description: 'Reference-only file pointer managed by Platform Services (≤500; §5.9 assumption 7)' })
  @IsString()
  @MaxLength(500)
  fileReference: string;

  @ApiProperty({ required: false, description: 'File size in bytes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiProperty({ required: false, description: 'MIME type (≤100)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @ApiProperty({ required: false, description: 'Document expiry date (valid date)' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class UpdatePeopleDocumentDto {
  @ApiProperty({ required: false, description: 'Document type (≤100)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentType?: string;

  @ApiProperty({ required: false, description: 'Document name (≤200)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  documentName?: string;

  @ApiProperty({ required: false, description: 'File reference (≤500)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fileReference?: string;

  @ApiProperty({ required: false, description: 'File size in bytes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiProperty({ required: false, description: 'MIME type (≤100)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @ApiProperty({
    required: false,
    enum: DocumentStatus,
    description: 'ACTIVE / EXPIRED / REVOKED (V-D status treatment)',
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiProperty({ required: false, description: 'Document expiry date (valid date)' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class ListPeopleDocumentsQueryDto {
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

  @ApiProperty({ required: false, description: 'Filter by document type (≤100)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentType?: string;

  @ApiProperty({ required: false, enum: DocumentStatus })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}