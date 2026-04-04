import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BranchModule } from './modules/branch/branch.module';
import { UserModule } from './modules/user/user.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { StudentModule } from './modules/student/student.module';
import { GroupModule } from './modules/group/group.module';
import { CourseModule } from './modules/course/course.module';
import { LeadModule } from './modules/lead/lead.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { RatingModule } from './modules/rating/rating.module';
import { ReportModule } from './modules/report/report.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { SmsModule } from './modules/sms/sms.module';
import { VoipModule } from './modules/voip/voip.module';
import { RoomModule } from './modules/room/room.module';
import { TagModule } from './modules/tag/tag.module';
import { GradeModule } from './modules/grade/grade.module';
import { ExamModule } from './modules/exam/exam.module';
import { FormModule } from './modules/form/form.module';
import { BlogModule } from './modules/blog/blog.module';
import { HolidayModule } from './modules/holiday/holiday.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { SettingsModule } from './modules/settings/settings.module';

// CRMPro new modules
import { KpiModule } from './modules/kpi/kpi.module';
import { HrModule } from './modules/hr/hr.module';
import { AiModule } from './modules/ai/ai.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { DailyReportModule } from './modules/daily-report/daily-report.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { ProblemModule } from './modules/problem/problem.module';
import { MeModule } from './modules/me/me.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BranchModule,
    UserModule,
    TeacherModule,
    StudentModule,
    GroupModule,
    CourseModule,
    LeadModule,
    AttendanceModule,
    FinanceModule,
    ReminderModule,
    RatingModule,
    ReportModule,
    GamificationModule,
    SmsModule,
    VoipModule,
    RoomModule,
    TagModule,
    GradeModule,
    ExamModule,
    FormModule,
    BlogModule,
    HolidayModule,
    ScheduleModule,
    SettingsModule,

    // CRMPro new modules
    KpiModule,
    HrModule,
    AiModule,
    PdfModule,
    DailyReportModule,
    SchedulerModule,
    ProblemModule,
    MeModule,
    NotificationModule,
  ],
})
export class AppModule {}
