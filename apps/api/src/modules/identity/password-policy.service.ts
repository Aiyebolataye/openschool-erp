import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigit: boolean;
  requireSpecialChar: boolean;
  historyCount: number;
  expiryDays: number;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecialChar: true,
  historyCount: 12,
  expiryDays: 90,
};

export function validatePasswordAgainstPolicy(
  password: string,
  policy: PasswordPolicy,
): string[] {
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters.`);
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }
  if (policy.requireDigit && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit.');
  }
  if (policy.requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character.');
  }

  return errors;
}

@Injectable()
export class PasswordPolicyService {
  constructor(private prisma: PrismaService) {}

  async getPolicy(tenantId: string): Promise<PasswordPolicy> {
    const stored = await this.prisma.passwordPolicy.findUnique({
      where: { tenantId },
    });

    if (!stored) {
      return { ...DEFAULT_PASSWORD_POLICY };
    }

    return {
      minLength: stored.minLength,
      requireUppercase: stored.requireUppercase,
      requireLowercase: stored.requireLowercase,
      requireDigit: stored.requireDigit,
      requireSpecialChar: stored.requireSpecialChar,
      historyCount: stored.historyCount,
      expiryDays: stored.expiryDays,
    };
  }

  async validateForTenant(tenantId: string, password: string): Promise<string[]> {
    const policy = await this.getPolicy(tenantId);
    return validatePasswordAgainstPolicy(password, policy);
  }
}