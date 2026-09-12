import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueService } from '../queue/queue.service';
import { QUEUE_NAMES, JOB_TYPES } from '../queue/queue.constants';

async function bootstrapPaymentWorker() {
  const app = await NestFactory.createApplicationContext(
    await import('../app.module').then((m) => m.AppModule),
  );

  const config = app.get(ConfigService);
  const queueService = app.get(QueueService);

  const logger = new Logger('PaymentWorker');
  logger.log('Starting Payment Worker...');

  queueService.createWorker(QUEUE_NAMES.PAYMENTS, async (job) => {
    logger.log(`Processing payment job: ${job.name} (${job.id})`);

    switch (job.name) {
      case JOB_TYPES.PAYMENT_VERIFY:
        logger.log(`Verifying payment: ${JSON.stringify(job.data)}`);
        break;
      case JOB_TYPES.PAYMENT_RECONCILE:
        logger.log(`Reconciling payment: ${JSON.stringify(job.data)}`);
        break;
      default:
        logger.warn(`Unknown payment job type: ${job.name}`);
    }
  });

  logger.log('Payment Worker started');
}

bootstrapPaymentWorker().catch((err) => {
  console.error('Payment Worker failed to start', err);
  process.exit(1);
});