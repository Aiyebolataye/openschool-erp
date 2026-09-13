import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(CacheService.name);
  private readonly tagPrefix = 'tag:';
  private readonly defaultTtl = 300;

  constructor(private config: ConfigService) {
    this.redis = new Redis({
      host: config.get('redis.host', 'localhost'),
      port: config.get('redis.port', 6379),
      password: config.get('redis.password'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      this.logger.warn(`Cache GET failed for key: ${key}`);
      return null;
    }
  }

  async set(key: string, value: unknown, options: CacheOptions = {}) {
    try {
      const ttl = options.ttl || this.defaultTtl;
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);

      if (options.tags?.length) {
        await this.tagKeys(key, options.tags, ttl);
      }
    } catch {
      this.logger.warn(`Cache SET failed for key: ${key}`);
    }
  }

  async del(key: string) {
    try {
      await this.redis.del(key);
    } catch {
      this.logger.warn(`Cache DEL failed for key: ${key}`);
    }
  }

  /**
   * B4 session index helpers. Redis is a cache/index only — session validity is
   * always decided against the authoritative database row. These set helpers
   * index which access-token cache keys belong to a session/user so that
   * revocation and logout can invalidate the right keys.
   */
  async sadd(key: string, member: string, ttlSeconds?: number): Promise<void> {
    try {
      await this.redis.sadd(key, member);
      if (ttlSeconds) {
        await this.redis.expire(key, ttlSeconds);
      }
    } catch {
      this.logger.warn(`Cache SADD failed for key: ${key}`);
    }
  }

  async srem(key: string, member: string): Promise<void> {
    try {
      await this.redis.srem(key, member);
    } catch {
      this.logger.warn(`Cache SREM failed for key: ${key}`);
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key);
    } catch {
      this.logger.warn(`Cache SMEMBERS failed for key: ${key}`);
      return [];
    }
  }

  async invalidateByTags(tags: string[]) {
    try {
      const pipeline = this.redis.pipeline();

      for (const tag of tags) {
        const keys = await this.redis.smembers(`${this.tagPrefix}${tag}`);
        if (keys.length) {
          keys.forEach((k) => pipeline.del(k));
          pipeline.del(`${this.tagPrefix}${tag}`);
        }
      }

      await pipeline.exec();
    } catch {
      this.logger.warn(`Cache invalidation by tags failed: ${tags.join(', ')}`);
    }
  }

  async flushAll() {
    try {
      await this.redis.flushdb();
    } catch {
      this.logger.warn('Cache flushAll failed');
    }
  }

  private async tagKeys(key: string, tags: string[], ttl: number) {
    const pipeline = this.redis.pipeline();
    for (const tag of tags) {
      pipeline.sadd(`${this.tagPrefix}${tag}`, key);
      pipeline.expire(`${this.tagPrefix}${tag}`, ttl + 60);
    }
    await pipeline.exec();
  }
}