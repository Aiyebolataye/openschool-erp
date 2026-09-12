import * as fs from 'fs';
import * as path from 'path';

export const TEST_ENV_FILE = path.join(__dirname, '..', '..', '.env.test');

export function loadTestEnv(): Record<string, string> {
  if (!fs.existsSync(TEST_ENV_FILE)) {
    throw new Error(
      `Test environment file not found at ${TEST_ENV_FILE}. ` +
        'Copy .env.test.example to .env.test before running integration tests.',
    );
  }

  const parsed: Record<string, string> = {};
  const raw = fs.readFileSync(TEST_ENV_FILE, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    parsed[key] = value;
  }
  return parsed;
}

export function setProcessEnvTest(env: Record<string, string>): void {
  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value;
  }
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
  }
}

export function ensureTestEnv(): void {
  // Guard: never let test tooling point at a non-test database.
  const current = process.env.DATABASE_URL || '';
  if (current && !/openschool_test/.test(current) && process.env.NODE_ENV === 'test') {
    throw new Error(
      `Refusing to run tests against DATABASE_URL that is not the test database: ${current}`,
    );
  }
  setProcessEnvTest(loadTestEnv());
}