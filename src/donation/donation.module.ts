import { Module, forwardRef } from '@nestjs/common';
import { CampaignModule } from '../campaign/campaign.module';
import { DonationRepo } from './donation.repository';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';
import { CreateDonationUseCase } from './use-cases/create-donation.use-case';
import { UsersModule } from '../users/users.module';
import { NotificationModule } from '../notification/notification.module';
import { BadgeModule } from '../badge/badge.module';

@Module({
  imports: [
    forwardRef(() => CampaignModule),
    UsersModule,
    NotificationModule,
    BadgeModule,
  ],
  controllers: [DonationController],
  providers: [DonationService, DonationRepo, CreateDonationUseCase],
  exports: [DonationService],
})
export class DonationModule {}
