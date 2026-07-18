import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Logger } from 'nestjs-pino';
import { ZodSerializationException } from 'nestjs-zod';

interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string | string[];
  requestId?: string;
  path: string;
  timestamp: string;
  /** Zod field errors, present on 400 validation failures */
  issues?: unknown;
}

/**
 * Single, consistent error envelope for every failure mode.
 *
 * - 4xx: logged as warn (no stack — expected client errors).
 * - 5xx: logged as error with the full stack + requestId for correlation.
 * - Unknown (non-HttpException) errors never leak internals to the client:
 *   the response is a generic 500, the details go to the logs only.
 * - ZodSerializationException (response DTO mismatch) is treated as a 500:
 *   it means the API broke its own contract.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ErrorResponseBody = {
      statusCode: status,
      error: HttpStatus[status] ?? 'Error',
      message: 'Internal server error',
      requestId: request.id as string | undefined,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (isHttp && !(exception instanceof ZodSerializationException)) {
      applyHttpExceptionDetails(body, exception);
    }

    this.logException(exception, status, body.message, {
      reqId: request.id,
      method: request.method,
      url: request.url,
      statusCode: status,
    });

    httpAdapter.reply(reply, body, status);
  }

  private logException(
    exception: unknown,
    status: number,
    message: string | string[],
    logContext: Record<string, unknown>,
  ): void {
    if (status >= 500) {
      const err =
        exception instanceof ZodSerializationException
          ? exception.getZodError()
          : exception;
      this.logger.error(
        { ...logContext, err },
        `Unhandled exception: ${err instanceof Error ? err.message : String(err)}`,
        AllExceptionsFilter.name,
      );
      return;
    }
    this.logger.warn(
      { ...logContext, message },
      `Request failed: ${status}`,
      AllExceptionsFilter.name,
    );
  }
}

// Overlays a client-safe HttpException's status/message/issues onto the envelope.
function applyHttpExceptionDetails(
  body: ErrorResponseBody,
  exception: HttpException,
): void {
  const response = exception.getResponse();
  if (typeof response === 'string') {
    body.message = response;
    return;
  }
  if (typeof response === 'object' && response !== null) {
    const res = response as Record<string, unknown>;
    body.message = (res.message as string | string[]) ?? exception.message;
    if (res.error) body.error = res.error as string;
    if (res.errors) body.issues = res.errors; // nestjs-zod validation issues
  }
}
