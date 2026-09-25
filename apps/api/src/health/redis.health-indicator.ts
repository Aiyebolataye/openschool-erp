import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { CacheService } from '../cache/cache.service';

/**
 * Phase-3 Redis readiness indicator (P3.7 / D3).
 *
 * Terminus 10.3 ships NO RedisHealthIndicator (verified against its export
 * surface â€” only DB/GRPC/HTTP/Memory/Microservice/MikroORM/Mongoose/Prisma/
 * Sequelize/TypeORM exist), so readiness on Redis must not rely on a built-in
 * that isn't there. This custom indicator keeps the existing frozen Terminus
 * stack (no new infra, no DLQ-style additions) and simply reuses the already
 * pooled ioredis client through `CacheService.ping()`:
 *
 *   - `pingCheck('redis')` â†’ bounded PING (1500ms), healthy iff 'PONG'.
 *   - Failure throws `HealthCheckError` â€” exactly the Terminus contract â€” so
 *     the readiness body reports `redis: { status: 'down', ... }` and the
 *     orchestrator stops routing traffic, without tearing down liveness.
 *
 * Readiness vs liveness stays per D3: the *readiness* aggregate = database +
 * redis (the two runtime-required services); `/health/live` remains an
 * independent `{ status: 'ok' }` so a dead Redis never masquerades as a dead
 * process (the orchestrator can still reschedule/restart via liveness).
 */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private cache: CacheService) {
    super();
  }

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = await this.cache.ping();
    const result = this.getStatus(key, isHealthy, { uptime: process.uptime() });

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError(
      `${RedisHealthIndicator.name} failed`,
      result,
    );
  }
}
