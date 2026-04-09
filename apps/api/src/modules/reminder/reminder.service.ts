import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';

@Injectable()
export class ReminderService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: number) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const includeRelations = {
      lead: { select: { id: true, firstName: true, phone: true } },
      student: {
        include: {
          user: { select: { firstName: true, lastName: true, phone: true } },
        },
      },
    };

    const [overdue, today, future] = await Promise.all([
      this.prisma.reminder.findMany({
        where: {
          branchId,
          isCompleted: false,
          dueDate: { lt: todayStart },
        },
        include: includeRelations,
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.reminder.findMany({
        where: {
          branchId,
          isCompleted: false,
          dueDate: { gte: todayStart, lte: todayEnd },
        },
        include: includeRelations,
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.reminder.findMany({
        where: {
          branchId,
          isCompleted: false,
          dueDate: { gt: todayEnd },
        },
        include: includeRelations,
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    const format = (items: any[]) =>
      items.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        dueDate: r.dueDate,
        assignedToId: r.assignedToId,
        lead: r.lead
          ? { id: r.lead.id, firstName: r.lead.firstName, phone: r.lead.phone }
          : null,
        student: r.student
          ? {
              id: r.student.id,
              firstName: r.student.user.firstName,
              lastName: r.student.user.lastName,
              phone: r.student.user.phone,
            }
          : null,
        createdAt: r.createdAt,
      }));

    return {
      overdue: format(overdue),
      today: format(today),
      future: format(future),
    };
  }

  async create(branchId: number, dto: CreateReminderDto, userId: number) {
    return this.prisma.reminder.create({
      data: {
        branchId,
        title: dto.title,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
        leadId: dto.leadId,
        studentId: dto.studentId,
        assignedToId: dto.assignedToId,
        createdById: userId,
      },
    });
  }

  async complete(id: number, note?: string) {
    return this.prisma.reminder.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        completionNote: note,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.reminder.delete({ where: { id } });
  }
}
