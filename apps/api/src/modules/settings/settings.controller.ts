import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false })
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('general')
  @ApiOperation({ summary: 'Get general branch settings' })
  getGeneral(@CurrentBranch() branchId: number) {
    return this.settingsService.getGeneral(branchId);
  }

  @Patch('general')
  @ApiOperation({ summary: 'Update general branch settings' })
  updateGeneral(@CurrentBranch() branchId: number, @Body() body: any) {
    return this.settingsService.updateGeneral(branchId, body);
  }

  @Get('sms')
  @ApiOperation({ summary: 'Get SMS settings' })
  getSms(@CurrentBranch() branchId: number) {
    return this.settingsService.getSms(branchId);
  }

  @Patch('sms')
  @ApiOperation({ summary: 'Update SMS settings' })
  updateSms(@CurrentBranch() branchId: number, @Body() body: any) {
    return this.settingsService.updateSms(branchId, body);
  }

  @Get('voip')
  @ApiOperation({ summary: 'Get VoIP settings' })
  getVoip(@CurrentBranch() branchId: number) {
    return this.settingsService.getVoip(branchId);
  }

  @Patch('voip')
  @ApiOperation({ summary: 'Update VoIP settings' })
  updateVoip(@CurrentBranch() branchId: number, @Body() body: any) {
    return this.settingsService.updateVoip(branchId, body);
  }
}
