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
      include: {
        _count: {
          select: { users: true, students: true, groups: true, leads: true, courses: true },
        },
      },
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

  async getBranchUsers(branchId: number) {
    const userBranches = await this.prisma.userBranch.findMany({
      where: { branchId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, avatar: true },
        },
      },
    });
    return userBranches.map((ub) => ub.user);
  }

  async addUserToBranch(branchId: number, userId: number) {
    await this.findOne(branchId);
    return this.prisma.userBranch.upsert({
      where: { userId_branchId: { userId, branchId } },
      update: {},
      create: { userId, branchId },
    });
  }

  async removeUserFromBranch(branchId: number, userId: number) {
    return this.prisma.userBranch.delete({
      where: { userId_branchId: { userId, branchId } },
    });
  }
}
