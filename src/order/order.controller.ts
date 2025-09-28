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
  findAll(@Req() req) {
    const userId = req.user.userId;
    return this.orderService.getMyOrders(userId);
  }

  // get single order of logged-in user
  @UseGuards(JwtAuthGuard)
  @Get('my-orders/:id')
  findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    return this.orderService.getMyOrderById(+id, userId);
  }




}

