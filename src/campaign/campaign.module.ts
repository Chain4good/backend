import { Module, forwardRef } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CampaignRepo } from './campaign.repository';
import { MailerModule } from '../mailer/mailer.module';
import { AiModule } from '../ai/ai.module';
import { DonationModule } from '../donation/donation.module';
import { UsersModule } from '../users/users.module';
import { CampaignCreatedListener } from './listeners/campaign-created.listener';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MailerModule,
    forwardRef(() => AiModule), // Add forwardRef here
    UsersModule,
    forwardRef(() => DonationModule),
  ],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignRepo, CampaignCreatedListener],
  exports: [CampaignService],
})
export class CampaignModule {}
