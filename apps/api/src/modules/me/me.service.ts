import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeService {
  constructor(private prisma: PrismaService) {}

  // ─── STUDENT "ME" ───────────────────────────────────────────

  async getStudentProfile(userId: number) {
    const student = await this.prisma.student.findFirst({
      where: { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true, avatar: true, role: true } },
      },
    });
    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  async getStudentDashboard(userId: number) {
    const student = await this.getStudentProfile(userId);

    const [groups, todaySchedule, recentGrades, attendanceStats] = await Promise.all([
      this.prisma.groupStudent.count({ where: { studentId: student.id, status: 'ACTIVE' } }),
      this.getStudentTodaySchedule(student.id),
      this.getStudentRecentGrades(student.id, 5),
      this.getStudentAttendanceRate(student.id),
    ]);

    return {
      balance: Number(student.balance),
      coins: student.coins,
      groups,
      attendanceRate: attendanceStats,
      todaySchedule,
      recentGrades,
    };
  }

  async getStudentGroups(userId: number) {
    const student = await this.getStudentProfile(userId);
    return this.prisma.groupStudent.findMany({
      where: { studentId: student.id, status: 'ACTIVE' },
      include: {
        group: {
          include: {
            course: { select: { id: true, name: true } },
            teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            room: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async getStudentSchedule(userId: number) {
    const student = await this.getStudentProfile(userId);
    const enrollments = await this.prisma.groupStudent.findMany({
      where: { studentId: student.id, status: 'ACTIVE' },
      include: {
        group: {
          include: {
            course: { select: { name: true } },
            teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            room: { select: { name: true } },
          },
        },
      },
    });

    return enrollments.map((e) => ({
      groupId: e.group.id,
      groupName: e.group.name,
      course: e.group.course.name,
      teacher: e.group.teacher?.user ? `${e.group.teacher.user.firstName} ${e.group.teacher.user.lastName || ''}`.trim() : '',
      room: e.group.room?.name || '',
      dayType: e.group.dayType,
      customDays: e.group.customDays,
      startTime: e.group.startTime,
      endTime: e.group.endTime,
    }));
  }

  async getStudentGrades(userId: number) {
    const student = await this.getStudentProfile(userId);
    return this.prisma.gradeRecord.findMany({
      where: { studentId: student.id },
      include: {
        group: { select: { id: true, name: true, course: { select: { name: true } } } },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });
  }

  async getStudentAttendance(userId: number) {
    const student = await this.getStudentProfile(userId);
    return this.prisma.attendance.findMany({
      where: { studentId: student.id },
      include: {
        group: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });
  }

  async getStudentPayments(userId: number) {
    const student = await this.getStudentProfile(userId);
    const payments = await this.prisma.payment.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'desc' },
      take: 30,
    });
    return {
      balance: Number(student.balance),
      coins: student.coins,
      payments: payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        method: p.method,
        description: p.description,
        date: p.date,
      })),
    };
  }

  // ─── TEACHER "ME" ──────────────────────────────────────────

  async getTeacherProfile(userId: number) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true, avatar: true, role: true } },
      },
    });
    if (!teacher) throw new NotFoundException('Teacher profile not found');
    return teacher;
  }

  async getTeacherDashboard(userId: number) {
    const teacher = await this.getTeacherProfile(userId);

    const [groups, todaySchedule, avgAttendance] = await Promise.all([
      this.prisma.group.count({ where: { teacherId: teacher.id, status: 'ACTIVE' } }),
      this.getTeacherTodaySchedule(teacher.id),
      this.getTeacherAvgAttendance(teacher.id),
    ]);

    return {
      groups,
      todayLessons: todaySchedule.length,
      avgAttendance,
      todaySchedule,
    };
  }

  async getTeacherGroups(userId: number) {
    const teacher = await this.getTeacherProfile(userId);
    return this.prisma.group.findMany({
      where: { teacherId: teacher.id, status: 'ACTIVE' },
      include: {
        course: { select: { id: true, name: true } },
        room: { select: { id: true, name: true } },
        students: { where: { status: 'ACTIVE' }, select: { id: true } },
      },
    });
  }

  async getTeacherGroupDetail(userId: number, groupId: number) {
    const teacher = await this.getTeacherProfile(userId);
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, teacherId: teacher.id },
      include: {
        course: { select: { name: true, price: true } },
        room: { select: { name: true } },
        students: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              include: { user: { select: { firstName: true, lastName: true, phone: true } } },
            },
          },
        },
      },
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async getTeacherSalary(userId: number, month: number, year: number) {
    const teacher = await this.getTeacherProfile(userId);
    return this.prisma.salary.findMany({
      where: { teacherId: teacher.id, month, year },
      include: {
        teacher: {
          include: {
            groups: {
              where: { status: 'ACTIVE' },
              include: { course: { select: { name: true } }, students: { where: { status: 'ACTIVE' } } },
            },
          },
        },
      },
    });
  }

  // ─── HELPERS ────────────────────────────────────────────────

  private async getStudentTodaySchedule(studentId: number) {
    const enrollments = await this.prisma.groupStudent.findMany({
      where: { studentId, status: 'ACTIVE' },
      include: {
        group: {
          include: {
            course: { select: { name: true } },
            teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            room: { select: { name: true } },
          },
        },
      },
    });
    return enrollments.map((e) => ({
      time: `${e.group.startTime} - ${e.group.endTime}`,
      group: e.group.name,
      teacher: e.group.teacher?.user ? `${e.group.teacher.user.firstName} ${e.group.teacher.user.lastName || ''}`.trim() : '',
      room: e.group.room?.name || '',
    }));
  }

  private async getStudentRecentGrades(studentId: number, limit: number) {
    const grades = await this.prisma.gradeRecord.findMany({
      where: { studentId },
      include: { group: { select: { name: true, course: { select: { name: true } } } } },
      orderBy: { date: 'desc' },
      take: limit,
    });
    return grades.map((g) => ({
      subject: g.group.course.name,
      group: g.group.name,
      grade: g.score,
      max: 100,
      date: g.date.toISOString().slice(0, 10),
    }));
  }

  private async getStudentAttendanceRate(studentId: number): Promise<number> {
    const [total, present] = await Promise.all([
      this.prisma.attendance.count({ where: { studentId } }),
      this.prisma.attendance.count({ where: { studentId, status: 'PRESENT' } }),
    ]);
    return total > 0 ? Math.round((present / total) * 100) : 100;
  }

  private async getTeacherTodaySchedule(teacherId: number) {
    const groups = await this.prisma.group.findMany({
      where: { teacherId, status: 'ACTIVE' },
      include: {
        course: { select: { name: true } },
        room: { select: { name: true } },
        students: { where: { status: 'ACTIVE' }, select: { id: true } },
      },
      orderBy: { startTime: 'asc' },
    });
    return groups.map((g) => ({
      time: `${g.startTime} - ${g.endTime}`,
      group: g.name,
      room: g.room?.name || '',
      students: g.students.length,
    }));
  }

  private async getTeacherAvgAttendance(teacherId: number): Promise<number> {
    const groups = await this.prisma.group.findMany({ where: { teacherId, status: 'ACTIVE' }, select: { id: true } });
    const groupIds = groups.map((g) => g.id);
    if (groupIds.length === 0) return 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [total, present] = await Promise.all([
      this.prisma.attendance.count({ where: { groupId: { in: groupIds }, date: { gte: thirtyDaysAgo } } }),
      this.prisma.attendance.count({ where: { groupId: { in: groupIds }, date: { gte: thirtyDaysAgo }, status: 'PRESENT' } }),
    ]);
    return total > 0 ? Math.round((present / total) * 100) : 0;
  }
}
