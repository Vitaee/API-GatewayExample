import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule, ThrottlerOptions } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { TerminusModule } from '@nestjs/terminus';

import { configValidationSchema } from './config/validation.schema';
import { winstonConfig } from './config/winston.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AuthModule } from './auth/auth.module';
import { GatewayModule } from './gateway/gateway.module';
import { HealthModule } from './health/health.module';
import { CacheModule } from './cache/cache.module';
import { UsersService } from './services/users/users.service';
import { ProductsService } from './services/products/products.service';
import { OrdersService } from './services/orders/orders.service';



@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    
    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): Array<ThrottlerOptions> => [{
        ttl: config.get('THROTTLE_TTL', 60),
        limit: config.get('THROTTLE_LIMIT', 100),
      }],
    }),
    
    // Logging
    WinstonModule.forRoot(winstonConfig),
    
    // Health checks
    TerminusModule,
    
    // Feature modules
    AuthModule,
    GatewayModule,
    HealthModule,
    CacheModule,
  ],
  providers: [
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Global rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Mock services
    UsersService,
    ProductsService,
    OrdersService,
  ],
})
export class AppModule {}
