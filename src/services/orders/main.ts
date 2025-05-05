import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Logger } from '@nestjs/common';

@Module({
  controllers: [OrdersService],
  providers: [],
})
class OrdersModule {}

async function bootstrap() {
  const logger = new Logger('OrderService');
  const app = await NestFactory.create(OrdersModule);
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  logger.log(`Order service is running on: ${await app.getUrl()}`);
}

bootstrap();
