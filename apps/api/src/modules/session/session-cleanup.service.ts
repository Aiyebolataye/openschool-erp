import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionService } from './session.service';

/**
 * Periodic sweep that transitions past-their-TTL sessions to inactive
 * (spec I-22). Runs only inside the dedicated session-cleanup worker process so
 * automated tests and the web app are never affected; the sweep itself is
 * idempotent, retry-safe and tenant-aware.
 */
@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly sessions: SessionService,
  ) {}

  sweepExpired(tenantId?: string) {
    return this.sessions.sweepExpired(tenantId);
  }

  startCleanupLoop(): void {
    if (this.timer) {
      return;
    }
    const minutes = this.config.get<number>('session.cleanupIntervalMinutes', 60);
    const ms = Math.max(1, minutes) * 60 * 1000;
    this.logger.log(`Session cleanup loop started (every ${minutes} minute(s))`);

    this.timer = setInterval(() => {
      void this.runSweep();
    }, ms);
    this.timer.unref?.();
  }

  stopCleanupLoop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async runSweep(): Promise<void> {
    try {
      const result = await this.sessions.sweepExpired();
      if (result.revoked > 0) {
        this.logger.log(`Expired sessions swept: ${result.revoked}`);
      }
    } catch (err) {
      this.logger.error(`Session sweep failed: ${(err as Error).message}`);
    }
  }
}