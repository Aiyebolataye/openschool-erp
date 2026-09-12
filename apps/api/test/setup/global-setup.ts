import { execSync } from 'child_process';
import * as path from 'path';
import { ensureTestEnv } from './env';

export default function globalSetup(): void {
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

  console.log('[global-setup] Test database ready.');
}