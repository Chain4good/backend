import { Injectable, NotFoundException } from '@nestjs/common';
import { CampaignRepo } from '../campaign.repository';
import { GetCampaignDonationHistoryUseCase } from './get-campaign-donation-history.use-case';

@Injectable()
export class GenerateFinancialReportUseCase {
  constructor(
    private readonly campaignRepo: CampaignRepo,
    private readonly getCampaignDonationHistoryUseCase: GetCampaignDonationHistoryUseCase,
  ) {}

  async execute(campaignId: number) {
    const campaign = await this.campaignRepo.findOne(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const donationHistory =
      await this.getCampaignDonationHistoryUseCase.execute(campaignId, {});

    return {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      totalDonatedAmount: donationHistory.summary.totalAmount,
      totalDonationsCount: donationHistory.summary.totalDonations,
      averageDonationAmount: donationHistory.summary.averageAmount,
      detailedDonationHistory: donationHistory.data,
    };
  }
}
