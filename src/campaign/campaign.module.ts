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
import { CampaignEmailService } from 'src/email/campaign-email.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MailerModule,
    forwardRef(() => AiModule), // Add forwardRef here
    UsersModule,
    forwardRef(() => DonationModule),
    NotificationModule,
  ],
  controllers: [CampaignController],
  providers: [
    CampaignService,
    CampaignRepo,
    CampaignCreatedListener,
    CampaignEmailService,
  ],
  exports: [CampaignService],
})
export class CampaignModule {}
