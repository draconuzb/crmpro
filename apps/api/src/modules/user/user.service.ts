import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: number, query: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy, sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      branches: {
        some: { branchId },
      },
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          gender: true,
          avatar: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        branches: {
          include: { branch: true },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { password, ...result } = user;
    return result;
  }

  async create(dto: CreateUserDto, branchId: number) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        password: hashedPassword,
        role: dto.role,
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        branches: {
          create: { branchId },
        },
      },
      include: {
        branches: {
          include: { branch: true },
        },
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
