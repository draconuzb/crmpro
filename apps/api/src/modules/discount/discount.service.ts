import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}

  async getByGroup(groupId: number) {
    return this.prisma.discount.findMany({
      where: { groupId },
      orderBy: { id: 'desc' },
    });
  }

  async getAll(branchId: number) {
    return this.prisma.discount.findMany({
      where: { group: { branchId } },
      include: {
        group: { select: { id: true, name: true, course: { select: { name: true } } } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async create(groupId: number, data: { name: string; percentage?: number; fixedAmount?: number }) {
    return this.prisma.discount.create({
      data: {
        groupId,
        name: data.name,
        percentage: data.percentage ?? null,
        fixedAmount: data.fixedAmount ?? null,
      },
    });
  }

  async update(id: number, data: { name?: string; percentage?: number; fixedAmount?: number; isActive?: boolean }) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) throw new NotFoundException('Discount not found');

    return this.prisma.discount.update({ where: { id }, data: data as any });
  }

  async remove(id: number) {
    return this.prisma.discount.delete({ where: { id } });
  }
}
