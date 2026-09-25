import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { QUEUE_NAMES, JOB_TYPES } from './queue.constants';
import { buildQueueJobOptions } from './queue-options';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly redis: { connection: { host: string; port: number } };
  private readonly queues = new Map<string, Queue>();
  private readonly workers = new Map<string, Worker>();
  private readonly logger = new Logger(QueueService.name);

  constructor(private config: ConfigService) {
    this.redis = {
      connection: {
        host: config.get('redis.host', 'localhost'),
        port: config.get('redis.port', 6379),
      },
    };
  }

  onModuleDestroy() {
    this.workers.forEach((w) => w.close());
    this.queues.forEach((q) => q.close());
  }

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      this.queues.set(
        name,
        new Queue(name, { connection: this.redis.connection }),
      );
    }
    return this.queues.get(name)!;
  }

  async addJob(
    queueName: string,
    jobType: string,
    data: Record<string, unknown>,
    opts: { priority?: number; delay?: number; jobId?: string } = {},
  ) {
    const queue = this.getQueue(queueName);
    const job = await queue.add(
      jobType,
      data,
      buildQueueJobOptions({
        priority: opts.priority,
        delay: opts.delay,
        jobId: opts.jobId,
      }),
    );

    this.logger.log(`Job ${jobType} added to ${queueName}: ${job.id}`);
    return job;
  }

  createWorker(
    queueName: string,
    handler: (job: Job) => Promise<unknown>,
  ): Worker {
    const worker = new Worker(queueName, handler, {
      connection: this.redis.connection,
      concurrency: 5,
    });

    worker.on('failed', (job, err) => {
      this.logger.error(
        `Job ${job?.name} in ${queueName} failed: ${err.message}`,
      );
    });

    worker.on('completed', (job) => {
      this.logger.log(`Job ${job.name} in ${queueName} completed: ${job.id}`);
    });

    this.workers.set(queueName, worker);
    return worker;
  }
}