export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface S3Config {
  endpoint?: string;
  bucket: string;
  accessKey?: string;
  secretKey?: string;
  region: string;
}

export interface PaymentConfig {
  paystackSecretKey?: string;
  paystackWebhookSecret?: string;
}

export interface ThrottleConfig {
  ttl: number;
  limit: number;
  identifierLimit: number;
}

export interface LoginProtectionConfig {
  maxAttempts: number;
  failureWindowMinutes: number;
  lockMinutes: number;
}

export interface SessionConfig {
  maxSessions: number;
  cleanupIntervalMinutes: number;
}

export interface AuthConfig {
  publicRegistrationRoles: string[];
}

export interface DeliveryConfig {
  provider: string;
}

export interface InvitationConfig {
  expiryDays: number;
  maxPending: number;
}

export interface OnboardingConfig {
  expiryDays: number;
}

export interface VerificationConfig {
  tokenTtlMinutes: number;
}

export interface CorsConfig {
  origins: string[];
}

export interface HttpConfig {
  bodyLimit: string;
}

export interface SecurityConfig {
  hstsMaxAgeSeconds: number;
  hstsIncludeSubDomains: boolean;
}

export interface SwaggerConfig {
  enabled: boolean;
}

export interface AuditConfig {
  actorEmailCapture: boolean;
}

export interface LoggingConfig {
  /** Pino level ('trace'|'debug'|'info'|'warn'|'error'|'fatal'). */
  level: string;
  /** Human-readable pino-pretty transport (development/local only). */
  pretty: boolean;
}

export interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
  logging: LoggingConfig;
  database: { url: string };
  redis: RedisConfig;
  jwt: JwtConfig;
  s3: S3Config;
  payment: PaymentConfig;
  throttle: ThrottleConfig;
  loginProtection: LoginProtectionConfig;
  session: SessionConfig;
  auth: AuthConfig;
  delivery: DeliveryConfig;
  invitation: InvitationConfig;
  onboarding: OnboardingConfig;
  verification: VerificationConfig;
  cors: CorsConfig;
  http: HttpConfig;
  security: SecurityConfig;
  swagger: SwaggerConfig;
  audit: AuditConfig;
}

export const REQUIRED_ENV_VARS = ['DATABASE_URL', 'JWT_SECRET'] as const;

const WEAK_JWT_SECRETS = new Set([
  'change-me',
  'changeme',
  'change-me-in-production',
  'secret',
  'jwtsecret',
  '',
]);

export function validateEnv(env: Record<string, unknown>): Record<string, unknown> {
  const missing = REQUIRED_ENV_VARS.filter(
    (name) => !env[name] || String(env[name]).trim() === '',
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  const jwtSecret = String(env.JWT_SECRET);
  if (WEAK_JWT_SECRETS.has(jwtSecret)) {
    throw new Error('JWT_SECRET must not use a default/placeholder value.');
  }

  const nodeEnv = String(env.NODE_ENV || 'development');
  if (nodeEnv === 'production' && jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }

  validatePositiveNumber('THROTTLE_TTL', env.THROTTLE_TTL);
  validatePositiveNumber('THROTTLE_LIMIT', env.THROTTLE_LIMIT);
  validatePositiveNumber('THROTTLE_IDENTIFIER_LIMIT', env.THROTTLE_IDENTIFIER_LIMIT);
  validatePositiveNumber('LOGIN_FAILURE_WINDOW_MINUTES', env.LOGIN_FAILURE_WINDOW_MINUTES);
  validatePositiveNumber('LOGIN_LOCK_MINUTES', env.LOGIN_LOCK_MINUTES);
  validatePositiveNumber('SESSION_CLEANUP_INTERVAL_MINUTES', env.SESSION_CLEANUP_INTERVAL_MINUTES);

  if (env.SESSION_MAX_SESSIONS !== undefined && env.SESSION_MAX_SESSIONS !== '') {
    const maxSessions = Number(env.SESSION_MAX_SESSIONS);
    if (!Number.isInteger(maxSessions) || maxSessions < 1) {
      throw new Error('SESSION_MAX_SESSIONS must be a positive integer.');
    }
  }

  if (env.LOGIN_MAX_ATTEMPTS !== undefined && env.LOGIN_MAX_ATTEMPTS !== '') {
    const maxAttempts = Number(env.LOGIN_MAX_ATTEMPTS);
    if (!Number.isInteger(maxAttempts) || maxAttempts < 3 || maxAttempts > 10) {
      throw new Error('LOGIN_MAX_ATTEMPTS must be an integer between 3 and 10.');
    }
  }

  if (env.CORS_ORIGINS !== undefined && String(env.CORS_ORIGINS).trim() !== '') {
    const origins = String(env.CORS_ORIGINS)
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);
    if (nodeEnv === 'production' && origins.includes('*')) {
      throw new Error('CORS_ORIGINS must not include "*" in production.');
    }
  }

  if (env.BODY_LIMIT !== undefined && String(env.BODY_LIMIT).trim() !== '') {
    const bodyLimit = String(env.BODY_LIMIT).trim();
    if (!/^\d+(\.\d+)?(b|kb|mb|gb)?$/i.test(bodyLimit)) {
      throw new Error('BODY_LIMIT must be a size expression such as "1mb", "2kb" or "1048576".');
    }
  }

  validatePositiveNumber('HSTS_MAX_AGE_SECONDS', env.HSTS_MAX_AGE_SECONDS);

  if (env.SWAGGER_ENABLED !== undefined && String(env.SWAGGER_ENABLED).trim() !== '') {
    const value = String(env.SWAGGER_ENABLED).trim().toLowerCase();
    if (value !== 'true' && value !== 'false') {
      throw new Error('SWAGGER_ENABLED must be "true" or "false".');
    }
  }

  return env;
}

