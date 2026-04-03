import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateSubcourseDto } from './dto/create-subcourse.dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: number) {
    return this.prisma.course.findMany({
      where: { branchId, isActive: true },
      include: {
        subcourses: { orderBy: { sortOrder: 'asc' } },
        groups: {
          include: {
            _count: { select: { students: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        subcourses: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async create(branchId: number, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        branchId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        duration: dto.duration,
        lessonDuration: dto.lessonDuration,
      },
    });
  }

  async update(id: number, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.course.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.course.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addSubcourse(courseId: number, dto: CreateSubcourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.subcourse.create({
      data: {
        courseId,
        name: dto.name,
        materials: dto.materials,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updateSubcourse(id: number, dto: Partial<CreateSubcourseDto>) {
    const subcourse = await this.prisma.subcourse.findUnique({ where: { id } });
    if (!subcourse) throw new NotFoundException('Subcourse not found');
    return this.prisma.subcourse.update({
      where: { id },
      data: dto,
    });
  }

  async removeSubcourse(id: number) {
    const subcourse = await this.prisma.subcourse.findUnique({ where: { id } });
    if (!subcourse) throw new NotFoundException('Subcourse not found');
    return this.prisma.subcourse.delete({ where: { id } });
  }
}
