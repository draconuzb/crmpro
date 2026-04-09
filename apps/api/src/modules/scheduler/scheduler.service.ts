import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCronJobDto, UpdateCronJobDto } from './dto/create-cron-job.dto';

@Injectable()
export class SchedulerService {
  constructor(private prisma: PrismaService) {}

  async getJobs() {
    return this.prisma.cronJob.findMany({
      orderBy: [{ enabled: 'desc' }, { key: 'asc' }],
    });
  }

  async getJob(id: number) {
    return this.prisma.cronJob.findUnique({ where: { id } });
  }

  async createJob(dto: CreateCronJobDto) {
    return this.prisma.cronJob.create({
      data: {
        key: dto.key,
        label: dto.label,
        schedule: dto.schedule,
        type: dto.type || 'message',
        message: dto.message,
        sections: dto.sections,
        assignedTo: dto.assignedTo,
        branchId: dto.branchId,
      },
    });
  }

  async updateJob(id: number, dto: UpdateCronJobDto) {
    return this.prisma.cronJob.update({
      where: { id },
      data: dto as any,
    });
  }

  async deleteJob(id: number) {
    return this.prisma.cronJob.delete({ where: { id } });
  }

  async toggleJob(id: number) {
    const job = await this.prisma.cronJob.findUnique({ where: { id } });
    if (!job) return null;
    return this.prisma.cronJob.update({
      where: { id },
      data: { enabled: !job.enabled },
    });
  }
}