const DURATION_UNITS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
  w: 7 * 24 * 60 * 60,
};

/**
 * Parse a duration expression (e.g. "15m", "7d", "1h", "3600") into
 * milliseconds. Used for the config-driven access/refresh TTLs (D-04).
 */
export function parseDurationToMs(value: string): number {
  const trimmed = String(value).trim().toLowerCase();
  const match = /^(\d+(?:\.\d+)?)([smhdw]?)$/.exec(trimmed);
  if (!match) {
    throw new Error(`Invalid duration expression: "${value}".`);
  }
  const amount = Number(match[1]);
  const unit = match[2] || 's';
  return amount * DURATION_UNITS[unit] * 1000;
}

function validatePositiveNumber(name: string, value: unknown): void {
  if (value === undefined || value === null || String(value).trim() === '') {
    return;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }
}

export default (): AppConfig => {
  const env = process.env;
  const nodeEnv = env.NODE_ENV || 'development';
  const isProductionEnvironment = nodeEnv === 'production';

  const configuredOrigins = (env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0);

  return {
    env: nodeEnv,
    port: parseInt(env.PORT || '3000', 10),
    apiPrefix: env.API_PREFIX || 'api/v1',
    logging: {
      level: (env.LOG_LEVEL || 'info').toLowerCase(),
      pretty: !isProductionEnvironment && String(env.LOG_PRETTY ?? 'true') !== 'false',
    },
    database: {
      url: env.DATABASE_URL!,
    },
    redis: {
      host: env.REDIS_HOST || 'localhost',
      port: parseInt(env.REDIS_PORT || '6379', 10),
      password: env.REDIS_PASSWORD || undefined,
    },
    jwt: {
      secret: env.JWT_SECRET!,
      expiresIn: env.JWT_EXPIRES_IN || '15m',
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    s3: {
      endpoint: env.S3_ENDPOINT,
      bucket: env.S3_BUCKET || 'openschool-dev',
      accessKey: env.S3_ACCESS_KEY,
      secretKey: env.S3_SECRET_KEY,
      region: env.S3_REGION || 'us-east-1',
    },
    payment: {
      paystackSecretKey: env.PAYSTACK_SECRET_KEY,
      paystackWebhookSecret: env.PAYSTACK_WEBHOOK_SECRET,
    },
    throttle: {
      ttl: parseInt(env.THROTTLE_TTL || '1000', 10),
      limit: parseInt(env.THROTTLE_LIMIT || '100', 10),
      identifierLimit: parseInt(env.THROTTLE_IDENTIFIER_LIMIT || '20', 10),
    },
    loginProtection: {
      maxAttempts: parseInt(env.LOGIN_MAX_ATTEMPTS || '5', 10),
      failureWindowMinutes: parseFloat(env.LOGIN_FAILURE_WINDOW_MINUTES || '15'),
      lockMinutes: parseFloat(env.LOGIN_LOCK_MINUTES || '15'),
    },
    session: {
      maxSessions: parseInt(env.SESSION_MAX_SESSIONS || '5', 10),
      cleanupIntervalMinutes: parseInt(
        env.SESSION_CLEANUP_INTERVAL_MINUTES || '60',
        10,
      ),
    },
    auth: {
      publicRegistrationRoles: (env.AUTH_PUBLIC_REGISTRATION_ROLES || '')
        .split(',')
        .map((r) => r.trim().toUpperCase())
        .filter((r) => r.length > 0),
    },
    delivery: {
      provider: env.DELIVERY_PROVIDER || 'dev',
    },
    invitation: {
      expiryDays: parseInt(env.INVITATION_EXPIRY_DAYS || '7', 10),
      maxPending: parseInt(env.INVITATION_MAX_PENDING || '50', 10),
    },
    onboarding: {
      expiryDays: parseInt(env.ONBOARDING_LINK_EXPIRY_DAYS || '182', 10),
    },
    verification: {
      tokenTtlMinutes: parseInt(
        env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES || '60',
        10,
      ),
    },
    cors: {
      origins:
        configuredOrigins.length > 0
          ? configuredOrigins
          : isProductionEnvironment
            ? []
            : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
    },
    http: {
      bodyLimit: env.BODY_LIMIT || '1mb',
    },
    security: {
      hstsMaxAgeSeconds: parseInt(env.HSTS_MAX_AGE_SECONDS || '15552000', 10),
      hstsIncludeSubDomains:
        env.HSTS_INCLUDE_SUBDOMAINS === undefined ||
        String(env.HSTS_INCLUDE_SUBDOMAINS).trim().toLowerCase() === 'true',
    },
    swagger: {
      enabled:
        env.SWAGGER_ENABLED !== undefined && String(env.SWAGGER_ENABLED).trim() !== ''
          ? String(env.SWAGGER_ENABLED).trim().toLowerCase() === 'true'
          : !isProductionEnvironment,
    },
    audit: {
      actorEmailCapture:
        env.AUDIT_ACTOR_EMAIL_CAPTURE === undefined ||
        String(env.AUDIT_ACTOR_EMAIL_CAPTURE).trim().toLowerCase() !== 'false',
    },
  };
};