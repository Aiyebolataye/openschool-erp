import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TenantRateLimitGuard } from './rate-limit.guard';

@Global()
@Module({
  providers: [
    TenantRateLimitGuard,
    {
      provide: APP_GUARD,
      useClass: TenantRateLimitGuard,
    },
  ],
})
export class RateLimitModule {}