import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Logger } from '@nestjs/common';

@Module({
  controllers: [ProductsService],
  providers: [],
})
class ProductsModule {}

async function bootstrap() {
  const logger = new Logger('ProductService');
  const app = await NestFactory.create(ProductsModule);
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  logger.log(`Product service is running on: ${await app.getUrl()}`);
}

bootstrap();
