/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';

import { CampaignRepo } from './campaign.repository';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CampaignCreatedEvent } from './events/campaign-created.event';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(
    private readonly campaignRepo: CampaignRepo,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createCampaignDto: CreateCampaignDto & { userId: number; email: string },
  ) {
    try {
      const {
        images,
        userId,
        categoryId,
        countryId,
        coverId,
        fundraiseTypeId,
        email,
        ...rest
      } = createCampaignDto;

      const ethGoal = await this.calculateEthGoal(rest.goal);

      const campaign = await this.campaignRepo.create(
        {
          ...rest,
          user: { connect: { id: userId } },
          category: { connect: { id: categoryId } },
          images: {
            create: images.map((url) => ({ url, type: 'IMAGE' })),
          },
          country: { connect: { id: countryId } },
          cover: { connect: { id: coverId } },
          fundraiseType: { connect: { id: fundraiseTypeId } },
          deadline: new Date(rest.deadline),
          ethGoal,
        },
        {
          user: true,
        },
      );

      this.eventEmitter.emit(
        'campaign.created',
        new CampaignCreatedEvent(campaign.title, email, campaign.id),
      );

      return campaign;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async calculateEthGoal(vndAmount: number): Promise<number> {
    const ethPrice = await this.getEthPrice();
    return vndAmount / ethPrice;
  }

  async calculateGoal(vndAmount: number, token: string): Promise<number> {
    const tokenPrice = await this.getTokenPrice(token);
    return vndAmount / tokenPrice;
  }

  async getEthPrice(): Promise<number> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=vnd',
      );
      const data = await response.json();

      return data.ethereum.vnd;
    } catch (error) {
      console.error('Failed to fetch ETH price:', error);
      throw new Error('Could not fetch ETH price');
    }
  }

  async getTokenPrice(token: string): Promise<number> {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=vnd`,
      );
      const data = await response.json();
      if (!data[token] || !data[token].vnd) {
        throw new Error(`Token ${token} not found`);
      }
      return data[token].vnd;
    } catch (error) {
      console.error(`Failed to fetch ${token} price:`, error);
      throw new Error(`Could not fetch ${token} price`);
    }
  }

  async update(id: number, updateCampaignDto: UpdateCampaignDto) {
    const { images, ...rest } = updateCampaignDto;

    const data: Prisma.CampaignUpdateInput = {
      ...rest,
      ...(images && images.length > 0
        ? {
            images: {
              connect: images.map((id) => ({ id: Number(id) })),
            },
          }
        : {}),
    };

    return this.campaignRepo.update(id, data);
  }
}
