import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';

@Injectable()
export class HolidayService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: number) {
    return this.prisma.holiday.findMany({
      where: { branchId },
      orderBy: { date: 'asc' },
    });
  }

  async create(branchId: number, dto: CreateHolidayDto) {
    return this.prisma.holiday.create({
      data: {
        branchId,
        name: dto.name,
        date: new Date(dto.date),
      },
    });
  }

  async update(id: number, dto: Partial<CreateHolidayDto>) {
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    return this.prisma.holiday.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.holiday.delete({ where: { id } });
  }
}
