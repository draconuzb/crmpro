import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: number) {
    return this.prisma.room.findMany({
      where: { branchId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async create(branchId: number, dto: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        branchId,
        name: dto.name,
        capacity: dto.capacity,
      },
    });
  }

  async update(id: number, dto: UpdateRoomDto) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    return this.prisma.room.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    return this.prisma.room.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
