import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../auth/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');
    const productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL');
    const orderServiceUrl = this.configService.get<string>('ORDER_SERVICE_URL');

    return this.health.check([
      // Memory health check
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024), // 300MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
      
      // Disk health check
      () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
      
      // Service health checks - Fix paths to match actual endpoints
      () => this.http.pingCheck('user-service', `${userServiceUrl}/users/health`),
      () => this.http.pingCheck('product-service', `${productServiceUrl}/products/health`),
      () => this.http.pingCheck('order-service', `${orderServiceUrl}/orders/health`),
    ]);
  }

  @Public()
  @Get('liveness')
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }

  @Public()
  @Get('readiness')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }
}
