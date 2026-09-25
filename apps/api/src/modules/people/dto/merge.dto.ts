import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class MergePeopleDto {
  @ApiProperty({ description: 'Source (duplicate) Person UUID; this record is soft-deleted after merge' })
  @IsUUID('4')
  sourcePersonId: string;

  @ApiProperty({ description: 'Target (surviving) Person UUID; identity is preserved on this record (§12.2)' })
  @IsUUID('4')
  targetPersonId: string;

  @ApiProperty({
    required: false,
    description:
      'Admin-selected field values taking precedence over the newest-non-null rule (§12.5 priority 2). Keys: firstName, lastName, middleName, email, phone, dateOfBirth, gender, address, bloodGroup, stateOfOrigin.',
  })
  @IsOptional()
  conflictOverrides?: Record<string, string | null>;
}

export class ListMergeSuggestionsQueryDto {
  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  /** P-013 default results cap; suggestions are capped at 100. */
  @ApiProperty({ required: false, default: 100, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class ListMergeHistoryQueryDto {
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

export type MergeConflictOverrideKey =
  | 'firstName'
  | 'lastName'
  | 'middleName'
  | 'email'
  | 'phone'
  | 'dateOfBirth'
  | 'gender'
  | 'address'
  | 'bloodGroup'
  | 'stateOfOrigin';

export const MERGE_IDENTITY_FIELDS: readonly MergeConflictOverrideKey[] = [
  'firstName',
  'lastName',
  'middleName',
  'email',
  'phone',
  'dateOfBirth',
  'gender',
  'address',
  'bloodGroup',
  'stateOfOrigin',
] as const;