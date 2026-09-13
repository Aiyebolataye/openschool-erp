import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SessionCleanupService } from '../modules/session/session-cleanup.service';

/**
 * Standalone process that owns the periodic expired-session sweep (spec I-22).
 * Mirrors workers/payment.worker.ts: boots a Nest application context, grabs
 * the service and lets the loop run on a non-refed timer so the process exits
 * cleanly. The web app never starts this loop itself.
 */
async function bootstrapSessionCleanupWorker() {
  const app = await NestFactory.createApplicationContext(
    await import('../app.module').then((m) => m.AppModule),
  );

  const logger = new Logger('SessionCleanupWorker');
  logger.log('Starting Session Cleanup Worker...');

  app.get(SessionCleanupService).startCleanupLoop();

  const shutdown = () => {
    app.get(SessionCleanupService).stopCleanupLoop();
    void app.close().then(() => process.exit(0));
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  logger.log('Session Cleanup Worker started');
}

bootstrapSessionCleanupWorker().catch((err) => {
  console.error('Session Cleanup Worker failed to start', err);
  process.exit(1);
});