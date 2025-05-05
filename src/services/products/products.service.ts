import { Public } from '../../auth/decorators/public.decorator';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('products')
export class ProductsService {
  private products = [
    { id: 1, name: 'Laptop', price: 999.99 },
    { id: 2, name: 'Smartphone', price: 699.99 },
    { id: 3, name: 'Headphones', price: 149.99 },
  ];

  @Public()
  @Get()
  findAll() {
    return this.products;
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    const product = this.products.find(product => product.id === Number(id));
    return product || { message: 'Product not found' };
  }

  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'product-service',
      timestamp: new Date().toISOString()
    };
  }
}
