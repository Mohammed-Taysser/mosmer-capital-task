import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import type { Request, Response } from 'express';

type ErrorResponse = {
  success: false;
  statusCode: number;
  message: string | string[];
  error?: string;
  data: null;
  path: string;
  timestamp: string;
};

@Catch()
class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const body = this.toErrorResponse(exception, request.url);

    response.status(body.statusCode).json(body);
  }

  private toErrorResponse(exception: unknown, path: string): ErrorResponse {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception, path);
    }

    if (exception instanceof PrismaClientKnownRequestError) {
      return this.fromPrismaException(exception, path);
    }

    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
      data: null,
      path,
      timestamp: new Date().toISOString(),
    };
  }

  private fromHttpException(
    exception: HttpException,
    path: string,
  ): ErrorResponse {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return {
        success: false,
        statusCode,
        message: exceptionResponse,
        error: exception.name,
        data: null,
        path,
        timestamp: new Date().toISOString(),
      };
    }

    const responseBody = exceptionResponse as {
      message?: string | string[];
      error?: string;
    };

    return {
      success: false,
      statusCode,
      message: responseBody.message ?? exception.message,
      error: responseBody.error ?? exception.name,
      data: null,
      path,
      timestamp: new Date().toISOString(),
    };
  }

  private fromPrismaException(
    exception: PrismaClientKnownRequestError,
    path: string,
  ): ErrorResponse {
    if (exception.code === 'P2002') {
      const target = this.getUniqueConstraintTarget(exception);

      return {
        success: false,
        statusCode: HttpStatus.CONFLICT,
        message: `Unique constraint failed on ${target}`,
        error: 'Conflict',
        data: null,
        path,
        timestamp: new Date().toISOString(),
      };
    }

    if (exception.code === 'P2025') {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
        error: 'Not Found',
        data: null,
        path,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Database request failed',
      error: 'Bad Request',
      data: null,
      path,
      timestamp: new Date().toISOString(),
    };
  }

  private getUniqueConstraintTarget(
    exception: PrismaClientKnownRequestError,
  ): string {
    if (Array.isArray(exception.meta?.target)) {
      return exception.meta.target.join(', ');
    }

    const adapterError = exception.meta?.driverAdapterError as
      | {
          cause?: {
            constraint?: {
              fields?: string[];
            };
          };
        }
      | undefined;

    const fields = adapterError?.cause?.constraint?.fields;

    if (Array.isArray(fields)) {
      return fields.join(', ');
    }

    return 'field';
  }
}

export { AllExceptionsFilter };
