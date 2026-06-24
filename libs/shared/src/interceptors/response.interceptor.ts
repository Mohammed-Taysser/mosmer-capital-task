import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, map } from 'rxjs';

type SuccessResponse<TData> = {
  success: true;
  statusCode: number;
  message: string;
  data: TData;
  path: string;
  timestamp: string;
};

@Injectable()
class ResponseInterceptor<TData> implements NestInterceptor<
  TData,
  SuccessResponse<TData | null>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<TData>,
  ): Observable<SuccessResponse<TData | null>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode,
        message: this.getMessage(response.statusCode),
        data: data ?? null,
        path: request.url,
        timestamp: new Date().toISOString(),
      })),
    );
  }

  private getMessage(statusCode: number): string {
    if (statusCode === 201) {
      return 'Created successfully';
    }

    return 'Request successful';
  }
}

export { ResponseInterceptor };
