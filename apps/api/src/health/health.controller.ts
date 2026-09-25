import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { RedisHealthIndicator } from './redis.health-indicator';

/**
 * Phase-3 readiness/liveness (D3 / P3.7).
 *
 * Readiness (`/health`) is the aggregate traffic-admission gate �?" it is GREEN
 * ONLY when BOTH runtime-required services report healthy in the same check:
 *
 *   - `database` �?" authoritative Postgres, pinged through Terminus'
 *     PrismaHealthIndicator (reuses the pooled Prisma client, no new socket).
 *   - `redis`   �?" the runtime runtime-required cache/queue backbone, pinged
 *     through the Phase-3 `RedisHealthIndicator`, which reuses the existing
 *     CacheService ioredis client (no new connection) and bounds the PING to
 *     1500ms so readiness can never hang behind a stalled Redis.
 *
 * Liveness (`/health/live`) stays INDEPENDENT of every dependency �?" it is a
 * pure `{ status: 'ok' }` process-alive signal, deliberately not wired into
 * `HealthCheckService`. That keeps the orchestrator able to restart a process
 * whose Redis or DB is down (liveness must survive datacenter-partial
 * failures), while readiness is what actually takes it out of rotation.
 *
 * Terminus stays as the framework �?" no replacement, no new deps.
 */
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private prismaService: PrismaService,
    private redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prisma.pingCheck('database', this.prismaService),
      () => this.redis.pingCheck('redis'),
    ]);
  }

  @Get('live')
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
