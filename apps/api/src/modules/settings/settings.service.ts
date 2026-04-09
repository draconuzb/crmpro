import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  // ── General (Branch info) ──────────────────────────────────────────

  async getGeneral(branchId: number) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async updateGeneral(branchId: number, body: any) {
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.address !== undefined) data.address = body.address;
    if (body.phone !== undefined) data.phone = body.phone;

    const branch = await this.prisma.branch.update({
      where: { id: branchId },
      data,
    });
    return branch;
  }

  // ── SMS Settings ───────────────────────────────────────────────────

  async getSms(branchId: number) {
    const settings = await this.prisma.smsSettings.findUnique({
      where: { branchId },
    });
    if (!settings) {
      return { branchId, provider: '', senderName: '', isActive: false };
    }
    const { apiKey, ...safe } = settings;
    return { ...safe, hasApiKey: !!apiKey };
  }

  async updateSms(branchId: number, body: any) {
    const data: any = {};
    if (body.provider !== undefined) data.provider = body.provider;
    if (body.apiKey !== undefined) data.apiKey = body.apiKey;
    if (body.senderName !== undefined) data.senderName = body.senderName;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const settings = await this.prisma.smsSettings.upsert({
      where: { branchId },
      create: { branchId, provider: body.provider || '', ...data },
      update: data,
    });
    return settings;
  }

  // ── VoIP Settings ──────────────────────────────────────────────────

  async getVoip(branchId: number) {
    const settings = await this.prisma.voipSettings.findUnique({
      where: { branchId },
    });
    if (!settings) {
      return { branchId, provider: '', sipDomain: '', isActive: false };
    }
    const { apiKey, ...safe } = settings;
    return { ...safe, hasApiKey: !!apiKey };
  }

  async updateVoip(branchId: number, body: any) {
    const data: any = {};
    if (body.provider !== undefined) data.provider = body.provider;
    if (body.apiKey !== undefined) data.apiKey = body.apiKey;
    if (body.sipDomain !== undefined) data.sipDomain = body.sipDomain;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const settings = await this.prisma.voipSettings.upsert({
      where: { branchId },
      create: { branchId, provider: body.provider || '', ...data },
      update: data,
    });
    return settings;
  }
}
