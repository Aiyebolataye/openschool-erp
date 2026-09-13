import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

type FailureReason =
  | 'unknown-identity'
  | 'invalid-password'
  | 'account-locked'
  | 'verification-required';

interface RecordAttemptInput {
  tenantId: string;
  email: string;
  userId?: string;
  success: boolean;
  failureReason?: FailureReason;
  ipAddress?: string;
  userAgent?: string;
}

export interface LockState {
  locked: boolean;
  retryAfterSeconds?: number;
}

/**
 * Failed-login tracking and temporary account lockout (D-09 Layer 2).
 *
 * Append-only security history: every record is inserted and never updated or
 * deleted. A successful authentication only clears the ACTIVE failure
 * window/lock state (users.locked_until) while historical login_attempts rows
 * are preserved. The scope of every record and lock decision is
 * tenant + canonicalized identifier so tenants remain isolated and the same
 * identifier in different tenants is evaluated independently.
 */
@Injectable()
export class LoginAttemptsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  get maxAttempts(): number {
    return this.config.get<number>('loginProtection.maxAttempts', 5);
  }

  get failureWindowMs(): number {
    return this.config.get<number>('loginProtection.failureWindowMinutes', 15) * 60_000;
  }

  get lockMs(): number {
    return this.config.get<number>('loginProtection.lockMinutes', 15) * 60_000;
  }

  async record(input: RecordAttemptInput): Promise<void> {
    await this.prisma.loginAttempt.create({
      data: {
        tenantId: input.tenantId,
        email: input.email,
        userId: input.userId,
        success: input.success,
        failureReason: input.failureReason,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }

  /**
   * Number of failed attempts for the tenant-scoped canonical identifier
   * within the configured failure window. Attempts that were already rejected
   * with HTTP 423 (account-locked) are excluded so that an expired lock grants
   * fresh attempts instead of re-locking instantly.
   */
  async countRecentFailures(tenantId: string, email: string): Promise<number> {
    return this.prisma.loginAttempt.count({
      where: {
        tenantId,
        email,
        success: false,
        failureReason: { not: 'account-locked' },
        createdAt: { gte: new Date(Date.now() - this.failureWindowMs) },
      },
    });
  }

  /**
   * Apply a temporary lock when the recent-failure threshold is reached.
   * Never invoked for unknown identities (no account to lock) and only sets
   * locked_until; historical records are untouched.
   */
  async evaluateLock(tenantId: string, email: string, userId: string): Promise<void> {
    const failures = await this.countRecentFailures(tenantId, email);
    if (failures >= this.maxAttempts) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lockedUntil: new Date(Date.now() + this.lockMs) },
      });
    }
  }

  lockState(user: { lockedUntil?: Date | null }): LockState {
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      return {
        locked: true,
        retryAfterSeconds: Math.ceil(remainingMs / 1000),
      };
    }
    return { locked: false };
  }

  /**
   * Successful authentication clears the active failure window/lock state
   * without deleting any login_attempts history (D-09).
   */
  async clearActiveFailureWindow(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lockedUntil: null },
    });
  }
}