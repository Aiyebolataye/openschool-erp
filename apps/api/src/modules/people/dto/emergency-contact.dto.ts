import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const PHONE_REGEX = /^\+?[0-9][0-9\s().-]{5,}$/;

export class CreateEmergencyContactDto {
  @ApiProperty({ example: 'Ngozi Eze' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: '+234 801 555 0100', description: 'Required per BR-06 / I-06 / V-EC-03' })
  @IsString()
  @Matches(PHONE_REGEX, { message: 'phone must be a valid phone number' })
  phonePrimary: string;

  @ApiProperty({ required: false, description: 'Optional secondary phone (V-EC / P-015)' })
  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: 'phone must be a valid phone number' })
  phoneSecondary?: string;

  @ApiProperty({ required: false, description: 'V-EC-06' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ description: 'Relationship to the person (1–100 chars), V-EC-04' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  relationship: string;

  @ApiProperty({ description: 'Contact order; unique per person (I-016 / BR-017), V-EC-05' })
  @IsInt()
  @Min(1)
  priority: number;

  @ApiProperty({ required: false, example: '14 Palm Avenue, Lagos' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
}

export class UpdateEmergencyContactDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiProperty({ required: false, description: 'At least one phone must remain (BR-06 / I-06)' })
  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: 'phone must be a valid phone number' })
  phonePrimary?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: 'phone must be a valid phone number' })
  phoneSecondary?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  relationship?: string;

  @ApiProperty({ required: false, description: 'Unique per person (I-016); re-ordering allowed' })
  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class ListEmergencyContactsQueryDto {
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
}