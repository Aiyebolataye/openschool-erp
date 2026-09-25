import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class InstitutionConfigurationUpsertDto {
  @ApiProperty({
    description: 'JSON value for the configuration key',
    examples: [{ currency: 'NGN' }, '#2563EB', { locale: 'en-NG' }],
  })
  @IsDefined({ message: 'value is required (any JSON value)' })
  value: unknown;

  @ApiProperty({ required: false, description: 'Expected current version for optimistic concurrency (409 on mismatch)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}

export class InstitutionConfigurationPathDto {
  @ApiProperty({ description: 'Institution id (UUID)' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Configuration key (lowercase letters, digits, dot/underscore/hyphen)' })
  @IsString()
  @MaxLength(160)
  @Matches(/^[a-z0-9._-]+$/, {
    message: 'key must be lowercase letters, digits, dot, underscore or hyphen',
  })
  key: string;
}