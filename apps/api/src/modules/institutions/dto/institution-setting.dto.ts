import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export enum InstitutionSettingKind {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
}

export class InstitutionSettingUpsertDto {
  @ApiProperty({
    description: 'Value for the setting key; must be valid for `kind`',
    examples: ['Africa/Lagos', 2000, true, { enableExams: true }],
  })
  @IsDefined({ message: 'value is required (any JSON value)' })
  value: unknown;

  @ApiProperty({ required: false, enum: InstitutionSettingKind, default: InstitutionSettingKind.STRING })
  @IsOptional()
  @IsEnum(InstitutionSettingKind)
  kind?: InstitutionSettingKind;

  @ApiProperty({ required: false, description: 'Expected current version for optimistic concurrency (409 on mismatch)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}

export class InstitutionSettingPathDto {
  @ApiProperty({ description: 'Institution id (UUID)' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Setting key (lowercase letters, digits, dot/underscore/hyphen)' })
  @IsString()
  @MaxLength(160)
  @Matches(/^[a-z0-9._-]+$/, {
    message: 'key must be lowercase letters, digits, dot, underscore or hyphen',
  })
  key: string;
}