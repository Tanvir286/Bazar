import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { OrderModule } from 'src/order/order.module';
import { Prisma } from '@prisma/client';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    OrderModule
  ],
  controllers: [StripeController],
  providers: [StripeService]
})
export class StripeModule {}

