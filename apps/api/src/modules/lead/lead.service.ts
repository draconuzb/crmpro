import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import * as bcrypt from 'bcrypt';

const DEFAULT_STAGES = [
  { key: 'lead', label: 'Leads', color: '#1890ff', sortOrder: 0 },
  { key: 'sinov_darsiga_chaqirildi', label: 'Sinov darsiga chaqirildi', color: '#722ed1', sortOrder: 1 },
  { key: 'sifatli', label: 'Sifatli', color: '#13c2c2', sortOrder: 2 },
  { key: 'telefon_kotarmadi', label: "Telefon ko'tarmadi", color: '#fa8c16', sortOrder: 3 },
  { key: 'rad_etildi', label: 'Rad etildi', color: '#f5222d', sortOrder: 4 },
];

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════
  // LEAD STAGE CRUD
  // ═══════════════════════════════════════════

  async getStages(branchId: number) {
    const stages = await this.prisma.leadStage.findMany({
      where: { branchId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    // Auto-create defaults if none exist
    if (stages.length === 0) {
      await this.prisma.leadStage.createMany({
        data: DEFAULT_STAGES.map(s => ({ ...s, branchId })),
      });
      return this.prisma.leadStage.findMany({
        where: { branchId, isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    }

    return stages;
  }

  async createStage(branchId: number, data: { key: string; label: string; color?: string }) {
    const maxOrder = await this.prisma.leadStage.aggregate({
      where: { branchId },
      _max: { sortOrder: true },
    });
    return this.prisma.leadStage.create({
      data: {
        branchId,
        key: data.key,
        label: data.label,
        color: data.color || '#1890ff',
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });
  }

  async updateStage(id: number, data: { label?: string; color?: string; sortOrder?: number }) {
    return this.prisma.leadStage.update({ where: { id }, data });
  }

  async deleteStage(id: number) {
    return this.prisma.leadStage.update({ where: { id }, data: { isActive: false } });
  }

  async reorderStages(branchId: number, stageIds: number[]) {
    await Promise.all(
      stageIds.map((id, i) =>
        this.prisma.leadStage.update({ where: { id }, data: { sortOrder: i } }),
      ),
    );
    return this.getStages(branchId);
  }

  // ═══════════════════════════════════════════
  // LEADS — DYNAMIC GROUPING
  // ═══════════════════════════════════════════

  async findAll(branchId: number, query: QueryLeadDto) {
    const { search, courseId, source, assignedToId, tagIds, status, startDate, endDate } = query;

    // Get configured stages
    const stages = await this.getStages(branchId);

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
      where.tags = { some: { tagId: { in: tagIds } } };
    }

    if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

    const leads = await this.prisma.lead.findMany({
      where,
      include: {
        tags: { include: { tag: true } },
        course: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get courses for this branch (for the course-grouped display)
    const courses = await this.prisma.course.findMany({
      where: { branchId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    // Dynamic grouping by stage key
    const data: Record<string, typeof leads> = {};
    const counts: Record<string, number> = {};

    for (const stage of stages) {
      const stageLeads = leads.filter(l => l.status === stage.key);
      data[stage.key] = stageLeads;
      counts[stage.key] = stageLeads.length;
    }

    // Also catch leads with unknown status
    const knownKeys = new Set(stages.map(s => s.key));
    const unknownLeads = leads.filter(l => !knownKeys.has(l.status));
    if (unknownLeads.length) {
      data['_unknown'] = unknownLeads;
      counts['_unknown'] = unknownLeads.length;
    }

    // Build course summary per stage (Modme-style: assigned/total per course per stage)
    const courseSummary: Record<string, Array<{ courseId: number | null; courseName: string; assigned: number; total: number }>> = {};
    for (const stage of stages) {
      const stageLeads = data[stage.key] || [];
      const byCourse: Record<string, { courseId: number | null; courseName: string; assigned: number; total: number }> = {};

      for (const course of courses) {
        byCourse[course.name] = { courseId: course.id, courseName: course.name, assigned: 0, total: 0 };
      }
      byCourse['Boshqa'] = { courseId: null, courseName: 'Boshqa', assigned: 0, total: 0 };

      for (const lead of stageLeads) {
        const name = lead.course?.name || 'Boshqa';
        if (!byCourse[name]) byCourse[name] = { courseId: lead.courseId, courseName: name, assigned: 0, total: 0 };
        byCourse[name].total++;
        if (lead.assignedToId) byCourse[name].assigned++;
      }

      courseSummary[stage.key] = Object.values(byCourse).filter(c => c.total > 0 || courses.some(cc => cc.name === c.courseName));
    }

    return {
      stages,
      courses,
      data,
      counts: { ...counts, total: leads.length },
      courseSummary,
    };
  }

  async findOne(id: number, branchId: number) {
    const where: any = { id, branchId };

    const lead = await this.prisma.lead.findFirst({
      where,
      include: {
        tags: { include: { tag: true } },
        course: { select: { id: true, name: true } },
        reminders: { orderBy: { dueDate: 'asc' } },
      },
    });
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);
    return lead;
  }

  async create(branchId: number, dto: CreateLeadDto) {
    const existing = await this.prisma.lead.findFirst({
      where: { branchId, phone: dto.phone, status: { not: 'converted' } },
    });
    if (existing) throw new BadRequestException('Lead with this phone already exists');

    return this.prisma.lead.create({
      data: {
        branchId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        source: dto.source,
        courseId: dto.courseId,
        note: dto.note,
        status: dto.status || 'lead',
      },
      include: {
        tags: { include: { tag: true } },
        course: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: number, branchId: number, dto: UpdateLeadDto) {
    await this.findOne(id, branchId);

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
        tags: { include: { tag: true } },
        course: { select: { id: true, name: true } },
      },
    });
  }

  async updateStatus(id: number, branchId: number, status: string) {
    await this.findOne(id, branchId);
    return this.prisma.lead.update({
      where: { id },
      data: { status },
      include: {
        tags: { include: { tag: true } },
        course: { select: { id: true, name: true } },
      },
    });
  }

  async convert(id: number, branchId: number, groupId?: number) {
    const lead = await this.findOne(id, branchId);
    if (lead.status === 'converted') {
      throw new BadRequestException('Lead already converted');
    }

    // Check for existing user with same phone
    const existingUser = await this.prisma.user.findUnique({ where: { phone: lead.phone } });
    if (existingUser) {
      throw new BadRequestException(`User with phone ${lead.phone} already exists`);
    }

    const randomPass = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPass, 10);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create user
      const user = await tx.user.create({
        data: {
          firstName: lead.firstName,
          lastName: lead.lastName || '',
          phone: lead.phone,
          password: hashedPassword,
          role: 'STUDENT',
          branches: { create: { branchId } },
        },
      });

      // 2. Create student linked to lead
      const student = await tx.student.create({
        data: { userId: user.id, branchId, leadId: lead.id },
      });

      // 3. Enroll in group if provided
      if (groupId) {
        const group = await tx.group.findUnique({
          where: { id: groupId },
          include: { course: true },
        });
        if (group) {
          await tx.groupStudent.create({
            data: {
              groupId,
              studentId: student.id,
              price: Number(group.course.price),
              status: 'ACTIVE',
            },
          });
        }
      }

      // 4. Mark lead as converted
      await tx.lead.update({
        where: { id },
        data: { status: 'converted' },
      });

      return {
        student: {
          id: student.id,
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        },
        groupId,
      };
    });
  }

  // ═══════════════════════════════════════════
  // LEAD ANALYTICS
  // ═══════════════════════════════════════════

  async getAnalytics(branchId: number) {
    const stages = await this.getStages(branchId);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const sixtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60);

    const allLeads = await this.prisma.lead.findMany({
      where: { branchId },
      include: { course: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const recentLeads = allLeads.filter(l => l.createdAt >= thirtyDaysAgo);
    const prevLeads = allLeads.filter(l => l.createdAt >= sixtyDaysAgo && l.createdAt < thirtyDaysAgo);

    // 1. Funnel: count per stage
    const funnel = stages.map(s => ({
      key: s.key, label: s.label, color: s.color,
      count: allLeads.filter(l => l.status === s.key).length,
      recent: recentLeads.filter(l => l.status === s.key).length,
    }));

    // 2. By source
    const sourceMap: Record<string, number> = {};
    allLeads.forEach(l => { const s = l.source || 'Boshqa'; sourceMap[s] = (sourceMap[s] || 0) + 1; });
    const bySource = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // 3. By course/subject
    const courseMap: Record<string, number> = {};
    allLeads.forEach(l => { const c = l.course?.name || 'Boshqa'; courseMap[c] = (courseMap[c] || 0) + 1; });
    const byCourse = Object.entries(courseMap)
      .map(([course, count]) => ({ course, count }))
      .sort((a, b) => b.count - a.count);

    // 4. Daily trend (last 30 days)
    const dailyMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      dailyMap[d.toISOString().split('T')[0]] = 0;
    }
    recentLeads.forEach(l => {
      const d = l.createdAt.toISOString().split('T')[0];
      if (dailyMap[d] !== undefined) dailyMap[d]++;
    });
    const dailyTrend = Object.entries(dailyMap).map(([date, count]) => ({
      date: date.slice(5), count,
    }));

    // 5. Weekly comparison
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay() + 1);
    thisWeekStart.setHours(0, 0, 0, 0);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const thisWeek = allLeads.filter(l => l.createdAt >= thisWeekStart).length;
    const lastWeek = allLeads.filter(l => l.createdAt >= lastWeekStart && l.createdAt < thisWeekStart).length;

    // 6. Conversion rate (leads that became students)
    const convertedCount = await this.prisma.student.count({ where: { branchId, leadId: { not: null } } });
    const conversionRate = allLeads.length > 0 ? Math.round((convertedCount / allLeads.length) * 100) : 0;

    // 7. Today / This month
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = allLeads.filter(l => l.createdAt >= todayStart).length;
    const thisMonth = allLeads.filter(l => l.createdAt >= monthStart).length;

    // 8. Avg per day (last 30)
    const avgPerDay = recentLeads.length > 0 ? +(recentLeads.length / 30).toFixed(1) : 0;

    // 9. Growth rate
    const growth = prevLeads.length > 0
      ? Math.round(((recentLeads.length - prevLeads.length) / prevLeads.length) * 100)
      : recentLeads.length > 0 ? 100 : 0;

    // 10. Heatmap: day-of-week distribution
    const weekdays = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
    const heatmap = weekdays.map((day, i) => ({
      day, count: recentLeads.filter(l => l.createdAt.getDay() === i).length,
    }));

    // 11. Hourly distribution
    const hourly = Array.from({ length: 24 }, (_, h) => ({
      hour: `${String(h).padStart(2, '0')}:00`,
      count: recentLeads.filter(l => l.createdAt.getHours() === h).length,
    }));

    // 12. Stage flow (how many moved from lead to each subsequent stage)
    const stageFlow = stages.map(s => ({
      key: s.key, label: s.label, color: s.color,
      total: allLeads.filter(l => l.status === s.key).length,
      percentage: allLeads.length > 0
        ? Math.round((allLeads.filter(l => l.status === s.key).length / allLeads.length) * 100) : 0,
    }));

    return {
      total: allLeads.length,
      today, thisMonth, thisWeek, lastWeek, avgPerDay, growth,
      conversionRate, convertedCount,
      funnel, stageFlow, bySource, byCourse,
      dailyTrend, heatmap, hourly,
    };
  }

  async addTag(leadId: number, branchId: number, tagId: number) {
    await this.findOne(leadId, branchId);
    return this.prisma.leadTag.create({ data: { leadId, tagId }, include: { tag: true } });
  }

  async removeTag(leadId: number, branchId: number, tagId: number) {
    await this.findOne(leadId, branchId);
    return this.prisma.leadTag.delete({ where: { leadId_tagId: { leadId, tagId } } });
  }
}
