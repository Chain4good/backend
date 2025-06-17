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

  async execute(
    createDonationDto: CreateDonationDto & {
      userId: number;
      tokenName?: string;
    },
  ) {
    const { userId, campaignId, tokenName, ...rest } = createDonationDto;

    try {
      // Add donatedAt field with current timestamp
      const donation = await this.donationRepo.create({
        ...rest,
        donatedAt: new Date(), // Add this line
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Donation already exists');
        }
      }
      throw error;
    }
  }
}
