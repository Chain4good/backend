import { Module, forwardRef } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AiModule } from '../ai/ai.module';
import { DonationModule } from '../donation/donation.module';
import { CampaignEmailService } from 'src/email/campaign-email.service';
import { MailerModule } from '../mailer/mailer.module';
import { NotificationModule } from '../notification/notification.module';
import { UsersModule } from '../users/users.module';
import { CampaignController } from './campaign.controller';
import { CampaignRepo } from './campaign.repository';
import { CampaignService } from './campaign.service';
import { CampaignCreatedListener } from './listeners/campaign-created.listener';
import {
  AddCampaignProgressUseCase,
  ApproveCampaignUseCase,
  FindAllCampaignUseCase,
  FindAllCampaignValidUseCase,
  FindMyCampaignUseCase,
  FindOneCampaignUseCase,
  GenerateFinancialReportUseCase,
  GetCampaignDonationHistoryUseCase,
  GetCampaignProgressHistoryUseCase,
  RejectCampaignUseCase,
  RemoveCampaignUseCase,
  UpdateCampaignStatusUseCase,
  UpdateCampaignUseCase,
} from './use-cases';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MailerModule,
    forwardRef(() => AiModule),
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
    FindAllCampaignUseCase,
    FindAllCampaignValidUseCase,
    FindMyCampaignUseCase,
    FindOneCampaignUseCase,
    UpdateCampaignUseCase,
    RemoveCampaignUseCase,
    UpdateCampaignStatusUseCase,
    ApproveCampaignUseCase,
    RejectCampaignUseCase,
    AddCampaignProgressUseCase,
    GetCampaignProgressHistoryUseCase,
    GetCampaignDonationHistoryUseCase,
    GenerateFinancialReportUseCase,
  ],
  exports: [CampaignService, FindOneCampaignUseCase],
})
export class CampaignModule {}
