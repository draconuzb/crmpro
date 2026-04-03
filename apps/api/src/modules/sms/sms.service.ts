import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SmsService {
  constructor(private prisma: PrismaService) {}

  async sendSms(studentId: number, message: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: { select: { phone: true } } },
    });

    const phone = student?.user?.phone ?? '';

    // TODO: integrate with actual SMS provider (Eskiz, PlayMobile, etc.)

    const record = await this.prisma.smsRecord.create({
      data: {
        studentId,
        phone,
        message,
        status: 'SENT',
      },
      include: {
        student: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, phone: true } },
          },
        },
      },
    });

    return record;
  }

  async getHistory(
    branchId: number,
    query: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      studentId?: number;
    },
  ) {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      studentId,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      student: { branchId },
    };

    if (startDate || endDate) {
      where.sentAt = {};
      if (startDate) where.sentAt.gte = new Date(startDate);
      if (endDate) where.sentAt.lte = new Date(endDate);
    }

    if (studentId) where.studentId = studentId;

    const [data, total] = await Promise.all([
      this.prisma.smsRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sentAt: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, phone: true } },
            },
          },
        },
      }),
      this.prisma.smsRecord.count({ where }),
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

  async bulkSend(studentIds: number[], message: string) {
    const results = await Promise.all(
      studentIds.map((id) => this.sendSms(id, message)),
    );
    return { sent: results.length, records: results };
  }
}
