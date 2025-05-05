import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RouteDefinition {
  service: string;
  url: string;
  cacheEnabled?: boolean;
  cacheTtl?: number;
  rateLimit?: {
    ttl: number;
    limit: number;
  };
}

@Injectable()
export class RouteService {
  private routes: Map<string, RouteDefinition>;

  constructor(private readonly configService: ConfigService) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');
    const productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL');
    const orderServiceUrl = this.configService.get<string>('ORDER_SERVICE_URL');
    
    this.routes = new Map<string, RouteDefinition>([
      // User service routes
      [
        '/users',
        {
          service: 'user-service',
          url: `${userServiceUrl}/users`,
          cacheEnabled: true,
          cacheTtl: 60, // 60 seconds
        },
      ],
      [
        '/users/:id',
        {
          service: 'user-service',
          url: `${userServiceUrl}/users/:id`,
          cacheEnabled: true,
          cacheTtl: 60,
        },
      ],
      
      // Product service routes
      [
        '/products',
        {
          service: 'product-service',
          url: `${productServiceUrl}/products`,
          cacheEnabled: true,
          cacheTtl: 300, // 5 minutes
        },
      ],
      [
        '/products/:id',
        {
          service: 'product-service',
          url: `${productServiceUrl}/products/:id`,
          cacheEnabled: true,
          cacheTtl: 300,
        },
      ],
      
      // Order service routes
      [
        '/orders',
        {
          service: 'order-service',
          url: `${orderServiceUrl}/orders`,
          rateLimit: {
            ttl: 60,
            limit: 10, // More restrictive rate limit for orders
          },
        },
      ],
      [
        '/orders/:id',
        {
          service: 'order-service',
          url: `${orderServiceUrl}/orders/:id`,
        },
      ],
    ]);
  }

  getRoute(path: string): RouteDefinition | undefined {
    // First try for exact matches
    if (this.routes.has(path)) {
      return this.routes.get(path);
    }

    // Then check for parameterized routes
    const pathSegments = path.split('/').filter(Boolean);
    
    for (const [routePath, routeDefinition] of this.routes.entries()) {
      const routeSegments = routePath.split('/').filter(Boolean);
      
      if (pathSegments.length !== routeSegments.length) {
        continue;
      }
      
      let isMatch = true;
      const params: Record<string, string> = {};
      
      for (let i = 0; i < routeSegments.length; i++) {
        if (routeSegments[i].startsWith(':')) {
          // This is a parameter
          const paramName = routeSegments[i].substring(1);
          params[paramName] = pathSegments[i];
        } else if (routeSegments[i] !== pathSegments[i]) {
          // Not a match
          isMatch = false;
          break;
        }
      }
      
      if (isMatch) {
        let targetUrl = routeDefinition.url;
        
        // Replace parameters in the target URL
        Object.entries(params).forEach(([key, value]) => {
          targetUrl = targetUrl.replace(`:${key}`, value);
        });
        
        return {
          ...routeDefinition,
          url: targetUrl,
        };
      }
    }
    
    return undefined;
  }

  getAllRoutes(): Map<string, RouteDefinition> {
    return this.routes;
  }

  addRoute(path: string, definition: RouteDefinition): void {
    this.routes.set(path, definition);
  }

  removeRoute(path: string): void {
    this.routes.delete(path);
  }
}
