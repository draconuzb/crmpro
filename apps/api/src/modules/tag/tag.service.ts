import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: number) {
    return this.prisma.tag.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(branchId: number, dto: CreateTagDto) {
    return this.prisma.tag.create({
      data: {
        branchId,
        name: dto.name,
        color: dto.color,
      },
    });
  }

  async update(id: number, dto: UpdateTagDto) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return this.prisma.tag.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return this.prisma.tag.delete({ where: { id } });
  }
}
