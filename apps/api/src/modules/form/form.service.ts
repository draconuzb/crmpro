import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto } from './dto/create-form.dto';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: number) {
    return this.prisma.form.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) throw new NotFoundException('Form not found');
    return form;
  }

  async create(branchId: number, dto: CreateFormDto) {
    return this.prisma.form.create({
      data: {
        branchId,
        title: dto.title,
        fields: dto.fields,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: number, dto: Partial<CreateFormDto>) {
    return this.prisma.form.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.fields !== undefined && { fields: dto.fields }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async delete(id: number) {
    return this.prisma.form.delete({ where: { id } });
  }
}
