import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('order')
export class OrderController {

  constructor(private readonly orderService: OrderService) {}

  // create order
  @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    const userId = req.user.userId;
    return this.orderService.create(createOrderDto, userId);
  }

  // get all order of logged-in user
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  findAll(@Req() req: any) {
    const userId = req.user.userId;
    return this.orderService.getMyOrders(userId);
  }

  // get single order of logged-in user
  @UseGuards(JwtAuthGuard)
  @Get('my-orders/:id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.orderService.getMyOrderById(+id, userId);
  }

  // User cancel his own order
  @UseGuards(JwtAuthGuard)
  @Patch('cancel/:id')
  cancelOrder(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.orderService.cancelMyOrder(+id, userId);
  }

  // Order cancel by product owner (admin)
  @UseGuards(JwtAuthGuard)
  @Patch('seller-cancel/:id')
  cancelSellerOrder(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.orderService.cancelSellerOrder(+id, userId);
  }


}

