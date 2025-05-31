/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  Inject,
  forwardRef,
  ConflictException,
} from '@nestjs/common';
import { DonationRepo } from '../donation.repository';
import { CampaignService } from '../../campaign/campaign.service';
import { CreateDonationDto } from '../dto/create-donation.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CreateDonationUseCase {
  constructor(
    private readonly donationRepo: DonationRepo,
    @Inject(forwardRef(() => CampaignService))
    private readonly campaignService: CampaignService,
  ) {}

  async execute(createDonationDto: CreateDonationDto & { userId: number }) {
    const { userId, campaignId, ...rest } = createDonationDto;

    const donation = await this.donationRepo.create({
      ...rest,
      user: {
        connect: { id: userId },
      },
      campaign: {
        connect: { id: campaignId },
      },
    });

    await this.campaignService.update(campaignId, {
      totalDonated: {
        increment: rest.amount,
      },
    } as any);

    return donation;
  }
}
