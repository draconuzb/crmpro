import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async getSchedule(branchId: number, dayType?: string) {
    const where: any = {
      branchId,
      status: 'ACTIVE',
    };

    if (dayType) {
      where.dayType = dayType;
    }

    const groups = await this.prisma.group.findMany({
      where,
      include: {
        course: { select: { name: true } },
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        room: { select: { id: true, name: true } },
        _count: { select: { students: true } },
      },
      orderBy: [{ startTime: 'asc' }],
    });

    const courseColors = new Map<number, string>();
    const palette = [
      '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
      '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb',
    ];
    let colorIndex = 0;

    const items = groups.map((g) => {
      if (!courseColors.has(g.courseId)) {
        courseColors.set(g.courseId, palette[colorIndex % palette.length]);
        colorIndex++;
      }

      return {
        id: g.id,
        name: g.name,
        courseName: g.course.name,
        teacherName: `${g.teacher.user.firstName} ${g.teacher.user.lastName}`,
        roomName: g.room?.name || null,
        roomId: g.room?.id || null,
        dayType: g.dayType,
        startTime: g.startTime,
        endTime: g.endTime,
        studentsCount: g._count.students,
        color: courseColors.get(g.courseId)!,
      };
    });

    // Group by room for calendar grid
    const rooms = await this.prisma.room.findMany({
      where: { branchId, isActive: true },
      orderBy: { name: 'asc' },
    });

    const grid = rooms.map((room) => ({
      roomId: room.id,
      roomName: room.name,
      groups: items.filter((i) => i.roomId === room.id),
    }));

    // Add unassigned room groups
    const unassigned = items.filter((i) => !i.roomId);
    if (unassigned.length > 0) {
      grid.push({
        roomId: 0,
        roomName: 'No Room',
        groups: unassigned,
      });
    }

    return { items, grid };
  }
}
