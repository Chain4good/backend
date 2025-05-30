import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentRepo } from './comment.repository';

@Module({
  controllers: [CommentController],
  providers: [CommentService, CommentRepo],
})
export class CommentModule {}
