import { JobsOptions } from 'bullmq';

/**
 * Phase-3 queue reliability policy (frozen D2 / P3.5 / §2).
 *
 * Dead-letter policy — NO separate DLQ infrastructure. Failed jobs that
 * exhaust their retries are retained on the queue as failed jobs
 * (`failedKeyData` retention: 7 days) and remain inspectable through the
 * BullMQ failed state. This is the project's dead-letter mechanism.
 *
 * Retry policy — 3 attempts, exponential backoff with a 5s base.
 * Only jobs whose handlers are idempotent at their domain boundary (or
 * naturally-safe to re-run) must use automatic retries; see D2 §2.
 *
 * Idempotency — where a job produces an externally visible side effect
 * (duplicate email, duplicate ledger entry), the caller MUST supply a
 * deterministic `jobId`, which both de-duplicates identical jobs and makes
 * the handler safe to retry. Handlers are documented per-job.
 */
export function buildQueueJobOptions(
  overrides: {
    attempts?: number;
    delay?: number;
    jobId?: string;
    priority?: number;
  } = {},
): JobsOptions {
  return {
    attempts: overrides.attempts ?? 3,
    priority: overrides.priority,
    delay: overrides.delay,
    jobId: overrides.jobId,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { age: 86400 },
    removeOnFail: { age: 604800 },
  };
}

export const QUEUE_CONCURRENCY = 5;
