import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { InvitationStatus } from '@prisma/client';

export class CreateInvitationDto {
  @ApiProperty({ example: 'newuser@greenfield.edu.ng' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ required: false, description: 'Server-authoritative role to assign on registration' })
  @IsOptional()
  @IsUUID('4')
  roleId?: string;

  @ApiProperty({ required: false, default: 7, minimum: 1, maximum: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  expiresInDays?: number;
}

export class AcceptInvitationDto {
  @ApiProperty({ description: 'Plaintext invitation token sent to the invitee' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ListInvitationsQueryDto {
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

  @ApiProperty({ required: false, enum: InvitationStatus })
  @IsOptional()
  @IsEnum(InvitationStatus)
  status?: InvitationStatus;
}