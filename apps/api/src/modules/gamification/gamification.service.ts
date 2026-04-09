import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  // ─── PRODUCTS ──────────────────────────────────────────────────────

  async getProducts(branchId: number) {
    return this.prisma.product.findMany({
      where: { branchId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(branchId: number, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        branchId,
        name: dto.name,
        description: dto.description,
        image: dto.image,
        coinPrice: dto.coinPrice,
        stock: dto.stock,
      },
    });
  }

  async updateProduct(id: number, dto: Partial<CreateProductDto>) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.image !== undefined && { image: dto.image }),
        ...(dto.coinPrice !== undefined && { coinPrice: dto.coinPrice }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
      },
    });
  }

  async deleteProduct(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ─── ORDERS ────────────────────────────────────────────────────────

  async getOrders(
    branchId: number,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { branchId };

    if (status) where.status = status;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.student = {
        user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    // Fetch product names for the orders
    const productIds = [...new Set(data.map((o) => o.productId))];
    const products = productIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true },
        })
      : [];
    const productMap = new Map(products.map((p) => [p.id, p.name]));

    const enriched = data.map((order) => ({
      ...order,
      productName: productMap.get(order.productId) ?? 'Unknown',
    }));

    return {
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createOrder(branchId: number, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({ where: { id: dto.studentId } });
      if (!student) throw new NotFoundException('Student not found');

      const product = await tx.product.findUnique({ where: { id: dto.productId } });
      if (!product || !product.isActive) throw new NotFoundException('Product not found');

      if (student.coins < product.coinPrice) {
        throw new BadRequestException('Student does not have enough coins');
      }
      if (product.stock <= 0) {
        throw new BadRequestException('Product is out of stock');
      }

      // Atomic: deduct coins + decrement stock + create order
      await tx.student.update({
        where: { id: dto.studentId },
        data: { coins: { decrement: product.coinPrice } },
      });
      await tx.product.update({
        where: { id: dto.productId },
        data: { stock: { decrement: 1 } },
      });

      const order = await tx.order.create({
        data: {
          branchId,
          studentId: dto.studentId,
          productId: dto.productId,
          coinAmount: product.coinPrice,
          status: 'PENDING',
        },
        include: {
          student: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      });

      return { ...order, productName: product.name };
    });
  }

  async updateOrderStatus(id: number, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    if (!['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    // If cancelling, refund coins and restore stock
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await Promise.all([
        this.prisma.student.update({
          where: { id: order.studentId },
          data: { coins: { increment: order.coinAmount } },
        }),
        this.prisma.product.update({
          where: { id: order.productId },
          data: { stock: { increment: 1 } },
        }),
      ]);
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        student: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }
}
