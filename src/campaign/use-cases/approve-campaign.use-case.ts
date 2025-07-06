import { Injectable } from '@nestjs/common';
import { CampaignStatus } from '@prisma/client';
import { CampaignEmailService } from 'src/email/campaign-email.service';
import { CampaignRepo } from '../campaign.repository';
import { FindOneCampaignUseCase } from './find-one-campaign.use-case';
import { UpdateCampaignStatusUseCase } from './update-campaign-status.use-case';

interface CampaignWithRelations {
  id: number;
  title: string;
  description: string;
  status: string;
  name: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  category?: any;
  country?: any;
  cover?: any;
  images?: any[];
  donations?: any[];
}

@Injectable()
export class ApproveCampaignUseCase {
  constructor(
    private readonly findOneCampaignUseCase: FindOneCampaignUseCase,
    private readonly campaignRepo: CampaignRepo,
    private readonly campaignEmailService: CampaignEmailService,
    private readonly updateCampaignStatusUseCase: UpdateCampaignStatusUseCase,
  ) {}

  async execute(campaignId: number) {
    const campaign = (await this.findOneCampaignUseCase.execute(
      campaignId,
    )) as unknown as CampaignWithRelations;
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = 'APPROVED';
    await this.campaignRepo.update(campaignId, {
      status: 'APPROVED',
    });

    await this.campaignEmailService.sendCampaignApprovalEmail(
      campaign.user.email,
      campaign.name,
    );

    await this.updateCampaignStatusUseCase.execute(campaignId, {
      status: 'APPROVED' as CampaignStatus,
    });

    return campaign;
  }
}
