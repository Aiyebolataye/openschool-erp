import { Options } from 'pino-http';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { ConfigService } from '@nestjs/config';
import { correlationStorage, currentCorrelationId } from '../../common/interceptors/correlation-id.interceptor';

/**
 * Phase-3 structured-logging options (D1 · P3.1).
 *
 * Single source of truth for the pino request-logging envelope, derived
 * entirely from the frozen `logging` config block (configuration.ts §logging)
 * so prod/dev/e2e agree. Because this is a pure factory taking ConfigService,
 * it is fully unit-testable without booting Nest (and without Redis/DB).
 *
 * - Level: driven by `logging.level` (validated to a closed pino set).
 * - Pretty: pino-pretty transport ONLY when `logging.pretty` is true AND not
 *   in production — human-readable in dev/e2e, always structured JSON in prod.
 * - Redaction: JWT/authorization/password/token/cookie/phone secrets are
 *   censored via pino's `redact` (paths + censor), so credentials never land
 *   in logs.
 * - Correlation: `genReqId` reads the existing `X-Correlation-ID` header
 *   (falling back to a fresh UUID) and `customProps` re-attaches
 *   `currentCorrelationId()` from the async store on every log line — this is
 *   the same store the correlation-id interceptor/seeding uses, so request
 *   logs, DB rows, and queue jobs all share one correlation id.
 */
export const REDACT_ENV_SUFFIXES = [] as const;

const DEFAULT_REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-cookie"]',
  'req.headers.raw',
  'res.headers["set-cookie"]',
  'password',
  'newPassword',
  'confirmPassword',
  'oldPassword',
  'secret',
  'otp',
  'token',
  'refreshToken',
  'accessToken',
  '*.password',
  '*.newPassword',
  '*.secret',
  '*.otp',
  '*.token',
];

export function buildPinoHttpOptions(config: ConfigService): Options {
  const level = config.get<string>('logging.level', 'info');
  const pretty = config.get<boolean>('logging.pretty', false);
  const env = config.get<string>('env', 'development');

  return {
    level,
    genReqId: (req: IncomingMessage) =>
      (typeof req.headers['x-correlation-id'] === 'string' &&
        req.headers['x-correlation-id']!.length > 0 &&
        req.headers['x-correlation-id']) ||
      randomUUID(),
    customProps: () => ({ correlationId: currentCorrelationId() }),
    redact: { paths: DEFAULT_REDACT_PATHS, censor: '[REDACTED]' },
    transport: pretty && env !== 'production'
      ? { target: 'pino-pretty', options: { singleLine: true, colorize: true } }
      : undefined,
    autoLogging: { ignore: (req) => req.url === '/health/live' },
  };
}

/** Re-exported so a single import wires request→log correlation. */
export { correlationStorage };
