import { Controller, Post, Body, Req, Res, Headers, BadRequestException } from '@nestjs/common';
import type { Request, Response } from 'express'; // ✅ type-only import
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { OrderService } from 'src/order/order.service';
import { OrderStatus } from '@prisma/client';

@Controller('stripe')
export class StripeController {

  private stripe: Stripe;

  constructor(
    private stripeService: StripeService,
    private orderService: OrderService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  // ✅ Checkout session
  @Post('checkout')
  async createCheckout(
    @Body() body: { orderId: number; amount: number; email: string }) {
    const session = await this.stripeService.createCheckoutSession(
      body.orderId,
      body.amount,
      body.email,
    );
    return { url: session.url };
  }

  // ✅ Webhook
  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        (req as any).rawBody, 
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook error: ${(err as Error).message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = Number(session.client_reference_id);

      await this.orderService.updateOrderStatus(orderId, OrderStatus.PAID);
    }

    res.json({ received: true });
  }
}
