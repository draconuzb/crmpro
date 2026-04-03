import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_GRADE_SETTINGS = {
  maxScore: 100,
  passingScore: 60,
  labels: [
    { label: 'A', min: 90, max: 100 },
    { label: 'B', min: 75, max: 89 },
    { label: 'C', min: 60, max: 74 },
    { label: 'D', min: 40, max: 59 },
    { label: 'F', min: 0, max: 39 },
  ],
};

@Injectable()
export class GradeService {
  constructor(private prisma: PrismaService) {}

  async getSettings(branchId: number) {
    const config = await this.prisma.branchConfig.findUnique({
      where: { branchId_key: { branchId, key: 'grade_settings' } },
    });
    return config ? config.value : DEFAULT_GRADE_SETTINGS;
  }

  async updateSettings(branchId: number, dto: any) {
    const value = {
      maxScore: dto.maxScore ?? DEFAULT_GRADE_SETTINGS.maxScore,
      passingScore: dto.passingScore ?? DEFAULT_GRADE_SETTINGS.passingScore,
      labels: dto.labels ?? DEFAULT_GRADE_SETTINGS.labels,
    };

    await this.prisma.branchConfig.upsert({
      where: { branchId_key: { branchId, key: 'grade_settings' } },
      create: { branchId, key: 'grade_settings', value },
      update: { value },
    });

    return value;
  }

  async getGrades(groupId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const students = await this.prisma.groupStudent.findMany({
      where: { groupId, status: 'ACTIVE' },
      include: { student: { include: { user: true } } },
    });

    const grades = await this.prisma.gradeRecord.findMany({
      where: {
        groupId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    const dates = [...new Set(grades.map((g) => g.date.toISOString().split('T')[0]))].sort();

    const matrix = students.map((gs) => ({
      studentId: gs.studentId,
      studentName: `${gs.student.user.firstName} ${gs.student.user.lastName}`,
      grades: dates.map((d) => {
        const record = grades.find(
          (g) =>
            g.studentId === gs.studentId &&
            g.date.toISOString().split('T')[0] === d,
        );
        return {
          date: d,
          score: record?.score ?? null,
          comment: record?.comment ?? null,
        };
      }),
    }));

    return { dates, students: matrix };
  }

  async setGrade(
    groupId: number,
    studentId: number,
    date: string,
    score: number,
    comment?: string,
  ) {
    const dateObj = new Date(date);

    return this.prisma.gradeRecord.upsert({
      where: {
        groupId_studentId_date: { groupId, studentId, date: dateObj },
      },
      update: { score, comment },
      create: { groupId, studentId, date: dateObj, score, comment },
    });
  }
}
