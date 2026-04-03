import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async create(dto: CreateBranchDto) {
    return this.prisma.branch.create({ data: dto });
  }

  async update(id: number, dto: UpdateBranchDto) {
    await this.findOne(id);
    return this.prisma.branch.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.branch.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getBranchesForUser(userId: number) {
    const userBranches = await this.prisma.userBranch.findMany({
      where: { userId },
      include: { branch: true },
    });
    return userBranches.map((ub) => ub.branch);
  }
}
