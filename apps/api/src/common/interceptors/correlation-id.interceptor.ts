import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export const correlationStorage = new AsyncLocalStorage<string>();

/**
 * Read the active request correlation id from request-scoped async context.
 * Returns null when no request is active (background workers, scheduled jobs).
 */
export function currentCorrelationId(): string | null {
  return correlationStorage.getStore() ?? null;
}

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const correlationId =
      request.headers['x-correlation-id'] || uuidv4();

    // Source of truth for the exception filter when the async store is not
    // reachable (filter runs with the same request object).
    request.correlationId = correlationId;

    return correlationStorage.run(correlationId, () => {
      const response = context.switchToHttp().getResponse();
      return next.handle().pipe(
        finalize(() => {
          response.setHeader('X-Correlation-ID', correlationId);
        }),
      );
    });
  }
}