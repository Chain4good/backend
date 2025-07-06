import { Injectable } from '@nestjs/common';
import { CampaignRepo } from '../campaign.repository';
import { FindMyCampaignDto } from '../dto/campaign.dto';

@Injectable()
export class FindMyCampaignUseCase {
  constructor(private readonly campaignRepo: CampaignRepo) {}

  async execute(userId: number, dto: FindMyCampaignDto) {
    const { page, limit, status } = dto;
    return this.campaignRepo.paginate(page, limit, {
      where: { userId, ...(status && { status }) },
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
        category: true,
        country: true,
        cover: true,
        images: true,
        fundraiseType: true,
      },
    });
  }
}
