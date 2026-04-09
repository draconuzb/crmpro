import { Module } from '@nestjs/common';
import { OnlineLessonController } from './online-lesson.controller';
import { OnlineLessonService } from './online-lesson.service';

@Module({
  controllers: [OnlineLessonController],
  providers: [OnlineLessonService],
  exports: [OnlineLessonService],
})
export class OnlineLessonModule {}
