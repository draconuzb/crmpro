import { Module } from '@nestjs/common';
import { GradeController } from './grade.controller';
import { GradeService } from './grade.service';

@Module({
  controllers: [GradeController],
  providers: [GradeService],
  exports: [GradeService],
})
export class GradeModule {}
