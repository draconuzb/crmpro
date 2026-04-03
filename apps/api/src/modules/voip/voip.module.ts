import { Module } from '@nestjs/common';
import { VoipController } from './voip.controller';
import { VoipService } from './voip.service';

@Module({
  controllers: [VoipController],
  providers: [VoipService],
  exports: [VoipService],
})
export class VoipModule {}
