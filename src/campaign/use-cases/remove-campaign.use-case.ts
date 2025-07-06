import { Injectable } from '@nestjs/common';
import { CampaignRepo } from '../campaign.repository';

@Injectable()
export class RemoveCampaignUseCase {
  constructor(private readonly campaignRepo: CampaignRepo) {}

  async execute(id: number) {
    return this.campaignRepo.delete(id);
  }
}
