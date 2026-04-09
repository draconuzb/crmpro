import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegrafModule } from 'nestjs-telegraf';
import { Scenes, session } from 'telegraf';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { ApiClientService } from './api-client.service';
import { AuthService } from './auth/auth.service';
import { ReportHandler } from './reports/report.handler';
import { BotCronService } from './cron/cron.service';

// Scene factories
import { createLeadsScene } from './scenes/leads.scene';
import { createFinanceScene } from './scenes/finance.scene';
import { createAttendanceScene } from './scenes/attendance.scene';
import { createDebtorsScene } from './scenes/debtors.scene';
import { createProblemsScene } from './scenes/problems.scene';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    ScheduleModule.forRoot(),
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: process.env.TELEGRAM_BOT_TOKEN || '',
        launchOptions: {
          dropPendingUpdates: true,
        },
        middlewares: [
          session(),
          // Stage middleware will be set up in bot.service
        ],
      }),
    }),
  ],
  providers: [
    BotUpdate,
    BotService,
    ApiClientService,
    AuthService,
    ReportHandler,
    BotCronService,
  ],
})
export class BotModule {}
