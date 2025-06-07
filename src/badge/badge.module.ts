import { Module } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { UserBadgeRepository } from './user-badge.repository';
import { BadgeRepository } from './badge.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [BadgeService, BadgeRepository, UserBadgeRepository],
  exports: [BadgeService, BadgeRepository, UserBadgeRepository], // Export all required providers
})
export class BadgeModule {}
