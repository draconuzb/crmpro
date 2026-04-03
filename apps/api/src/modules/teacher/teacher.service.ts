import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: number, query: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy, sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      user: {
        isActive: true,
        branches: {
          some: { branchId },
        },
      },
    };

    if (search) {
      where.user.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatar: true,
              gender: true,
              role: true,
              createdAt: true,
            },
          },
          _count: {
            select: { groups: true },
          },
        },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    const mapped = data.map((t) => ({
      id: t.id,
      userId: t.user.id,
      firstName: t.user.firstName,
      lastName: t.user.lastName,
      phone: t.user.phone,
      avatar: t.user.avatar,
      groupsCount: t._count.groups,
      createdAt: t.createdAt,
    }));

    return {
      data: mapped,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            branches: {
              include: { branch: true },
            },
          },
        },
        groups: {
          where: { status: 'ACTIVE' },
          include: {
            course: { select: { id: true, name: true } },
            room: { select: { id: true, name: true } },
            _count: { select: { students: true } },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    const { password, ...userData } = teacher.user;
    return {
      ...teacher,
      user: userData,
    };
  }

  async getHistory(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    const logs = await this.prisma.log.findMany({
      where: {
        OR: [
          { userId: teacher.userId },
          { entity: 'Teacher', entityId: id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return logs;
  }

  async getSalary(id: number, month: number, year: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        groups: {
          where: { status: 'ACTIVE' },
          include: {
            course: { select: { id: true, name: true, price: true } },
            _count: { select: { students: true } },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await Promise.all(
      teacher.groups.map(async (group) => {
        // Count distinct lesson dates (attendance records) in the month
        const attendanceRecords = await this.prisma.attendance.findMany({
          where: {
            groupId: group.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            date: true,
            status: true,
          },
        });

        const uniqueDates = new Set(
          attendanceRecords.map((a) => a.date.toISOString().split('T')[0]),
        );
        const totalLessons = uniqueDates.size;

        const attended = attendanceRecords.filter(
          (a) => a.status === 'PRESENT' || a.status === 'LATE',
        ).length;
        const absent = attendanceRecords.filter(
          (a) => a.status === 'ABSENT',
        ).length;

        // Check if there is a fixed salary record
        const salaryRecord = await this.prisma.salary.findUnique({
          where: {
            teacherId_groupId_month_year: {
              teacherId: id,
              groupId: group.id,
              month,
              year,
            },
          },
        });

        const fixedAmount = salaryRecord
          ? Number(salaryRecord.amount)
          : 0;

        return {
          groupId: group.id,
          groupName: group.name,
          courseName: group.course.name,
          studentsCount: group._count.students,
          totalLessons,
          attended,
          absent,
          fixedAmount,
          calculatedAmount: fixedAmount,
        };
      }),
    );

    return result;
  }

  async create(branchId: number, dto: CreateTeacherDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        password: hashedPassword,
        role: 'TEACHER',
        branches: {
          create: { branchId },
        },
      },
    });

    const bio =
      dto.courseIds && dto.courseIds.length > 0
        ? dto.courseIds.join(',')
        : undefined;

    const teacher = await this.prisma.teacher.create({
      data: {
        userId: user.id,
        bio,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return teacher;
  }

  async update(id: number, dto: UpdateTeacherDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    const userData: any = {};
    if (dto.firstName !== undefined) userData.firstName = dto.firstName;
    if (dto.lastName !== undefined) userData.lastName = dto.lastName;
    if (dto.phone !== undefined) userData.phone = dto.phone;

    if (Object.keys(userData).length > 0) {
      await this.prisma.user.update({
        where: { id: teacher.userId },
        data: userData,
      });
    }

    const teacherData: any = {};
    if (dto.courseIds !== undefined) {
      teacherData.bio = dto.courseIds.join(',');
    }

    if (Object.keys(teacherData).length > 0) {
      await this.prisma.teacher.update({
        where: { id },
        data: teacherData,
      });
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id: teacher.userId },
      data: { isActive: false },
    });

    return { message: 'Teacher deleted successfully' };
  }
}
