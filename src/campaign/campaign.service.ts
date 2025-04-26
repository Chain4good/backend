import { Injectable } from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { Campaign, Prisma } from '@prisma/client';

@Injectable()
export class CampaignService {
  constructor(private readonly campaignRepository: CampaignRepository) {
    // Constructor logic can go here if needed
  }

  async createCampaign(data: Prisma.CampaignCreateInput): Promise<Campaign> {
    try {
      const campaign = await this.campaignRepository.create(data);
      if (!campaign) {
        throw new Error('Failed to create campaign');
      }
      return campaign;
    } catch (error) {
      throw new Error(`Error creating campaign: ${error}`);
    }
  }
}
