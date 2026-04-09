import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryGroupDto } from './dto/query-group.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddStudentToGroupDto } from './dto/add-student-to-group.dto';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: number, query: QueryGroupDto) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy,
      sortOrder = 'desc',
      courseId,
      teacherId,
      dayType,
      status,
      tagIds,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      branchId,
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (dayType) {
      where.dayType = dayType;
    }

    if (status) {
      where.status = status;
    }

    if (tagIds) {
      const ids = tagIds.split(',').map((s) => parseInt(s, 10));
      where.tags = {
        some: { tagId: { in: ids } },
      };
    }

    const allowedSortFields = ['name', 'startDate', 'status', 'createdAt'];
    const safeSortBy = sortBy && allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: any = { [safeSortBy]: sortOrder || 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          course: { select: { id: true, name: true } },
          teacher: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
          room: { select: { id: true, name: true } },
          tags: {
            include: {
              tag: { select: { id: true, name: true, color: true } },
            },
          },
          _count: { select: { students: true } },
        },
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, branchId?: number) {
    const where: any = { id };
    if (branchId) where.branchId = branchId;

    const group = await this.prisma.group.findUnique({
      where,
      include: {
        course: true,
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        room: true,
        students: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: {
            student: {
              user: { firstName: 'asc' },
            },
          },
        },
        tags: {
          include: {
            tag: { select: { id: true, name: true, color: true } },
          },
        },
        _count: { select: { students: true } },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async create(branchId: number, dto: CreateGroupDto) {
    return this.prisma.group.create({
      data: {
        branchId,
        name: dto.name,
        courseId: dto.courseId,
        teacherId: dto.teacherId,
        roomId: dto.roomId || null,
        dayType: dto.dayType as any,
        customDays: dto.customDays,
        startTime: dto.startTime,
        endTime: dto.endTime,
        startDate: new Date(dto.startDate),
        capacity: dto.capacity,
        note: dto.note,
      },
      include: {
        course: { select: { id: true, name: true } },
        teacher: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        room: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: number, dto: UpdateGroupDto) {
    await this.findOne(id);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.courseId !== undefined) data.courseId = dto.courseId;
    if (dto.teacherId !== undefined) data.teacherId = dto.teacherId;
    if (dto.roomId !== undefined) data.roomId = dto.roomId;
    if (dto.dayType !== undefined) data.dayType = dto.dayType;
    if (dto.customDays !== undefined) data.customDays = dto.customDays;
    if (dto.startTime !== undefined) data.startTime = dto.startTime;
    if (dto.endTime !== undefined) data.endTime = dto.endTime;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.capacity !== undefined) data.capacity = dto.capacity;
    if (dto.note !== undefined) data.note = dto.note;
    if (dto.status !== undefined) data.status = dto.status;

    // When archiving/completing a group, cascade status to enrolled students
    if (dto.status === 'ARCHIVED' || dto.status === 'COMPLETED') {
      await this.prisma.groupStudent.updateMany({
        where: { groupId: id, status: 'ACTIVE' },
        data: { status: dto.status === 'COMPLETED' ? 'COMPLETED' : 'LEFT', endDate: new Date() },
      });
    }

    return this.prisma.group.update({
      where: { id },
      data,
      include: {
        course: { select: { id: true, name: true } },
        teacher: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        room: { select: { id: true, name: true } },
      },
    });
  }

  async addStudent(groupId: number, dto: AddStudentToGroupDto) {
    const group = await this.findOne(groupId);
    const enrollmentCount = await this.prisma.groupStudent.count({ where: { groupId, status: 'ACTIVE' } });
    if (group.capacity && enrollmentCount >= group.capacity) {
      throw new BadRequestException('Group is at full capacity');
    }

    return this.prisma.groupStudent.create({
      data: {
        groupId,
        studentId: dto.studentId,
        price: dto.price,
        status: dto.status || 'ACTIVE',
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  async removeStudent(groupId: number, studentId: number) {
    const enrollment = await this.prisma.groupStudent.findUnique({
      where: {
        groupId_studentId: { groupId, studentId },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Student ${studentId} not found in group ${groupId}`,
      );
    }

    return this.prisma.groupStudent.update({
      where: {
        groupId_studentId: { groupId, studentId },
      },
      data: {
        status: 'LEFT',
        endDate: new Date(),
      },
    });
  }

  async getAttendance(groupId: number, month: number, year: number) {
    await this.findOne(groupId);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get all students in the group
    const enrollments = await this.prisma.groupStudent.findMany({
      where: { groupId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          user: { firstName: 'asc' },
        },
      },
    });

    // Get all attendance records for this group in the month
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        groupId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Build a lookup map: `${studentId}-${dateStr}` => status
    const attendanceMap = new Map<string, string>();
    attendanceRecords.forEach((rec) => {
      const dateStr = rec.date.toISOString().split('T')[0];
      attendanceMap.set(`${rec.studentId}-${dateStr}`, rec.status);
    });

    // Get unique dates
    const dateSet = new Set<string>(
      attendanceRecords.map((a) => a.date.toISOString().split('T')[0]),
    );
    const dates = [...dateSet].sort();

    // Build matrix
    const students = enrollments.map((e) => {
      const attendance: Record<string, string | null> = {};
      dates.forEach((date) => {
        attendance[date] =
          attendanceMap.get(`${e.studentId}-${date}`) || null;
      });

      return {
        studentId: e.studentId,
        firstName: e.student.user.firstName,
        lastName: e.student.user.lastName,
        status: e.status,
        attendance,
      };
    });

    return {
      dates,
      students,
      daysInMonth: endDate.getDate(),
    };
  }

  async getStudents(groupId: number) {
    await this.findOne(groupId);

    return this.prisma.groupStudent.findMany({
      where: { groupId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          user: { firstName: 'asc' },
        },
      },
    });
  }
}
