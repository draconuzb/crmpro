import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CrmSyncService } from './crm-sync.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('CRM Sync')
@ApiBearerAuth()
@Controller('crm-sync')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrmSyncController {
  constructor(private readonly service: CrmSyncService) {}

  @Get('status')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Get last sync state for all sync types' })
  getStatus() {
    return this.service.getLastSyncState();
  }

  @Post('trigger')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Manually trigger CRM sync for a branch/date' })
  trigger(@Body() body: { branchId: number; date: string }) {
    return this.service.triggerManualSync(body.branchId, body.date);
  }
}
