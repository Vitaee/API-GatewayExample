import { Injectable } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('users')
export class UsersService {
  private users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  @Public()
  @Get()
  findAll() {
    return this.users;
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    const user = this.users.find(user => user.id === Number(id));
    return user || { message: 'User not found' };
  }

  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'user-service',
      timestamp: new Date().toISOString()
    };
  }
}
