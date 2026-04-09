import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateStudentDepartureDto,
  CreateLeadDeletionDto,
  CreateRejectionReasonDto,
  QueryRejectionsDto,
} from './dto/create-departure.dto';

@Injectable()
export class RejectionService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════
  // REJECTION REASONS (configurable per branch)
  // ═══════════════════════════════════════════

  async getReasons(branchId: number) {
    return this.prisma.rejectionReason.findMany({
      where: { branchId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createReason(branchId: number, dto: CreateRejectionReasonDto) {
    const maxOrder = await this.prisma.rejectionReason.aggregate({
      where: { branchId },
      _max: { sortOrder: true },
    });
    return this.prisma.rejectionReason.create({
      data: {
        branchId,
        label: dto.label,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });
  }

  async updateReason(id: number, label: string) {
    return this.prisma.rejectionReason.update({
      where: { id },
      data: { label },
    });
  }

  async deleteReason(id: number) {
    return this.prisma.rejectionReason.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ═══════════════════════════════════════════
  // STUDENT DEPARTURES (Rad etganlar)
  // ═══════════════════════════════════════════

  async getDepartures(branchId: number, query: QueryRejectionsDto) {
    const { type, reasonId, teacherId, courseId, startDate, endDate, search, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { branchId };

    if (type) where.type = type;
    if (reasonId) where.reasonId = Number(reasonId);
    if (teacherId) where.teacherId = Number(teacherId);
    if (courseId) where.courseId = Number(courseId);
    if (startDate) where.departureDate = { ...where.departureDate, gte: new Date(startDate) };
    if (endDate) where.departureDate = { ...where.departureDate, lte: new Date(endDate) };

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
      this.prisma.studentDeparture.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { departureDate: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, phone: true } },
            },
          },
          reason: { select: { id: true, label: true } },
        },
      }),
      this.prisma.studentDeparture.count({ where }),
    ]);

    // Stats
    const [sinovCount, doimiyCount] = await Promise.all([
      this.prisma.studentDeparture.count({ where: { branchId, type: 'sinov' } }),
      this.prisma.studentDeparture.count({ where: { branchId, type: 'doimiy' } }),
    ]);

    return {
      data: data.map(d => ({
        id: d.id,
        type: d.type,
        studentId: d.studentId,
        studentName: `${d.student.user.firstName} ${d.student.user.lastName || ''}`.trim(),
        phone: d.student.user.phone,
        reason: d.reason.label,
        reasonId: d.reasonId,
        note: d.note,
        groupId: d.groupId,
        teacherId: d.teacherId,
        courseId: d.courseId,
        departureDate: d.departureDate,
        createdAt: d.createdAt,
      })),
      total,
      page: Number(page),
      limit: Number(limit),
      stats: { sinov: sinovCount, doimiy: doimiyCount, total: sinovCount + doimiyCount },
    };
  }

  async createDeparture(branchId: number, dto: CreateStudentDepartureDto, userId: number) {
    // Get student with enrollment info to auto-determine type
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      include: {
        groupEnrollments: {
          where: dto.groupId ? { groupId: dto.groupId } : { status: 'ACTIVE' },
          include: {
            group: { include: { course: true, teacher: true } },
          },
          orderBy: { startDate: 'asc' },
          take: 1,
        },
      },
    });

    if (!student) throw new NotFoundException('Student not found');
    if (student.branchId !== branchId) throw new BadRequestException('Student does not belong to this branch');

    // Auto-calculate type: sinov (< 1 month) vs doimiy (≥ 1 month)
    let enrollment = student.groupEnrollments[0];
    let type = 'doimiy'; // default
    if (enrollment) {
      const enrolledAt = enrollment.startDate;
      const now = new Date();
      const diffMs = now.getTime() - enrolledAt.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      type = diffDays < 30 ? 'sinov' : 'doimiy';
    }

    // Fallback: if no active enrollment, use the latest completed/left enrollment for tenure calculation
    if (!enrollment) {
      const latestEnrollment = await this.prisma.groupStudent.findFirst({
        where: { studentId: dto.studentId, status: { in: ['LEFT', 'COMPLETED'] } },
        orderBy: { endDate: 'desc' },
        include: { group: { include: { teacher: true, course: true } } },
      });
      if (latestEnrollment) {
        const enrolledAt = latestEnrollment.startDate;
        const endedAt = latestEnrollment.endDate || new Date();
        const diffMs = endedAt.getTime() - enrolledAt.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        type = diffDays < 30 ? 'sinov' : 'doimiy';
        // Use latestEnrollment as fallback for group/teacher/course info
        enrollment = latestEnrollment as any;
      }
    }

    const groupId = dto.groupId || enrollment?.groupId || null;
    const teacherId = enrollment?.group?.teacher?.id || null;
    const courseId = enrollment?.group?.course?.id || null;

    return this.prisma.$transaction(async (tx) => {
      // Create departure record
      const departure = await tx.studentDeparture.create({
        data: {
          branchId,
          studentId: dto.studentId,
          type,
          reasonId: dto.reasonId,
          note: dto.note,
          groupId,
          teacherId,
          courseId,
          createdById: userId,
        },
        include: {
          reason: { select: { label: true } },
        },
      });

      // Archive the student
      await tx.student.update({
        where: { id: dto.studentId },
        data: { isArchived: true },
      });

      // Set enrollment status to LEFT if in a group
      if (groupId) {
        await tx.groupStudent.updateMany({
          where: { studentId: dto.studentId, groupId, status: 'ACTIVE' },
          data: { status: 'LEFT', endDate: new Date() },
        });
      }

      return departure;
    });
  }

  // ═══════════════════════════════════════════
  // LEAD DELETIONS (workflow when deleting from Kanban)
  // ═══════════════════════════════════════════

  async deleteLeadWithReason(branchId: number, dto: CreateLeadDeletionDto, userId: number) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: dto.leadId, branchId },
      include: { course: { select: { id: true, name: true } } },
    });

    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.$transaction(async (tx) => {
      // Store deletion record
      const deletion = await tx.leadDeletion.create({
        data: {
          branchId,
          leadId: lead.id,
          firstName: lead.firstName,
          lastName: lead.lastName,
          phone: lead.phone,
          reasonId: dto.reasonId,
          note: dto.note,
          source: lead.source,
          courseId: lead.courseId,
          deletedById: userId,
        },
      });

      // Delete the lead
      await tx.lead.delete({ where: { id: lead.id } });

      return deletion;
    });
  }

  async getLeadDeletions(branchId: number, query: QueryRejectionsDto) {
    const { reasonId, startDate, endDate, search, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { branchId };
    if (reasonId) where.reasonId = Number(reasonId);
    if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.leadDeletion.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          reason: { select: { id: true, label: true } },
        },
      }),
      this.prisma.leadDeletion.count({ where }),
    ]);

    return { data, total, page: Number(page), limit: Number(limit) };
  }
}
