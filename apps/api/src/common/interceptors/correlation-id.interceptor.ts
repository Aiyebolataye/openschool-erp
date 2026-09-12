import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export const correlationStorage = new AsyncLocalStorage<string>();

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const correlationId =
      request.headers['x-correlation-id'] || uuidv4();

    return correlationStorage.run(correlationId, () => {
      return next.handle().pipe(
        tap(() => {
          const response = context.switchToHttp().getResponse();
          response.setHeader('X-Correlation-ID', correlationId);
        }),
      );
    });
  }
}