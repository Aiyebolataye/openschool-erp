import { validateEnv, REQUIRED_ENV_VARS } from './configuration';

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
});