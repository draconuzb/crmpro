import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProblemDto, UpdateProblemDto, QueryProblemDto } from './dto/create-problem.dto';

@Injectable()
export class ProblemService {
  constructor(private prisma: PrismaService) {}

  async getProblems(branchId: number, query: QueryProblemDto) {
    const where: any = { branchId };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.search) {
      where.issue = { contains: query.search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.problem.findMany({ where, orderBy: { createdAt: 'desc' } }),
      this.prisma.problem.count({ where }),
    ]);

    return { data, total };
  }

  async createProblem(branchId: number, dto: CreateProblemDto, userId?: number) {
    return this.prisma.problem.create({
      data: {
        branchId,
        type: dto.type,
        issue: dto.issue,
        reportedBy: userId,
      },
    });
  }

  async updateProblem(id: number, dto: UpdateProblemDto) {
    return this.prisma.problem.update({ where: { id }, data: dto });
  }

  async deleteProblem(id: number) {
    return this.prisma.problem.delete({ where: { id } });
  }

  async getStats(branchId: number) {
    const [byStatus, byType] = await Promise.all([
      this.prisma.problem.groupBy({
        by: ['status'],
        where: { branchId },
        _count: true,
      }),
      this.prisma.problem.groupBy({
        by: ['type'],
        where: { branchId },
        _count: true,
      }),
    ]);

    return {
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byType: byType.map((t) => ({ type: t.type, count: t._count })),
    };
  }
}
