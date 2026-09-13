import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@greenfield.edu.ng',
    description:
      'Login identifier: external email, institution internal (school) email, or Student/Staff ID',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class TenantedLoginDto extends LoginDto {
  @ApiProperty({ example: 'greenfield-academy' })
  @IsString()
  @IsNotEmpty()
  tenantSlug: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'greenfield-academy' })
  @IsString()
  @IsNotEmpty()
  tenantSlug: string;

  @ApiProperty({ example: 'newuser@greenfield.edu.ng' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ description: 'Must satisfy the tenant password policy' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  firstName: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({
    required: false,
    description:
      'Invitation token. Required when public registration roles are not configured (default: invitation-only).',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  invitationToken?: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Plaintext email verification token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}