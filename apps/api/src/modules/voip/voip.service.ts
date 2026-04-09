import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class VoipService {
  private readonly logger = new Logger(VoipService.name);

  constructor(private prisma: PrismaService) {}

  async initiateCall(branchId: number, studentId: number, operatorExt: string) {
    const settings = await this.prisma.voipSettings.findUnique({ where: { branchId } });
    if (!settings?.isActive || !settings?.apiKey || !settings?.sipDomain) {
      return { success: false, error: 'VoIP not configured for this branch' };
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: { select: { phone: true, firstName: true, lastName: true } } },
    });
    if (!student?.user?.phone) {
      return { success: false, error: 'Student phone not found' };
    }

    const phone = student.user.phone.replace(/\D/g, '');

    try {
      await axios.post(
        `https://${settings.sipDomain}/api/v1/calls/originate`,
        { extension: operatorExt, destination: phone, callerId: operatorExt },
        { headers: { Authorization: `Bearer ${settings.apiKey}` } },
      );

      const record = await this.prisma.callRecord.create({
        data: {
          studentId,
          phone: student.user.phone,
          direction: 'outbound',
        },
        include: {
          student: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, phone: true } },
            },
          },
        },
      });

      return { success: true, record };
    } catch (e) {
      this.logger.error(`VoIP call failed for ${phone}`, e);
      return { success: false, error: 'Failed to initiate call' };
    }
  }

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
