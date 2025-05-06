import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers, body, ip, query, params } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = headers['x-request-id'] || `req-${Date.now()}`;
    
    // Don't log sensitive information like passwords or tokens
    const sanitizedBody = this.sanitizeBody(body);
    const sanitizedHeaders = this.sanitizeHeaders(headers);
    
    // Log request
    this.logger.log({
      message: `Incoming request ${method} -  ${url} - ${requestId} - ${ip}`,
      requestId,
      method,
      url,
      query,
      params,
      body: sanitizedBody,
      headers: sanitizedHeaders,
      ip,
      userAgent,
    });
    
    const start = Date.now();
    
    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const responseTime = Date.now() - start;
          
          // Log successful response
          this.logger.log({
            message: `Request completed`,
            requestId,
            method,
            url,
            responseTime: `${responseTime}ms`,
            status: context.switchToHttp().getResponse().statusCode,
          });
        },
        error: (error) => {
          const responseTime = Date.now() - start;
          
          // Log error response (detailed error will be logged by exception filter)
          this.logger.warn({
            message: `Request failed`,
            requestId,
            method,
            url,
            responseTime: `${responseTime}ms`,
            status: error.status || 500,
          });
        }
      }),
    );
  }
  
  private sanitizeBody(body: any): any {
    if (!body) return body;
    const sanitized = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'refreshToken', 'secret'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
  
  private sanitizeHeaders(headers: any): any {
    if (!headers) return headers;
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
