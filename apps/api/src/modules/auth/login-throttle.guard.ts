import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { normalizeIdentity } from '../identity/identity.utils';

/**
 * Pre-auth request throttling for the login endpoint (D-09 Layer 1).
 *
 * Runs before any expensive authentication work and applies two fixed-window
 * limits derived from `THROTTLE_*` configuration:
 *  - IP-based: throttle.limit (THROTTLE_LIMIT)
 *  - IP + normalized-identifier: throttle.identifierLimit (THROTTLE_IDENTIFIER_LIMIT)
 *
 * The identifier is canonicalized via `normalizeIdentity` (the same function
 * used by login, uniqueness checks and failed-attempt tracking) so casing
 * variants of one identifier share a single bucket. Exceeding either limit
 * returns HTTP 429. Fail-open when Redis is unavailable to avoid availability
 * DoS on authentication.
 */
@Injectable()
export class LoginThrottleGuard implements CanActivate {
  private readonly redis: Redis;
  private readonly windowMs: number;
  private readonly ipLimit: number;
  private readonly identifierLimit: number;

  constructor(config: ConfigService) {
    this.windowMs = config.get<number>('throttle.ttl', 1000);
    this.ipLimit = config.get<number>('throttle.limit', 100);
    this.identifierLimit = config.get<number>('throttle.identifierLimit', 20);
    this.redis = new Redis({
      host: config.get('redis.host', 'localhost'),
      port: config.get('redis.port', 6379),
      password: config.get('redis.password'),
      lazyConnect: true,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || 'unknown';
    const bucket = Math.floor(Date.now() / this.windowMs);

    try {
      const ipKey = `auth:ip:${ip}:${bucket}`;
      const ipCount = await this.redis.incr(ipKey);
      if (ipCount === 1) {
        await this.redis.pexpire(ipKey, this.windowMs);
      }
      if (ipCount > this.ipLimit) {
        throw await this.exceeded(ipKey);
      }

      const rawIdentifier = (request.body as { email?: unknown })?.email;
      if (typeof rawIdentifier === 'string' && rawIdentifier.trim().length > 0) {
        const identifier = normalizeIdentity(rawIdentifier);
        const idKey = `auth:id:${ip}:${identifier}:${bucket}`;
        const idCount = await this.redis.incr(idKey);
        if (idCount === 1) {
          await this.redis.pexpire(idKey, this.windowMs);
        }
        if (idCount > this.identifierLimit) {
          throw await this.exceeded(idKey);
        }
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      return true;
    }
  }

  private async exceeded(key: string): Promise<HttpException> {
    const ttl = await this.redis.pttl(key).catch(() => 0);
    return new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests',
        retryAfter: Math.ceil(ttl / 1000),
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}