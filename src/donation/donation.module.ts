import { Module, forwardRef } from '@nestjs/common';
import { CampaignModule } from '../campaign/campaign.module';
import { DonationRepo } from './donation.repository';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';
import { CreateDonationUseCase } from './use-cases/create-donation.use-case';

@Module({
  imports: [forwardRef(() => CampaignModule)],
  controllers: [DonationController],
  providers: [DonationService, DonationRepo, CreateDonationUseCase],
  exports: [DonationService],
})
export class DonationModule {}
