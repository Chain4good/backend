import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentRepo } from './comment.repository';
import { LikeRepo } from './like.repository';
import { CampaignModule } from 'src/campaign/campaign.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [CampaignModule, NotificationModule, UsersModule],
  controllers: [CommentController],
  providers: [CommentService, CommentRepo, LikeRepo],
})
export class CommentModule {}
