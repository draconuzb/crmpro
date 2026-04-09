import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CrmSyncService } from './crm-sync.service';
import { CrmSyncController } from './crm-sync.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [CrmSyncController],
  providers: [CrmSyncService],
  exports: [CrmSyncService],
})
export class CrmSyncModule {}
