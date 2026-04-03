import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VoipService {
  constructor(private prisma: PrismaService) {}

  async getCalls(
    branchId: number,
    query: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      direction?: string;
      studentId?: number;
    },
  ) {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      direction,
      studentId,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      student: { branchId },
    };

    if (startDate || endDate) {
      where.calledAt = {};
      if (startDate) where.calledAt.gte = new Date(startDate);
      if (endDate) where.calledAt.lte = new Date(endDate);
    }

    if (direction) where.direction = direction;
    if (studentId) where.studentId = studentId;

    const [data, total] = await Promise.all([
      this.prisma.callRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { calledAt: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, phone: true } },
            },
          },
        },
      }),
      this.prisma.callRecord.count({ where }),
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

  async createCall(data: {
    studentId: number;
    phone: string;
    direction: string;
    duration?: number;
    recordingUrl?: string;
  }) {
    return this.prisma.callRecord.create({
      data: {
        studentId: data.studentId,
        phone: data.phone,
        direction: data.direction,
        duration: data.duration ?? null,
        recordingUrl: data.recordingUrl ?? null,
      },
      include: {
        student: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, phone: true } },
          },
        },
      },
    });
  }
}
