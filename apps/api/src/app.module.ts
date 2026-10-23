import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import configuration, { validateEnv } from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { QueueModule } from './queue/queue.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { IdentityModule } from './modules/identity/identity.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { SessionModule } from './modules/session/session.module';
import { AuditModule } from './modules/audit/audit.module';
import { PeopleModule } from './modules/people/people.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { EventsModule } from './modules/events/events.module';
import { AcademicsModule } from './modules/academics/academics.module';
import { FinanceModule } from './modules/finance/finance.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    EventEmitterModule.forRoot({ wildcard: true }),
    PrismaModule,
    CacheModule,
    QueueModule,
    RateLimitModule,
    HealthModule,
    IdentityModule,
    DeliveryModule,
    AuthModule,
    InvitationsModule,
    OnboardingModule,
    SessionModule,
    AuditModule,
    PeopleModule,
    InstitutionsModule,
    EventsModule,
    AcademicsModule,
    FinanceModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: CorrelationIdInterceptor },
  ],
})
export class AppModule {}
