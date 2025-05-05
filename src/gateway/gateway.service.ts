import { Injectable, Logger, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';

import { RouteService } from './route.service';
import { CacheService } from '../cache/cache.service';
import { CircuitBreakerService } from './circuit-breaker.service';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly routeService: RouteService,
    private readonly cacheService: CacheService,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  async handleRequest(
    method: string,
    path: string,
    headers: any,
    body?: any,
    query?: any,
  ): Promise<any> {
    this.logger.log(`Handling ${method} request to ${path}`);

    // Determine target service
    const route = this.routeService.getRoute(path);
    if (!route) {
      throw new HttpException(`No route found for path: ${path}`, HttpStatus.NOT_FOUND);
    }

    // Create a more specific service identifier that includes the method and path
    const serviceId = `${route.service}-${method.toLowerCase()}-${path}`;

    // Check if response is cached for GET requests
    if (method.toUpperCase() === 'GET' && route.cacheEnabled) {
      this.logger.log(`RESPONSE IS CACHED ${serviceId}`);
      const cacheKey = `${method}:${path}:${JSON.stringify(query || {})}`;
      const cachedResponse = await this.cacheService.get(cacheKey);

      if (cachedResponse) {
        this.logger.log(`Cache hit for ${cacheKey}`);
        return cachedResponse;
      }
    }

    // Prepare request configuration
    const requestConfig: AxiosRequestConfig = {
      headers: this.filterHeaders(headers),
      params: query,
    };

    // Create a function to execute the HTTP request
    const executeRequest = async () => {
      try {
        let response: AxiosResponse;

        switch (method.toUpperCase()) {
          case 'GET':
            response = await firstValueFrom(this.httpService.get(route.url, requestConfig));
            break;
          case 'POST':
            response = await firstValueFrom(this.httpService.post(route.url, body, requestConfig));
            break;
          case 'PUT':
            response = await firstValueFrom(this.httpService.put(route.url, body, requestConfig));
            break;
          case 'DELETE':
            response = await firstValueFrom(this.httpService.delete(route.url, requestConfig));
            break;
          case 'PATCH':
            response = await firstValueFrom(this.httpService.patch(route.url, body, requestConfig));
            break;
          default:
            throw new HttpException(`Method ${method} not supported`, HttpStatus.BAD_REQUEST);
        }

        // Cache successful GET responses if caching is enabled for this route
        if (method.toUpperCase() === 'GET' && route.cacheEnabled) {
          const cacheKey = `${method}:${path}:${JSON.stringify(query || {})}`;
          await this.cacheService.set(cacheKey, response.data, route.cacheTtl || 60);
        }

        return response.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          const status = error.response?.status || HttpStatus.BAD_GATEWAY;
          const message = error.response?.data || error.message;
          throw new HttpException(message, status);
        }
        throw new InternalServerErrorException('An unexpected error occurred');
      }
    };

    // Create a fallback function for the circuit breaker
    const fallbackFunction = async () => {
      this.logger.warn(`Circuit for ${serviceId} is open, returning fallback response`);
      
      // If we have a cached response for GET requests, use that as a fallback
      if (method.toUpperCase() === 'GET' && route.cacheEnabled) {
        const cacheKey = `${method}:${path}:${JSON.stringify(query || {})}`;
        const cachedResponse = await this.cacheService.get(cacheKey);
        
        if (cachedResponse) {
          this.logger.log(`Using cached data as fallback for ${serviceId}`);
          return {
            data: cachedResponse,
            _fallback: true,
            _cached: true,
          };
        }
      }
      
      // Default fallback response
      return {
        message: `Service ${route.service} is currently unavailable`,
        _fallback: true,
        timestamp: new Date().toISOString()
      };
    };

    // Use circuit breaker for the request
    this.logger.log(`Using circuit breaker for ${serviceId}`);
    const breaker = this.circuitBreakerService.getCircuitBreaker(
      serviceId,
      executeRequest,
      fallbackFunction
    );

    try {
      return await breaker.fire();
    } catch (error) {
      if (error instanceof HttpException) {
        // Add circuit breaker state to error for better logging
        const customError = error as any;
        customError.circuitBreakerState = breaker.status;
        throw customError;
      }
      
      const unavailableError = new InternalServerErrorException('Service unavailable');
      (unavailableError as any).circuitBreakerState = breaker.status;
      throw unavailableError;
    }
  }

  private filterHeaders(headers: any): any {
    // Filter out headers that should not be forwarded
    const filtered = { ...headers };
    const headersToRemove = [
      'host',
      'connection',
      'content-length',
    ];

    headersToRemove.forEach(header => {
      delete filtered[header];
    });

    return filtered;
  }
}
