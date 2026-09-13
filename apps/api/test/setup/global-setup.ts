import { execSync } from 'child_process';
import * as path from 'path';
import Redis from 'ioredis';
import { ensureTestEnv } from './env';

export default async function globalSetup(): Promise<void> {
  ensureTestEnv();

  const apiDir = path.join(__dirname, '..', '..');

  console.log('[global-setup] Applying schema to test database...');
  execSync('npx prisma db push --force-reset', {
    cwd: apiDir,
    stdio: 'inherit',
  });

  console.log('[global-setup] Seeding test database...');
  execSync('npx ts-node prisma/seed.ts', {
    cwd: apiDir,
    stdio: 'inherit',
  });

  // Determinism: the login throttle and session Redis indexes live in a shared
  // Redis instance whose fixed-window buckets have long TTLs. Flush everything
  // so re-runs against the same Redis never inherit stale throttle counts (or
  // stale session indexes) from an earlier run.
  console.log('[global-setup] Flushing Redis test data...');
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  });
  await redis.flushall();
  redis.disconnect();

  console.log('[global-setup] Test database ready.');
}