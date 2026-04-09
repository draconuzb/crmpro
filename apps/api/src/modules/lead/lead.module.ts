import { Module } from '@nestjs/common';
import { LeadController, LeadStageController } from './lead.controller';
import { LeadService } from './lead.service';

@Module({
  controllers: [LeadStageController, LeadController],
  providers: [LeadService],
  exports: [LeadService],
})
export class LeadModule {}
