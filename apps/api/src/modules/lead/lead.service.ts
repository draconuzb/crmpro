import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: number, query: QueryLeadDto) {
    const { search, courseId, source, assignedToId, tagIds, status, startDate, endDate } = query;

    const where: any = { branchId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (courseId) where.courseId = courseId;
    if (source) where.source = source;
    if (assignedToId) where.assignedToId = assignedToId;
    if (status) where.status = status;

    if (tagIds && tagIds.length > 0) {
      where.tags = {
        some: { tagId: { in: tagIds } },
      };
    }

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    }

    const leads = await this.prisma.lead.findMany({
      where,
      include: {
        tags: {
          include: { tag: true },
        },
        course: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by status
    const grouped = {
      LEAD: leads.filter((l) => l.status === 'LEAD'),
      EXPECTATION: leads.filter((l) => l.status === 'EXPECTATION'),
      SET: leads.filter((l) => l.status === 'SET'),
    };

    return {
      data: grouped,
      counts: {
        LEAD: grouped.LEAD.length,
        EXPECTATION: grouped.EXPECTATION.length,
        SET: grouped.SET.length,
        total: leads.length,
      },
    };
  }

  async findOne(id: number) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        tags: {
          include: { tag: true },
        },
        course: { select: { id: true, name: true } },
        reminders: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async create(branchId: number, dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        branchId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        source: dto.source,
        courseId: dto.courseId,
        note: dto.note,
      },
      include: {
        tags: {
          include: { tag: true },
        },
        course: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: number, dto: UpdateLeadDto) {
    await this.findOne(id);

    const data: any = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.source !== undefined) data.source = dto.source;
    if (dto.courseId !== undefined) data.courseId = dto.courseId;
    if (dto.note !== undefined) data.note = dto.note;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.assignedToId !== undefined) data.assignedToId = dto.assignedToId;

    return this.prisma.lead.update({
      where: { id },
      data,
      include: {
        tags: {
          include: { tag: true },
        },
        course: { select: { id: true, name: true } },
      },
    });
  }

  async updateStatus(id: number, status: string) {
    await this.findOne(id);

    return this.prisma.lead.update({
      where: { id },
      data: { status: status as any },
      include: {
        tags: {
          include: { tag: true },
        },
        course: { select: { id: true, name: true } },
      },
    });
  }

  async convert(id: number, branchId: number) {
    const lead = await this.findOne(id);

    // Generate a random password
    const randomPass = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPass, 10);

    const user = await this.prisma.user.create({
      data: {
        firstName: lead.firstName,
        lastName: lead.lastName || '',
        phone: lead.phone,
        password: hashedPassword,
        role: 'STUDENT',
        branches: {
          create: { branchId },
        },
      },
    });

    const student = await this.prisma.student.create({
      data: {
        userId: user.id,
        branchId,
        leadId: lead.id,
      },
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
    });

    return student;
  }

  async addTag(leadId: number, tagId: number) {
    await this.findOne(leadId);

    return this.prisma.leadTag.create({
      data: { leadId, tagId },
      include: { tag: true },
    });
  }

  async removeTag(leadId: number, tagId: number) {
    await this.findOne(leadId);

    return this.prisma.leadTag.delete({
      where: {
        leadId_tagId: { leadId, tagId },
      },
    });
  }
}
