import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderStripeDto } from './dto/createstripe-order.dto';
import { Prisma, OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // ✅ Stripe order create (items নেই, শুধু price/description)
  async createStripeOrder(dto: CreateOrderStripeDto) {
    const order = await this.prisma.order.create({
      data: {
        userId: Number(dto.user_id),
        totalAmount: new Prisma.Decimal(dto.price),
        status: 'PENDING',
      },
    });

    return order;
  }

  // ✅ Update Order Status
  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  // ✅ create normal order with items
  async create(dto: CreateOrderDto, userId: number) {
    let totalAmount = new Prisma.Decimal(0);

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

      const stock = product.productstock.toNumber();
      if (stock < item.quantity) {
        throw new BadRequestException(
          `Product ${product.producttitle} has insufficient stock (requested ${item.quantity}, available ${stock})`,
        );
      }

      totalAmount = totalAmount.plus(
        new Prisma.Decimal(product.productprice).mul(item.quantity),
      );
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: 'PENDING',
        },
      });

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.productprice,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            productstock: new Prisma.Decimal(product.productstock).minus(item.quantity),
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

  // ✅ Get my all orders
  async getMyOrders(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: orders };
  }

  // ✅ Get single order
  async getMyOrderById(orderId: number, userId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    return { success: true, data: order };
  }

  // ✅ Cancel my order
  async cancelMyOrder(orderId: number, userId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    const cancelled = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      for (const item of order.items) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (!prod) throw new NotFoundException(`Product ${item.productId} not found`);

        await tx.product.update({
          where: { id: item.productId },
          data: {
            productstock: new Prisma.Decimal(prod.productstock).plus(item.quantity),
          },
        });
      }

      return updated;
    });

    return { success: true, message: 'Order cancelled', data: cancelled };
  }

  // ✅ Cancel by Seller
  async cancelSellerOrder(orderId: number, sellerId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const sellerItems = order.items.filter(
      (item) => item.product.userId === sellerId,
    );
    if (sellerItems.length === 0) {
      throw new ForbiddenException('You are not the seller of this order');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    const cancelled = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      for (const item of sellerItems) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (!prod) throw new NotFoundException(`Product ${item.productId} not found`);

        await tx.product.update({
          where: { id: item.productId },
          data: {
            productstock: new Prisma.Decimal(prod.productstock).plus(item.quantity),
          },
        });
      }

      return updated;
    });

    return { success: true, message: 'Order cancelled by seller', data: cancelled };
  }
}
