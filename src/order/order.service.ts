import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma , OrderStatus } from '@prisma/client';
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

  // User cancel his own order
  async cancelMyOrder(orderId: number, userId: number) {

    // order 
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    // trasnaction
    const cancelled = await this.prisma.$transaction(async (tx) => {
      // order status update
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });
      // stock ফেরত
      for (const item of order.items) {
        const prod = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!prod)
          throw new NotFoundException(`Product ${item.productId} not found`);

        await tx.product.update({
          where: { id: item.productId },
          data: {
            productstock: new Prisma.Decimal(prod.productstock).plus(
              item.quantity,
            ),
          },
        });
      }
      return updated;
    });

    return { success: true, 
             message: 'Order cancelled', 
             data: cancelled };
  }

   // Order cancel by product owner (admin)
   async cancelSellerOrder(orderId: number, sellerId: number) {

    // order search
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { 
            product: true 
          },
        },
      },
    });

    console.log(order?.items);

    if(!order) throw new NotFoundException(`Order ${orderId} not found`);

    const sellerItems = order.items.filter(
      (item) => item.product.userId === sellerId,
    );

    if(sellerItems.length === 0)  throw new ForbiddenException('You are not the seller of this order');
    
    if (order.status !== OrderStatus.PENDING) throw new BadRequestException('Only pending orders can be cancelled');
    
    // ২. ট্রানজ্যাকশন
    const cancelled = await this.prisma.$transaction(async (tx) => {
     
      // order status update
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      // stock ফেরত
      for (const item of sellerItems) {
        const prod = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!prod)
          throw new NotFoundException(`Product ${item.productId} not found`);

        await tx.product.update({
          where: { id: item.productId },
          data: {
            productstock: new Prisma.Decimal(prod.productstock).plus(
              item.quantity,
            ),
          },
        });
      }

      return updated;
    });

    return { success: true, 
             message: 'Order cancelled by seller', 
             data: cancelled };
  
  
  }

}
