import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { currentCorrelationId } from '../interceptors/correlation-id.interceptor';

/**
 * Global error envelope (locked D-07 / P1.5). Every error response is:
 *
 *   { success: false, error: { code, message, details?, correlationId?, timestamp? } }
 *
 * - `code` is derived from the HTTP status (machine-stable, never `statusCode`).
 * - `details` only ever carries non-sensitive diagnostics: validation field
 *   arrays, or `[{ retryAfter }]` for 423/429 (decisions D-B5-5).
 * - 5xx messages are generic; stack traces are never leaked.
 * - 401/403 carry no differential detail (D-03 opaqueness preserved).
 */

const CODE_BY_STATUS: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'PAYLOAD_TOO_LARGE',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
  423: 'LOCKED',
  [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
};

interface EnvelopeBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    retryAfter?: never;
    correlationId?: string;
    timestamp?: string;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const correlationId =
      currentCorrelationId() ??
      (request as Record<string, unknown>).correlationId ??
      request?.headers?.['x-correlation-id'] ??
      undefined;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object' && exResponse !== null) {
        const res = exResponse as Record<string, unknown>;
        if (typeof res.message === 'string') {
          message = res.message;
        } else if (Array.isArray(res.message)) {
          message = 'Validation failed';
          details = res.message;
        }
        if (res.details !== undefined) {
          details = res.details;
        }
        if (res.errors !== undefined) {
          details = res.errors;
        }
        if (res.retryAfter !== undefined) {
          details = [{ retryAfter: res.retryAfter }];
        }
      }
    }

    // Raw errors (e.g. body-parser `entity.too.large` → 413) are not
    // HttpException instances; honor their numeric HTTP status if it is a
    // legitimate 4xx and we haven't already classified the response (locked
    // envelope, decision D-B5: no leak of parser internals beyond the status).
    if (status === HttpStatus.INTERNAL_SERVER_ERROR && exception !== null && typeof exception === 'object') {
      const err = exception as Record<string, unknown>;
      const rawStatus = typeof err.status === 'number' ? err.status
        : typeof err.statusCode === 'number' ? err.statusCode
        : typeof err.getStatus === 'function' ? (err.getStatus as () => number)()
        : undefined;
      if (rawStatus !== undefined && rawStatus >= 400 && rawStatus < 500) {
        status = rawStatus;
        // 413 (Payload Too Large / PayloadTooLargeException) gets an opaque
        // body; a router 404 is already handled above as HttpException.
        if (status === 413) {
          message = 'Request entity too large';
        }
      }
    }

    const body: EnvelopeBody = {
      success: false,
      error: {
        code: CODE_BY_STATUS[status] ?? 'INTERNAL_ERROR',
        message,
        correlationId:
          typeof correlationId === 'string' ? correlationId : undefined,
        timestamp: new Date().toISOString(),
      },
    };

    if (details !== undefined) {
      body.error.details = Array.isArray(details) ? details : [details];
    }

    // Correlation header must round-trip on every errored response, including
    // unmatched-route 404s where no controller/interceptor ever ran (D-07,
    // decision D-B5-5). The interceptor covers handled routes; the filter is
    // the only writer for these.
    if (correlationId !== undefined) {
      response.setHeader('X-Correlation-ID', correlationId);
    }

    response.status(status).json(body);
  }
}