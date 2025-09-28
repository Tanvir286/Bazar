import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // create order
  async create(dto: CreateOrderDto, userId: number) {
    
    let totalAmount = new Prisma.Decimal(0);

    // all items
    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      // Decimal থেকে number এ কনভার্ট করে কম্পেয়ার
      const stock = product.productstock.toNumber();
      if (stock < item.quantity) {
        throw new BadRequestException(
          `Product ${product.producttitle}-have insufficient stock (requested ${item.quantity}, available ${stock})`,
        );
      }

      // মোট দাম যোগ করা
      totalAmount = totalAmount.plus(
        new Prisma.Decimal(product.productprice).mul(item.quantity),
      );
    }

    // সবকিছু ঠিক থাকলে একসাথে Order + OrderItem তৈরি
    const order = await this.prisma.$transaction(async (tx) => {
      // Order তৈরি
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: 'PENDING', 
        },
      });

      // প্রতিটি আইটেম Insert করা ও স্টক আপডেট
      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} পাওয়া যায়নি`);
        }

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.productprice,
          },
        });

        // স্টক কমানো
        await tx.product.update({
          where: { id: item.productId },
          data: {
            productstock: new Prisma.Decimal(product.productstock).minus(
              item.quantity,
            ),
          },
        });
      }

      return newOrder;
    });

    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    };
  }

  // get all order of logged-in user
  async getMyOrders(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true, 
          },
        },
      },
      orderBy: { createdAt: 'desc' }, 
    });

    return {
      success: true,
      data: orders,
    };
  }

  // get single order of logged-in user
  async getMyOrderById(orderId: number, userId: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return {
      success: true,
      data: order,
    };
  }

  

}
