import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessonPaymentService } from './lesson-payment.service';

@Injectable()
export class LessonPaymentCron {
  private readonly logger = new Logger(LessonPaymentCron.name);

  constructor(private readonly lessonPaymentService: LessonPaymentService) {}

  // Run every day at 8:00 AM Tashkent time (03:00 UTC)
  @Cron('0 3 * * 1-6', { name: 'daily-lesson-deduction' })
  async handleDailyDeduction() {
    this.logger.log('Running daily lesson deduction...');
    try {
      const result = await this.lessonPaymentService.runDailyDeduction();
      this.logger.log(`Daily deduction complete: ${result.totalDeductions} deductions from ${result.totalStudents} students`);
    } catch (error) {
      this.logger.error('Daily deduction failed:', error);
    }
  }
}
