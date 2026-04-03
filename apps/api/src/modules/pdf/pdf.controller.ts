import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('PDF Reports')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false })
@Controller('reports/pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Generate daily PDF report' })
  async dailyPdf(
    @CurrentBranch() branchId: number,
    @Query('date') date: string,
    @Res() res: Response,
  ) {
    const buffer = await this.pdfService.generateDailyPdf(branchId, date);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="daily-report-${date}.pdf"`,
    });
    res.send(buffer);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Generate weekly PDF report' })
  async weeklyPdf(
    @CurrentBranch() branchId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.pdfService.generateWeeklyPdf(branchId, startDate, endDate);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="weekly-report-${startDate}.pdf"`,
    });
    res.send(buffer);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Generate monthly PDF report' })
  async monthlyPdf(
    @CurrentBranch() branchId: number,
    @Query('month') month: string,
    @Res() res: Response,
  ) {
    const buffer = await this.pdfService.generateMonthlyPdf(branchId, month);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="monthly-report-${month}.pdf"`,
    });
    res.send(buffer);
  }
}
