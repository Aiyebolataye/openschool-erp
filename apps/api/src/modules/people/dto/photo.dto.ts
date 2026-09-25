import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/** P-07 default max profile photo size: 5 MB in bytes. */
export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export class UploadProfilePhotoDto {
  @ApiProperty({ description: 'Reference-only file pointer managed by Platform Services (≤500; §5.9 assumption 7)' })
  @IsString()
  @MaxLength(500)
  fileReference: string;

  @ApiProperty({ required: false, description: 'Image MIME type (≤100)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @ApiProperty({ required: false, description: `File size in bytes; P-07 caps at ${PROFILE_PHOTO_MAX_BYTES}` })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(PROFILE_PHOTO_MAX_BYTES)
  fileSize?: number;
}