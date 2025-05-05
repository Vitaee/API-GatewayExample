import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { Logger } from '@nestjs/common';

@Module({
  controllers: [UsersService],
  providers: [],
})
class UsersModule {}

async function bootstrap() {
  const logger = new Logger('UserService');
  const app = await NestFactory.create(UsersModule);
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  logger.log(`User service is running on: ${await app.getUrl()}`);
}

bootstrap();
