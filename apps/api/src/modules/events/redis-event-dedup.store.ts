import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { EventDedupStore } from './event-dedup.store';

/**
 * Redis-backed, cross-instance dedup store (D-4). `SET key 1 PX <ttl> NX` is a
 * single atomic round-trip: exactly one instance acquires a given `eventId`,
 * which is what makes the 72-hour dedup correct when producers/consumers run
 * on more than one process.
 *
 * Fail-open: if Redis is unreachable the store ALLOWS the event through (logs
 * a warning). Dedup is an idempotency optimization — an audit/processing
 * hiccup must never become a hard availability or correctness dependency.
 */
@Injectable()
export class RedisEventDedupStore implements EventDedupStore, OnModuleDestroy {
  private readonly logger = new Logger(RedisEventDedupStore.name);
  private readonly redis: Redis;

  constructor(config: ConfigService) {
    this.redis = new Redis({
      host: config.get<string>('redis.host', 'localhost'),
      port: config.get<number>('redis.port', 6379),
      password: config.get<string>('redis.password'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
    this.redis.on('error', (err) => {
      this.logger.warn(`Event dedup Redis error: ${String(err)}`);
    });
  }

  async tryAcquire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.redis.set(key, '1', 'PX', ttlSeconds * 1000, 'NX');
      return result === 'OK';
    } catch (err) {
      this.logger.warn(`Event dedup store unavailable, allowing through: ${String(err)}`);
      return true;
    }
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}