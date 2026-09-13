import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateOnboardingLinkDto {
  @ApiProperty({
    example: 'provisioned.teacher@greenfield.edu.ng',
    description:
      'External email of an already-provisioned account. The onboarding link becomes the initial email verification for this account.',
  })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    required: false,
    description:
      'Institution to bind the membership to when the link is claimed. Omitted for organization-level identities such as parents.',
  })
  @IsOptional()
  @IsUUID('4')
  institutionId?: string;
}

export class OnboardingReviewDto {
  @ApiProperty({ description: 'Plaintext onboarding token sent to the email address' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class OnboardingConfirmDto {
  @ApiProperty({ description: 'Plaintext onboarding token sent to the email address' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description:
      'First name as provisioned by the administrator. Must match exactly (case/whitespace tolerant) — confirmation never replaces provisioned identity data.',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name as provisioned by the administrator. Must match exactly.',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}

export class OnboardingClaimDto {
  @ApiProperty({ description: 'Plaintext onboarding token sent to the email address' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Password chosen by the user; must satisfy the tenant policy' })
  @IsString()
  @IsNotEmpty()
  password: string;
}