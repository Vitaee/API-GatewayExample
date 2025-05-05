import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('orders')
export class OrdersService {
  private orders = [
    { 
      id: 1, 
      userId: 1, 
      products: [
        { productId: 1, quantity: 2 },
        { productId: 3, quantity: 1 }
      ],
      total: 2149.97,
      status: 'completed'
    },
    { 
      id: 2, 
      userId: 2, 
      products: [
        { productId: 2, quantity: 1 }
      ],
      total: 699.99,
      status: 'processing'
    },
    { 
      id: 3, 
      userId: 1, 
      products: [
        { productId: 3, quantity: 2 }
      ],
      total: 299.98,
      status: 'pending'
    },
  ];

  @Get()
  findAll() {
    return this.orders;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const order = this.orders.find(order => order.id === Number(id));
    return order || { message: 'Order not found' };
  }

  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'order-service',
      timestamp: new Date().toISOString()
    };
  }
}
