import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitResultDto } from './dto/submit-result.dto';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  async findAll(groupId: number, branchId?: number) {
    const where: any = { groupId };
    if (branchId) where.group = { branchId };

    const exams = await this.prisma.exam.findMany({
      where,
      include: { _count: { select: { results: true } } },
      orderBy: { date: 'desc' },
    });

    return exams.map((e) => ({
      ...e,
      resultsCount: e._count.results,
      _count: undefined,
    }));
  }

  async findOne(id: number) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        results: {
          include: { student: { include: { user: true } } },
          orderBy: { score: 'desc' },
        },
      },
    });

    if (!exam) throw new NotFoundException('Exam not found');

    return {
      ...exam,
      results: exam.results.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        studentName: `${r.student.user.firstName} ${r.student.user.lastName}`,
        score: r.score,
      })),
    };
  }

  async create(dto: CreateExamDto) {
    return this.prisma.exam.create({
      data: {
        groupId: dto.groupId,
        title: dto.title,
        date: new Date(dto.date),
        maxScore: dto.maxScore,
      },
    });
  }

  async submitResult(examId: number, dto: SubmitResultDto) {
    return this.prisma.examResult.upsert({
      where: {
        examId_studentId: { examId, studentId: dto.studentId },
      },
      update: { score: dto.score },
      create: { examId, studentId: dto.studentId, score: dto.score },
    });
  }

  async submitBulkResults(examId: number, results: SubmitResultDto[]) {
    const ops = results.map((r) =>
      this.prisma.examResult.upsert({
        where: {
          examId_studentId: { examId, studentId: r.studentId },
        },
        update: { score: r.score },
        create: { examId, studentId: r.studentId, score: r.score },
      }),
    );

    return this.prisma.$transaction(ops);
  }

  async delete(id: number) {
    return this.prisma.exam.delete({ where: { id } });
  }
}
