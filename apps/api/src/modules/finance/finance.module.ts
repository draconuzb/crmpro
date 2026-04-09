import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { LessonPaymentController } from './lesson-payment.controller';
import { LessonPaymentService } from './lesson-payment.service';
import { LessonPaymentCron } from './lesson-payment.cron';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [FinanceController, LessonPaymentController],
  providers: [FinanceService, LessonPaymentService, LessonPaymentCron],
  exports: [FinanceService, LessonPaymentService],
})
export class FinanceModule {}
