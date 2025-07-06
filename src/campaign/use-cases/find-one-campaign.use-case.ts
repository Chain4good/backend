import { Injectable } from '@nestjs/common';
import { CampaignRepo } from '../campaign.repository';

@Injectable()
export class FindOneCampaignUseCase {
  constructor(private readonly campaignRepo: CampaignRepo) {}

  async execute(id: number) {
    return this.campaignRepo.findOne(id, {
      category: true,
      country: true,
      cover: true,
      images: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          UserBadge: {
            select: {
              badge: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  iconUrl: true,
                },
              },
            },
          },
        },
      },
      donations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              address: true,
            },
          },
        },
      },
    });
  }
}
