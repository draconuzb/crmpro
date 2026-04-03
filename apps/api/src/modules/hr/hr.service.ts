import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateStaffDto, UpdateStaffDto,
  CreateGoalDto, UpdateGoalDto,
  QueryStaffDto, QueryGoalDto,
} from './dto/create-staff.dto';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  // ─── STAFF ──────────────────────────────────────────────────────

  async getStaff(branchId: number, query: QueryStaffDto) {
    const where: any = { branchId };
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { position: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.hrStaff.findMany({ where, orderBy: { createdAt: 'desc' } }),
      this.prisma.hrStaff.count({ where }),
    ]);

    return { data, total };
  }

  async createStaff(branchId: number, dto: CreateStaffDto) {
    return this.prisma.hrStaff.create({
      data: {
        branchId,
        name: dto.name,
        phone: dto.phone,
        category: dto.category,
        position: dto.position,
        subject: dto.subject,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        notes: dto.notes,
      },
    });
  }

  async updateStaff(id: number, dto: UpdateStaffDto) {
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.hrStaff.update({ where: { id }, data });
  }

  async deleteStaff(id: number) {
    return this.prisma.hrStaff.delete({ where: { id } });
  }

  async getStaffStats(branchId: number) {
    const [total, byCategory, byStatus] = await Promise.all([
      this.prisma.hrStaff.count({ where: { branchId } }),
      this.prisma.hrStaff.groupBy({
        by: ['category'],
        where: { branchId },
        _count: true,
      }),
      this.prisma.hrStaff.groupBy({
        by: ['status'],
        where: { branchId },
        _count: true,
      }),
    ]);

    return {
      total,
      byCategory: byCategory.map((c) => ({ category: c.category, count: c._count })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
    };
  }

  // ─── GOALS ──────────────────────────────────────────────────────

  async getGoals(branchId: number, query: QueryGoalDto) {
    const where: any = { branchId };
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;

    return this.prisma.hrGoal.findMany({
      where,
      orderBy: [{ status: 'asc' }, { deadline: 'asc' }],
    });
  }

  async createGoal(branchId: number, dto: CreateGoalDto) {
    return this.prisma.hrGoal.create({
      data: {
        branchId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        subject: dto.subject,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  async updateGoal(id: number, dto: UpdateGoalDto) {
    const data: any = { ...dto };
    if (dto.deadline) data.deadline = new Date(dto.deadline);
    return this.prisma.hrGoal.update({ where: { id }, data });
  }

  async deleteGoal(id: number) {
    return this.prisma.hrGoal.delete({ where: { id } });
  }
}
