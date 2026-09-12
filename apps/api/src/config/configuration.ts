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
}

export interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
  database: { url: string };
  redis: RedisConfig;
  jwt: JwtConfig;
  s3: S3Config;
  payment: PaymentConfig;
  throttle: ThrottleConfig;
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

  return env;
}

export default (): AppConfig => {
  const env = process.env;

  return {
    env: env.NODE_ENV || 'development',
    port: parseInt(env.PORT || '3000', 10),
    apiPrefix: env.API_PREFIX || 'api/v1',
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
      expiresIn: env.JWT_EXPIRES_IN || '1h',
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
    },
  };
};