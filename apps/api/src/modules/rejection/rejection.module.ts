import { Module } from '@nestjs/common';
import { RejectionController } from './rejection.controller';
import { RejectionService } from './rejection.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RejectionController],
  providers: [RejectionService],
  exports: [RejectionService],
})
export class RejectionModule {}
