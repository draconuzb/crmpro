import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { MarkTeacherAttendanceDto } from './dto/mark-teacher-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async bulkMark(dto: BulkAttendanceDto) {
    const date = new Date(dto.date);

    const results = await this.prisma.$transaction(
      dto.records.map((record) =>
        this.prisma.attendance.upsert({
          where: {
            groupId_studentId_date: {
              groupId: dto.groupId,
              studentId: record.studentId,
              date,
            },
          },
          update: {
            status: record.status as any,
            note: record.note,
          },
          create: {
            groupId: dto.groupId,
            studentId: record.studentId,
            date,
            status: record.status as any,
            note: record.note,
          },
        }),
      ),
    );

    return { message: 'Attendance marked successfully', count: results.length };
  }

  async getReport(branchId: number, query: QueryAttendanceDto) {
    const { page = 1, limit = 20, search, groupId, teacherId, studentId, status, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      group: { branchId },
    };

    if (groupId) where.groupId = groupId;
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    if (teacherId) where.group = { ...where.group, teacherId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (search) {
      where.student = {
        user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
          ],
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, phone: true } },
            },
          },
          group: {
            include: {
              teacher: {
                include: {
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    const items = data.map((a) => ({
      id: a.id,
      studentName: `${a.student.user.firstName} ${a.student.user.lastName}`,
      phone: a.student.user.phone,
      status: a.status,
      groupName: a.group.name,
      teacherName: `${a.group.teacher.user.firstName} ${a.group.teacher.user.lastName}`,
      lessonTime: `${a.group.startTime} - ${a.group.endTime}`,
      date: a.date,
      note: a.note,
    }));

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStudentAttendance(studentId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = await this.prisma.attendance.findMany({
      where: {
        studentId,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        group: { select: { name: true } },
      },
      orderBy: { date: 'asc' },
    });

    return records.map((r) => ({
      id: r.id,
      date: r.date,
      status: r.status,
      groupName: r.group.name,
      note: r.note,
    }));
  }

  async getGroupMonthlyAttendance(groupId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const students = await this.prisma.groupStudent.findMany({
      where: { groupId },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const attendances = await this.prisma.attendance.findMany({
      where: {
        groupId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const attendanceMap = new Map<string, string>();
    for (const a of attendances) {
      const key = `${a.studentId}_${a.date.toISOString().split('T')[0]}`;
      attendanceMap.set(key, a.status);
    }

    const daysInMonth = endDate.getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month - 1, i + 1);
      return d.toISOString().split('T')[0];
    });

    const matrix = students.map((gs) => ({
      studentId: gs.studentId,
      studentName: `${gs.student.user.firstName} ${gs.student.user.lastName}`,
      status: gs.status,
      attendance: dates.reduce(
        (acc, date) => {
          acc[date] = attendanceMap.get(`${gs.studentId}_${date}`) || null;
          return acc;
        },
        {} as Record<string, string | null>,
      ),
    }));

    return { dates, students: matrix };
  }

  // --- Teacher Attendance ---

  async getTeacherAttendance(branchId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const teachers = await this.prisma.teacher.findMany({
      where: {
        user: {
          branches: { some: { branchId } },
        },
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    const attendances = await this.prisma.teacherAttendance.findMany({
      where: {
        teacherId: { in: teachers.map((t) => t.id) },
        date: { gte: startDate, lte: endDate },
      },
    });

    const attendanceMap = new Map<string, { status: string; checkIn: Date | null; checkOut: Date | null }>();
    for (const a of attendances) {
      const key = `${a.teacherId}_${a.date.toISOString().split('T')[0]}`;
      attendanceMap.set(key, { status: a.status, checkIn: a.checkIn, checkOut: a.checkOut });
    }

    const daysInMonth = endDate.getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month - 1, i + 1);
      return d.toISOString().split('T')[0];
    });

    const data = teachers.map((t) => ({
      teacherId: t.id,
      teacherName: `${t.user.firstName} ${t.user.lastName}`,
      attendance: dates.reduce(
        (acc, date) => {
          acc[date] = attendanceMap.get(`${t.id}_${date}`) || null;
          return acc;
        },
        {} as Record<string, { status: string; checkIn: Date | null; checkOut: Date | null } | null>,
      ),
    }));

    return { dates, teachers: data };
  }

  async markTeacherAttendance(dto: MarkTeacherAttendanceDto) {
    const date = new Date(dto.date);

    const result = await this.prisma.teacherAttendance.upsert({
      where: {
        teacherId_date: {
          teacherId: dto.teacherId,
          date,
        },
      },
      update: {
        status: dto.status,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
      },
      create: {
        teacherId: dto.teacherId,
        date,
        status: dto.status,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
      },
    });

    return result;
  }

  async getTeacherWorkSchedule(teacherId: number) {
    return this.prisma.workSchedule.findMany({
      where: { teacherId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }
}
