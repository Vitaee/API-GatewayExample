import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { APP_GUARD } from '@nestjs/core';

import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { RouteService } from './route.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    
    AuthModule,
    CacheModule,
  ],
  controllers: [GatewayController],
  providers: [
    GatewayService, 
    RouteService,
    CircuitBreakerService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class GatewayModule {}
