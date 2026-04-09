import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonPaymentService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════
  // DAILY AUTO-DEDUCTION (called by cron)
  // ═══════════════════════════════════════════

  async runDailyDeduction(today?: Date) {
    const date = today || new Date();
    date.setHours(0, 0, 0, 0);

    // Check day of week: 1=Mon,2=Tue,...6=Sat,0=Sun
    const dow = date.getDay();
    const oddDays = [1, 3, 5]; // Mon, Wed, Fri
    const evenDays = [2, 4, 6]; // Tue, Thu, Sat

    // Get all active groups (not archived) with their course price + teacher salary settings
    const groups = await this.prisma.group.findMany({
      where: { status: 'ACTIVE' },  // GroupStatus.ACTIVE excludes ARCHIVED and COMPLETED
      include: {
        course: { select: { price: true } },
        teacher: { select: { salaryType: true, salaryAmount: true } },
        students: {
          where: { status: 'ACTIVE', student: { isArchived: false } },
          select: { studentId: true },
        },
      },
    });

    let totalDeductions = 0;
    let totalStudents = 0;
    const results: any[] = [];

    for (const group of groups) {
      // Check if today is a holiday for this group's branch
      const holiday = await this.prisma.holiday.findFirst({
        where: { date, branchId: group.branchId },
      });
      if (holiday) continue; // skip this group's branch holiday

      // Check if today is a lesson day for this group
      const isLessonDay =
        (group.dayType === 'ODD' && oddDays.includes(dow)) ||
        (group.dayType === 'EVEN' && evenDays.includes(dow)) ||
        (group.dayType === 'OTHER'); // OTHER = every day (or custom — simplified)

      if (!isLessonDay) continue;

      const coursePrice = Number(group.course.price);
      // Calculate actual lesson days this month based on day type
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      let lessonsPerMonth = 0;
      const iterDate = new Date(monthStart);
      while (iterDate <= monthEnd) {
        const dw = iterDate.getDay();
        if (group.dayType === 'ODD' && oddDays.includes(dw)) lessonsPerMonth++;
        else if (group.dayType === 'EVEN' && evenDays.includes(dw)) lessonsPerMonth++;
        else if (group.dayType === 'OTHER' && dw >= 1 && dw <= 6) lessonsPerMonth++;
        iterDate.setDate(iterDate.getDate() + 1);
      }
      if (lessonsPerMonth === 0) continue; // No lessons this month
      const perLessonCost = Math.round(coursePrice / lessonsPerMonth);

      // Calculate teacher share per lesson
      let teacherSharePerLesson = 0;
      if (group.teacher) {
        if (group.teacher.salaryType === 'percentage') {
          const pct = Number(group.teacher.salaryAmount) / 100;
          teacherSharePerLesson = Math.round((coursePrice * pct) / lessonsPerMonth);
        } else {
          // Fixed amount per student per month
          teacherSharePerLesson = Math.round(Number(group.teacher.salaryAmount) / lessonsPerMonth);
        }
      }

      // Deduct from each active student
      for (const enrollment of group.students) {
        try {
          await this.prisma.$transaction(async (tx) => {
            // Create lesson payment record
            await tx.lessonPayment.create({
              data: {
                branchId: group.branchId,
                groupId: group.id,
                studentId: enrollment.studentId,
                date,
                amount: perLessonCost,
                teacherShare: teacherSharePerLesson,
                status: 'paid',
              },
            });

            // Deduct from student balance (can go negative)
            await tx.student.update({
              where: { id: enrollment.studentId },
              data: { balance: { decrement: perLessonCost } },
            });
          });

          totalDeductions++;
          totalStudents++;
        } catch (error: any) {
          if (error?.code === 'P2002') {
            // Unique constraint — already processed this date, skip
          } else {
            console.error(`Lesson payment error for student ${enrollment.studentId} in group ${group.id}:`, error?.message);
          }
        }
      }

      results.push({
        groupId: group.id,
        groupName: group.name,
        perLessonCost,
        teacherSharePerLesson,
        studentsCharged: group.students.length,
      });
    }

    return {
      date: date.toISOString().split('T')[0],
      totalDeductions,
      totalStudents,
      groups: results,
    };
  }

  // ═══════════════════════════════════════════
  // WRITE-OFF (admin/manager removes payment)
  // ═══════════════════════════════════════════

  async writeOff(lessonPaymentId: number, userId: number, branchId: number, reason?: string) {
    return this.prisma.$transaction(async (tx) => {
      const lp = await tx.lessonPayment.findUnique({ where: { id: lessonPaymentId } });
      if (!lp) throw new NotFoundException('Lesson payment not found');
      if (lp.branchId !== branchId) throw new ForbiddenException('Access denied to this lesson payment');
      if (lp.status === 'written_off') throw new BadRequestException('Already written off');

      const updated = await tx.lessonPayment.updateMany({
        where: { id: lessonPaymentId, status: 'paid' },
        data: {
          status: 'written_off',
          writtenOffBy: userId,
          writtenOffAt: new Date(),
          writeOffReason: reason || 'Excused absence',
        },
      });
      if (updated.count === 0) throw new BadRequestException('Already written off');

      await tx.student.update({
        where: { id: lp.studentId },
        data: { balance: { increment: lp.amount } },
      });

      return { success: true, restored: Number(lp.amount) };
    });
  }

  // Undo a write-off
  async undoWriteOff(lessonPaymentId: number, branchId: number) {
    const lp = await this.prisma.lessonPayment.findUnique({
      where: { id: lessonPaymentId },
    });
    if (!lp) throw new NotFoundException('Lesson payment not found');
    if (lp.branchId !== branchId) throw new ForbiddenException('Access denied to this lesson payment');
    if (lp.status !== 'written_off') throw new BadRequestException('Not written off');

    return this.prisma.$transaction(async (tx) => {
      await tx.lessonPayment.update({
        where: { id: lessonPaymentId },
        data: { status: 'paid', writtenOffBy: null, writtenOffAt: null, writeOffReason: null },
      });
      await tx.student.update({
        where: { id: lp.studentId },
        data: { balance: { decrement: lp.amount } },
      });
      return { success: true };
    });
  }

  // ═══════════════════════════════════════════
  // GET LESSON PAYMENTS (for viewing)
  // ═══════════════════════════════════════════

  async getByGroup(groupId: number, month?: string) {
    const where: any = { groupId };
    if (month) {
      const [y, m] = month.split('-').map(Number);
      where.date = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
    }
    return this.prisma.lessonPayment.findMany({
      where,
      orderBy: [{ date: 'desc' }, { studentId: 'asc' }],
    });
  }

  async getByStudent(studentId: number, month?: string) {
    const where: any = { studentId };
    if (month) {
      const [y, m] = month.split('-').map(Number);
      where.date = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
    }
    return this.prisma.lessonPayment.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  // ═══════════════════════════════════════════
  // TEACHER SALARY CALCULATION
  // ═══════════════════════════════════════════

  async calculateTeacherSalary(teacherId: number, month: number, year: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        groups: {
          where: { status: 'ACTIVE' },
          include: { course: { select: { name: true, price: true } } },
        },
      },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of month

    const groupIds = teacher.groups.map(g => g.id);

    // Batch queries: fetch all data upfront to avoid N+1
    const [paidLessonsAgg, totalLessonsAgg, allLessonDates] = await Promise.all([
      // Count paid lessons per group
      this.prisma.lessonPayment.groupBy({
        by: ['groupId'],
        where: {
          groupId: { in: groupIds },
          status: 'paid',
          date: { gte: startDate, lte: endDate },
        },
        _count: { id: true },
      }),
      // Count total lessons per group
      this.prisma.lessonPayment.groupBy({
        by: ['groupId'],
        where: {
          groupId: { in: groupIds },
          date: { gte: startDate, lte: endDate },
        },
        _count: { id: true },
      }),
      // Get all lesson dates per group (distinct)
      this.prisma.lessonPayment.findMany({
        where: {
          groupId: { in: groupIds },
          date: { gte: startDate, lte: endDate },
        },
        select: { groupId: true, date: true },
        distinct: ['groupId', 'date'],
      }),
    ]);

    // Build lookup maps
    const paidLessonsMap = new Map(paidLessonsAgg.map(r => [r.groupId, r._count.id]));
    const totalLessonsMap = new Map(totalLessonsAgg.map(r => [r.groupId, r._count.id]));
    const lessonDatesMap = new Map<number, { date: Date }[]>();
    for (const ld of allLessonDates) {
      if (!lessonDatesMap.has(ld.groupId)) lessonDatesMap.set(ld.groupId, []);
      lessonDatesMap.get(ld.groupId)!.push({ date: ld.date });
    }

    const groupDetails: any[] = [];
    let totalSalary = 0;

    for (const group of teacher.groups) {
      const paidLessons = paidLessonsMap.get(group.id) || 0;
      const totalLessons = totalLessonsMap.get(group.id) || 0;
      const writtenOff = Number(totalLessons) - Number(paidLessons);
      const lessonDates = lessonDatesMap.get(group.id) || [];

      const coursePrice = Number(group.course.price);
      const lessonsInMonth = lessonDates.length;

      // Skip if no lessons recorded this month
      if (lessonsInMonth === 0) {
        groupDetails.push({
          groupId: group.id, groupName: group.name, courseName: group.course.name,
          coursePrice, salaryType: teacher.salaryType, salaryAmount: Number(teacher.salaryAmount),
          lessonsInMonth: 0, paidStudentLessons: 0, writtenOff: 0, perLessonRate: 0, groupSalary: 0,
        });
        continue;
      }

      // Per-lesson teacher rate
      let perLessonRate: number;
      if (teacher.salaryType === 'percentage') {
        perLessonRate = Math.round((coursePrice * Number(teacher.salaryAmount) / 100) / lessonsInMonth);
      } else {
        perLessonRate = Math.round(Number(teacher.salaryAmount) / lessonsInMonth);
      }

      const groupSalary = Number(paidLessons) * perLessonRate;
      totalSalary += groupSalary;

      groupDetails.push({
        groupId: group.id,
        groupName: group.name,
        courseName: group.course.name,
        coursePrice,
        salaryType: teacher.salaryType,
        salaryAmount: Number(teacher.salaryAmount),
        lessonsInMonth,
        paidStudentLessons: paidLessons,
        writtenOff,
        perLessonRate,
        groupSalary,
      });
    }

    return {
      teacherId,
      teacherName: `${teacher.user.firstName} ${teacher.user.lastName || ''}`.trim(),
      month,
      year,
      salaryType: teacher.salaryType,
      salaryAmount: Number(teacher.salaryAmount),
      groups: groupDetails,
      totalSalary,
    };
  }
}
