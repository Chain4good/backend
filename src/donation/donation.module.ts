import { Module, forwardRef } from '@nestjs/common';
import { CampaignModule } from '../campaign/campaign.module';
import { DonationRepo } from './donation.repository';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';
import { CreateDonationUseCase } from './use-cases/create-donation.use-case';
import { UsersModule } from '../users/users.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [forwardRef(() => CampaignModule), UsersModule, NotificationModule],
  controllers: [DonationController],
  providers: [DonationService, DonationRepo, CreateDonationUseCase],
  exports: [DonationService],
})
export class DonationModule {}
