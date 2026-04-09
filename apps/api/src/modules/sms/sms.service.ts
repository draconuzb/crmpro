import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private eskizToken: string | null = null;
  private eskizTokenExpiresAt: number = 0;

  constructor(private prisma: PrismaService) {}

  private async getEskizToken(branchId: number): Promise<string | null> {
    if (this.eskizToken && Date.now() < this.eskizTokenExpiresAt) {
      return this.eskizToken;
    }

    const settings = await this.prisma.smsSettings.findUnique({ where: { branchId } });
    if (!settings?.isActive || !settings?.apiKey) return null;

    try {
      const res = await axios.post('https://notify.eskiz.uz/api/auth/login', {
        email: settings.senderName || '',
        password: settings.apiKey,
      });
      this.eskizToken = res.data?.data?.token ?? null;
      this.eskizTokenExpiresAt = Date.now() + 28 * 24 * 60 * 60 * 1000; // 28 days
      return this.eskizToken;
    } catch (e) {
      this.logger.error('Eskiz auth failed', e);
      return null;
    }
  }

  private async sendViaEskiz(phone: string, message: string, branchId: number): Promise<boolean> {
    let token = await this.getEskizToken(branchId);
    if (!token) return false;

    const normalizedPhone = phone.replace(/\D/g, '').replace(/^998/, '998');
    try {
      await axios.post(
        'https://notify.eskiz.uz/api/message/sms/send',
        { mobile_phone: normalizedPhone, message, from: '4546' },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return true;
    } catch (e: any) {
      // Retry once on 401 (expired token)
      if (e?.response?.status === 401) {
        this.logger.warn('Eskiz token expired, re-authenticating...');
        this.eskizToken = null;
        this.eskizTokenExpiresAt = 0;
        token = await this.getEskizToken(branchId);
        if (!token) return false;
        try {
          await axios.post(
            'https://notify.eskiz.uz/api/message/sms/send',
            { mobile_phone: normalizedPhone, message, from: '4546' },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          return true;
        } catch (retryErr) {
          this.logger.error(`Eskiz retry failed for ${phone}`, retryErr);
          return false;
        }
      }
      this.logger.error(`Eskiz send failed for ${phone}`, e);
      return false;
    }
  }

  async sendSms(studentId: number, message: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: { select: { phone: true } }, branch: { select: { id: true } } },
    });

    const phone = student?.user?.phone ?? '';
    const branchId = student?.branchId ?? 0;

    const sent = await this.sendViaEskiz(phone, message, branchId);

    const record = await this.prisma.smsRecord.create({
      data: {
        studentId,
        phone,
        message,
        status: sent ? 'SENT' : 'FAILED',
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
