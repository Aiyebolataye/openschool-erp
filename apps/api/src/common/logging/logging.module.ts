import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule, Params } from 'nestjs-pino';
import { buildPinoHttpOptions } from './logging.options';

/**
 * Phase-3 structured-logging wiring (D1 / P3.1).
 *
 * Registers nestjs-pino's transport ONCE, driven entirely by the frozen
 * `logging` config block and the existing correlation store (correlation-id
 * interceptor), so DEV / PROD / E2E agree on one surface: config-driven level,
 * pino-pretty only when `logging.pretty`, secret redaction (pino `redact`),
 * and request/DGB/queue correlation ids on every line �?" with **no new
 * dependencies** and **no divergence between `main.ts` and the e2e app**
 * (both route through the shared bootstrap identically).
 */
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): Params => ({
        pinoHttp: buildPinoHttpOptions(config),
      }),
    }),
  ],
})
export class LoggingModule {}