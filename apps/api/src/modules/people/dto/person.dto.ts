import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Gender, PersonStatus, RoleContext } from '@prisma/client';

const NAME_REGEX = /^[a-zA-Z0-9 ]+$/;
const PHONE_REGEX = /^\+?[0-9][0-9\s().-]{5,}$/;

export class CreatePersonDto {
  @ApiProperty({ example: 'Chidi' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(NAME_REGEX, { message: 'first name must be alphanumeric with spaces only' })
  firstName: string;

  @ApiProperty({ example: 'Eze' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(NAME_REGEX, { message: 'last name must be alphanumeric with spaces only' })
  lastName: string;

  @ApiProperty({ required: false, example: 'Obi' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;

  @ApiProperty({ example: 'contact@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ required: false, example: '+234 802 111 2222' })
  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: 'phone must be a valid phone number' })
  phone?: string;

  @ApiProperty({ description: 'Required per V-P-05 (not in future)' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ required: false, example: 'O+' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodGroup?: string;

  @ApiProperty({ required: false, example: 'Enugu' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  stateOfOrigin?: string;

  @ApiProperty({ required: false, example: '14 Palm Avenue, Lagos' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ required: false, enum: PersonStatus, default: PersonStatus.ACTIVE })
  @IsOptional()
  @IsEnum(PersonStatus)
  status?: PersonStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, description: 'File reference; upload endpoint is out of scope' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  profilePhotoRef?: string;
}

export class UpdatePersonDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(NAME_REGEX, { message: 'first name must be alphanumeric with spaces only' })
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(NAME_REGEX, { message: 'last name must be alphanumeric with spaces only' })
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: 'phone must be a valid phone number' })
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ required: false, enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodGroup?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  stateOfOrigin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ required: false, enum: PersonStatus })
  @IsOptional()
  @IsEnum(PersonStatus)
  status?: PersonStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  profilePhotoRef?: string;

  @ApiProperty({ description: 'Optimistic-concurrency version (ADR-014)' })
  @IsInt()
  @Min(1)
  version: number;
}

export class PersonProfileDto {
  @ApiProperty({ required: false, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiProperty({ required: false, description: 'Institution-configurable custom fields (valid JSON)' })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class InstitutionAssignmentDto {
  @ApiProperty({ example: 'c056d6e0-...-institution-uuid' })
  @IsUUID('4')
  institutionId: string;

  @ApiProperty({ enum: RoleContext })
  @IsEnum(RoleContext)
  roleContext: RoleContext;
}

export class ListPeopleQueryDto {
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

  @ApiProperty({ required: false, description: 'Exact match on email/publicId/studentNumber, or name/email/phone prefix-term search' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiProperty({ required: false, enum: ['exact', 'fuzzy'], default: 'fuzzy' })
  @IsOptional()
  @IsString()
  searchMode?: 'exact' | 'fuzzy';

  @ApiProperty({ required: false, enum: PersonStatus })
  @IsOptional()
  @IsEnum(PersonStatus)
  status?: PersonStatus;

  @ApiProperty({ required: false, default: 'created_at' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}