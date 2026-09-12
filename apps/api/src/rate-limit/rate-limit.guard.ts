import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TenantRateLimitGuard implements CanActivate {
  private readonly redis: Redis;
  private readonly windowMs = 1000;
  private readonly maxRequests = 100;

  constructor(config: ConfigService) {
    this.redis = new Redis({
      host: config.get('redis.host', 'localhost'),
      port: config.get('redis.port', 6379),
      password: config.get('redis.password'),
      lazyConnect: true,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;

    if (!tenantId) {
      return true;
    }

    const key = `rate:${tenantId}:${Math.floor(Date.now() / this.windowMs)}`;

    try {
      const current = await this.redis.incr(key);
      if (current === 1) {
        await this.redis.pexpire(key, this.windowMs);
      }

      if (current > this.maxRequests) {
        const ttl = await this.redis.pttl(key);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Rate limit exceeded for tenant',
            retryAfter: Math.ceil(ttl / 1000),
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      return true;
    }
  }
}