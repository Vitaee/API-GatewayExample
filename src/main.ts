import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet  from 'helmet';
import { ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';

async function bootstrap() {
  const logger = WinstonModule.createLogger(winstonConfig);
  
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  
  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3000);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  app.use(helmet());
  app.enableCors();
  
  
  await app.listen(port);
  console.log(`API Gateway is running on: ${await app.getUrl()}`);
}
bootstrap();
