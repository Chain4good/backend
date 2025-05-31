import { Module, forwardRef } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CampaignRepo } from './campaign.repository';
import { MailerModule } from '../mailer/mailer.module';
import { AiModule } from '../ai/ai.module';
import { DonationModule } from '../donation/donation.module';

@Module({
  imports: [MailerModule, AiModule, forwardRef(() => DonationModule)],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignRepo],
  exports: [CampaignService],
})
export class CampaignModule {}
