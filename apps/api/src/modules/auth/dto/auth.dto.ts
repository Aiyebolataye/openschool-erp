import { IsEmail, IsNotEmpty, IsString, IsOptional, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@greenfield.edu.ng' })
  @IsEmail()
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
  email: string;

  @ApiProperty()
  @IsStrongPassword({ minLength: 8 })
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ default: 'TEACHER' })
  @IsString()
  @IsNotEmpty()
  roleName: string;
}