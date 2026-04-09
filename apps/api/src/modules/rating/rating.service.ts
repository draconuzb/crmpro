import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  async getRatings(
    branchId: number,
    startDate?: string,
    endDate?: string,
    groupId?: number,
  ) {
    const where: any = {
      student: { branchId },
    };

    if (groupId) {
      where.groupId = groupId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const ratings = await this.prisma.rating.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { score: 'desc' },
    });

    // Get group names in a single query
    const groupIds = [...new Set(ratings.map((r) => r.groupId))];
    const groups = await this.prisma.group.findMany({
      where: { id: { in: groupIds } },
      select: { id: true, name: true },
    });
    const groupMap = new Map(groups.map((g) => [g.id, g.name]));

    return ratings.map((r) => ({
      id: r.id,
      studentName: `${r.student.user.firstName} ${r.student.user.lastName || ''}`.trim(),
      studentId: r.studentId,
      groupId: r.groupId,
      groupName: groupMap.get(r.groupId) || '',
      score: Number(r.score),
      period: r.period,
      createdAt: r.createdAt,
    }));
  }

  async getChartData(branchId: number, startDate?: string, endDate?: string) {
    const where: any = {
      student: { branchId },
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const ratings = await this.prisma.rating.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { score: 'desc' },
      take: 20,
    });

    return ratings.map((r) => ({
      studentName: `${r.student.user.firstName} ${r.student.user.lastName || ''}`.trim(),
      score: Number(r.score),
      period: r.period,
    }));
  }
}
