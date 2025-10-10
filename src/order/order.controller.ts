import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateOrderStripeDto } from './dto/createstripe-order.dto';
import { Request } from 'express';
import Stripe from 'stripe';

@Controller('order')
export class OrderController {
  private stripe: Stripe;

  constructor(private readonly orderService: OrderService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-08-27.basil', // ✅ updated to required apiVersion
    });
  }

  // ✅ Stripe Checkout Session তৈরি
  @Post('stripe')
  async createStripeOrder(@Body() dto: CreateOrderStripeDto) {
    // Order শুধু Stripe এর জন্য DB তে আলাদা create করা হলো
    const order = await this.orderService.createStripeOrder(dto);

    // Stripe checkout session create
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'E-commerce Order',
              description: dto.description,
            },
            unit_amount: Math.round(dto.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: dto.urlSuccess,
      cancel_url: dto.urlCancel,
      customer_email: dto.email,
      client_reference_id: order.id.toString(), // ✅ orderId পাঠানো হলো
    });

    return {
      success: true,
      message: 'Stripe order created successfully',
      data: session,
    };
  }

  // ✅ Stripe Webhook
  @Post('/stripe/webhook')
  async handleStripeWebhook(
    @Req() req: any,
    @Headers('stripe-signature') sig: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body, // raw body হতে হবে
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.client_reference_id;
        if (orderId) {
          await this.orderService.updateOrderStatus(
            Number(orderId),
            'PAID',
          );
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        console.log('✅ PaymentIntent succeeded:', intent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  // ✅ Normal Order Create (with items)
  @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    const userId = req.user.userId;
    return this.orderService.create(createOrderDto, userId);
  }

  // ✅ get all order of logged-in user
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  findAll(@Req() req: any) {
    const userId = req.user.userId;
    return this.orderService.getMyOrders(userId);
  }

  // ✅ get single order of logged-in user
  @UseGuards(JwtAuthGuard)
  @Get('my-orders/:id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.orderService.getMyOrderById(+id, userId);
  }

  // ✅ User cancel his own order
  @UseGuards(JwtAuthGuard)
  @Patch('cancel/:id')
  cancelOrder(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.orderService.cancelMyOrder(+id, userId);
  }

  // ✅ Seller cancel order
  @UseGuards(JwtAuthGuard)
  @Patch('seller-cancel/:id')
  cancelSellerOrder(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.orderService.cancelSellerOrder(+id, userId);
  }
}
