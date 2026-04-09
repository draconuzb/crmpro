import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnlineLessonService {
  constructor(private prisma: PrismaService) {}

  async getByGroup(groupId: number) {
    return this.prisma.onlineLesson.findMany({
      where: { groupId },
      orderBy: { date: 'desc' },
    });
  }

  async getUpcoming(branchId: number) {
    const now = new Date();
    return this.prisma.onlineLesson.findMany({
      where: {
        group: { branchId },
        date: { gte: now },
      },
      include: {
        group: {
          select: { id: true, name: true, course: { select: { name: true } }, teacher: { select: { user: { select: { firstName: true, lastName: true } } } } },
        },
      },
      orderBy: { date: 'asc' },
      take: 50,
    });
  }

  async create(groupId: number, data: { title: string; url: string; date: string }) {
    return this.prisma.onlineLesson.create({
      data: {
        groupId,
        title: data.title,
        url: data.url,
        date: new Date(data.date),
      },
    });
  }

  async update(id: number, data: { title?: string; url?: string; date?: string }) {
    const lesson = await this.prisma.onlineLesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException('Online lesson not found');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.date !== undefined) updateData.date = new Date(data.date);

    return this.prisma.onlineLesson.update({ where: { id }, data: updateData });
  }

  async remove(id: number) {
    return this.prisma.onlineLesson.delete({ where: { id } });
  }
}
