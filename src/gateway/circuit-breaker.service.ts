import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CircuitBreaker from 'opossum';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly breakers = new Map<string, CircuitBreaker>();

  constructor(private readonly configService: ConfigService) {}

  getCircuitBreaker(serviceIdentifier: string, serviceFunction: any, fallbackFunction?: any): CircuitBreaker {
    const breakerId = `${serviceIdentifier}`;
    this.logger.log(`Creating circuit breaker for: ${breakerId}`);

    
    if (!this.breakers.has(breakerId)) {
      const options = {
        timeout: this.configService.get('CIRCUIT_BREAKER_TIMEOUT', 3000), // milliseconds
        resetTimeout: this.configService.get('CIRCUIT_BREAKER_RESET_TIMEOUT', 30000), // milliseconds
        errorThresholdPercentage: this.configService.get('CIRCUIT_BREAKER_ERROR_THRESHOLD', 50), // percentage
      };

      const breaker = new CircuitBreaker(serviceFunction, options);

      // Add listeners for events
      breaker.on('open', () => {
        this.logger.warn(`Circuit breaker opened for: ${breakerId}`);
      });

      breaker.on('close', () => {
        this.logger.log(`Circuit breaker closed for: ${breakerId}`);
      });

      breaker.on('halfOpen', () => {
        this.logger.log(`Circuit breaker half-open for: ${breakerId}`);
      });

      breaker.on('fallback', (result) => {
        this.logger.warn(`Circuit breaker fallback for: ${breakerId}`);
      });
      
      if (fallbackFunction) {
        breaker.fallback(fallbackFunction);
      }
      
      this.breakers.set(breakerId, breaker);
    } else {
      const breaker = this.breakers.get(breakerId);

      if (fallbackFunction && breaker) {
        breaker.fallback(fallbackFunction);
      }
    }

    return this.breakers.get(breakerId) as CircuitBreaker;
  }

  removeCircuitBreaker(serviceIdentifier: string): boolean {
    return this.breakers.delete(serviceIdentifier);
  }

  getStatus(serviceIdentifier: string): string {
    const breaker = this.breakers.get(serviceIdentifier);

    if (!breaker) {
      return 'UNKNOWN';
    }

    return breaker.enabled ? 'ENABLED' : 'DISABLED';
  }

  getAllStatuses(): Record<string, string> {
    const statuses: Record<string, string> = {};
    
    this.breakers.forEach((breaker, serviceIdentifier) => {
      statuses[serviceIdentifier] = breaker.enabled ? 'ENABLED' : 'DISABLED';
    });

    return statuses;
  }
}
