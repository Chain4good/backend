import { Module } from '@nestjs/common';
import { BadgeRulesService } from './badge-rules.service';
import { BadgeController } from './badge.controller';
import { BadgeRepository } from './badge.repository';
import { BadgeService } from './badge.service';
import { UserBadgeRepository } from './user-badge.repository';

@Module({
  imports: [],
  controllers: [BadgeController],
  providers: [
    BadgeService,
    BadgeRepository,
    UserBadgeRepository,
    BadgeRulesService,
  ],
  exports: [
    BadgeService,
    BadgeRepository,
    UserBadgeRepository,
    BadgeRulesService,
  ],
})
export class BadgeModule {}
