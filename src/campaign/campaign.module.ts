import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { CampaignRepo } from './campaign.repository';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [MailerModule],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignRepo],
})
export class CampaignModule {}
