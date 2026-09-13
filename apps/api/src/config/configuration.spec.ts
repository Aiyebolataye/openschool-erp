import {
  validateEnv,
  REQUIRED_ENV_VARS,
  parseDurationToMs,
} from './configuration';
import configuration from './configuration';

describe('validateEnv', () => {
  const validEnv: Record<string, unknown> = {
    DATABASE_URL:
      'postgresql://openschool:openschool@localhost:5433/openschool_test?schema=public',
    JWT_SECRET: 'a-test-secret-that-is-longer-than-32-characters',
  };

  it('accepts a complete valid environment', () => {
    const result = validateEnv({ ...validEnv });
    expect(result).toEqual({ ...validEnv });
  });

  it('rejects a missing required variable', () => {
    for (const name of REQUIRED_ENV_VARS) {
      const env = { ...validEnv };
      delete env[name];
      expect(() => validateEnv(env)).toThrowError(
        `Missing required environment variables: ${name}`,
      );
    }
  });

  it('rejects a blank required variable', () => {
    const env = { ...validEnv, JWT_SECRET: '   ' };
    expect(() => validateEnv(env)).toThrowError(/JWT_SECRET/);
  });

  it('rejects the global placeholder jwt secret', () => {
    const env = { ...validEnv, JWT_SECRET: 'change-me' };
    expect(() => validateEnv(env)).toThrowError(/must not use a default/);
  });

  it('rejects the example template placeholder jwt secret', () => {
    const env = { ...validEnv, JWT_SECRET: 'change-me-in-production' };
    expect(() => validateEnv(env)).toThrowError(/must not use a default/);
  });

  it('rejects short secrets in production', () => {
    const env = { ...validEnv, NODE_ENV: 'production', JWT_SECRET: 'short' };
    expect(() => validateEnv(env)).toThrowError(/at least 32 characters/);
  });

  it('allows short secrets outside production', () => {
    expect(() => validateEnv({ ...validEnv, JWT_SECRET: 'short' })).not.toThrow();
  });

  describe('session configuration', () => {
    it('accepts valid SESSION_MAX_SESSIONS values', () => {
      for (const value of ['1', '5', '20']) {
        expect(() =>
          validateEnv({ ...validEnv, SESSION_MAX_SESSIONS: value }),
        ).not.toThrow();
      }
    });

    it('rejects non-positive or non-integer SESSION_MAX_SESSIONS', () => {
      expect(() => validateEnv({ ...validEnv, SESSION_MAX_SESSIONS: '0' })).toThrowError(
        /SESSION_MAX_SESSIONS/,
      );
      expect(() => validateEnv({ ...validEnv, SESSION_MAX_SESSIONS: '-1' })).toThrowError(
        /SESSION_MAX_SESSIONS/,
      );
      expect(() => validateEnv({ ...validEnv, SESSION_MAX_SESSIONS: '2.5' })).toThrowError(
        /SESSION_MAX_SESSIONS/,
      );
    });

    it('accepts a positive SESSION_CLEANUP_INTERVAL_MINUTES', () => {
      expect(() =>
        validateEnv({ ...validEnv, SESSION_CLEANUP_INTERVAL_MINUTES: '60' }),
      ).not.toThrow();
    });

    it('rejects zero or non-numeric SESSION_CLEANUP_INTERVAL_MINUTES', () => {
      expect(() =>
        validateEnv({ ...validEnv, SESSION_CLEANUP_INTERVAL_MINUTES: '0' }),
      ).toThrowError(/SESSION_CLEANUP_INTERVAL_MINUTES/);
      expect(() =>
        validateEnv({ ...validEnv, SESSION_CLEANUP_INTERVAL_MINUTES: 'soon' }),
      ).toThrowError(/SESSION_CLEANUP_INTERVAL_MINUTES/);
    });
  });

  describe('parseDurationToMs', () => {
    it('parses suffix durations into milliseconds', () => {
      expect(parseDurationToMs('15m')).toBe(15 * 60 * 1000);
      expect(parseDurationToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
      expect(parseDurationToMs('1h')).toBe(60 * 60 * 1000);
      expect(parseDurationToMs('1w')).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it('treats a bare number as seconds', () => {
      expect(parseDurationToMs('3600')).toBe(3600 * 1000);
    });

    it('rejects malformed durations', () => {
      expect(() => parseDurationToMs('abc')).toThrowError(/Invalid duration/);
      expect(() => parseDurationToMs('10x')).toThrowError(/Invalid duration/);
    });
  });

  describe('security gate configuration (B5)', () => {
    it('accepts a comma-separated CORS_ORIGINS list', () => {
      expect(() =>
        validateEnv({
          ...validEnv,
          CORS_ORIGINS: 'http://localhost:3001,https://app.example.com',
        }),
      ).not.toThrow();
    });

    it('rejects a wildcard CORS origin in production', () => {
      expect(() =>
        validateEnv({
          ...validEnv,
          NODE_ENV: 'production',
          CORS_ORIGINS: '*',
        }),
      ).toThrowError(/CORS_ORIGINS/);
    });

    it('allows a wildcard CORS origin outside production', () => {
      expect(() =>
        validateEnv({ ...validEnv, CORS_ORIGINS: '*' }),
      ).not.toThrow();
    });

    it('accepts a valid BODY_LIMIT expression', () => {
      for (const value of ['1mb', '2kb', '1048576', '512b']) {
        expect(() =>
          validateEnv({ ...validEnv, BODY_LIMIT: value }),
        ).not.toThrow();
      }
    });

    it('rejects a malformed BODY_LIMIT expression', () => {
      expect(() =>
        validateEnv({ ...validEnv, BODY_LIMIT: 'medium' }),
      ).toThrowError(/BODY_LIMIT/);
    });

    it('accepts valid HSTS configuration', () => {
      expect(() =>
        validateEnv({ ...validEnv, HSTS_MAX_AGE_SECONDS: '15552000' }),
      ).not.toThrow();
    });

    it('rejects a non-positive HSTS max age', () => {
      expect(() =>
        validateEnv({ ...validEnv, HSTS_MAX_AGE_SECONDS: '0' }),
      ).toThrowError(/HSTS_MAX_AGE_SECONDS/);
    });

    it('validates SWAGGER_ENABLED boolean values', () => {
      expect(() => validateEnv({ ...validEnv, SWAGGER_ENABLED: 'true' })).not.toThrow();
      expect(() => validateEnv({ ...validEnv, SWAGGER_ENABLED: 'false' })).not.toThrow();
      expect(() =>
        validateEnv({ ...validEnv, SWAGGER_ENABLED: 'sometimes' }),
      ).toThrowError(/SWAGGER_ENABLED/);
    });
  });

  describe('login protection configuration', () => {
    it('accepts valid bounds for LOGIN_MAX_ATTEMPTS', () => {
      for (const value of ['3', '5', '10']) {
        expect(() =>
          validateEnv({ ...validEnv, LOGIN_MAX_ATTEMPTS: value }),
        ).not.toThrow();
      }
    });

    it('rejects LOGIN_MAX_ATTEMPTS below the frozen range', () => {
      expect(() =>
        validateEnv({ ...validEnv, LOGIN_MAX_ATTEMPTS: '2' }),
      ).toThrowError(/between 3 and 10/);
    });

    it('rejects LOGIN_MAX_ATTEMPTS above the frozen range', () => {
      expect(() =>
        validateEnv({ ...validEnv, LOGIN_MAX_ATTEMPTS: '11' }),
      ).toThrowError(/between 3 and 10/);
    });

    it('rejects a non-integer LOGIN_MAX_ATTEMPTS', () => {
      expect(() =>
        validateEnv({ ...validEnv, LOGIN_MAX_ATTEMPTS: '5.5' }),
      ).toThrowError(/between 3 and 10/);
    });

    it('rejects non-positive throttle/window/lock values when set', () => {
      expect(() => validateEnv({ ...validEnv, THROTTLE_TTL: '0' })).toThrowError(
        /THROTTLE_TTL/,
      );
      expect(() =>
        validateEnv({ ...validEnv, THROTTLE_LIMIT: '-1' }),
      ).toThrowError(/THROTTLE_LIMIT/);
      expect(() =>
        validateEnv({ ...validEnv, THROTTLE_IDENTIFIER_LIMIT: '0' }),
      ).toThrowError(/THROTTLE_IDENTIFIER_LIMIT/);
      expect(() =>
        validateEnv({ ...validEnv, LOGIN_FAILURE_WINDOW_MINUTES: '0' }),
      ).toThrowError(/LOGIN_FAILURE_WINDOW_MINUTES/);
      expect(() =>
        validateEnv({ ...validEnv, LOGIN_LOCK_MINUTES: '0' }),
      ).toThrowError(/LOGIN_LOCK_MINUTES/);
    });

    it('rejects a non-numeric throttle value', () => {
      expect(() =>
        validateEnv({ ...validEnv, THROTTLE_IDENTIFIER_LIMIT: 'many' }),
      ).toThrowError(/THROTTLE_IDENTIFIER_LIMIT/);
    });
  });

  describe('configuration factory (B5 defaults)', () => {
    const originalEnv = process.env;
    const baseEnv = {
      NODE_ENV: 'test',
      DATABASE_URL: validEnv.DATABASE_URL,
      JWT_SECRET: validEnv.JWT_SECRET,
    };

    beforeEach(() => {
      process.env = { ...originalEnv, ...baseEnv } as NodeJS.ProcessEnv;
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('applies development CORS defaults when CORS_ORIGINS is unset', () => {
      delete process.env.CORS_ORIGINS;
      const config = configuration();
      expect(config.cors.origins).toContain('http://localhost:3001');
    });

    it('defaults to an empty CORS allow-list in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.CORS_ORIGINS;
      const config = configuration();
      expect(config.cors.origins).toEqual([]);
    });

    it('parses CORS_ORIGINS into an array', () => {
      process.env.CORS_ORIGINS = 'https://a.example.com, https://b.example.com';
      const config = configuration();
      expect(config.cors.origins).toEqual([
        'https://a.example.com',
        'https://b.example.com',
      ]);
    });

    it('defaults body limit, HSTS and actor-email capture', () => {
      const config = configuration();
      expect(config.http.bodyLimit).toBe('1mb');
      expect(config.security.hstsMaxAgeSeconds).toBe(15552000);
      expect(config.security.hstsIncludeSubDomains).toBe(true);
      expect(config.audit.actorEmailCapture).toBe(true);
    });

    it('enables swagger outside production and disables it in production by default', () => {
      expect(configuration().swagger.enabled).toBe(true);
      process.env.NODE_ENV = 'production';
      expect(configuration().swagger.enabled).toBe(false);
      process.env.SWAGGER_ENABLED = 'true';
      expect(configuration().swagger.enabled).toBe(true);
    });

    it('honours explicit SWAGGER_ENABLED=false', () => {
      process.env.SWAGGER_ENABLED = 'false';
      expect(configuration().swagger.enabled).toBe(false);
    });
  });
});