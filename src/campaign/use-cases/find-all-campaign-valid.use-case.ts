import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CampaignRepo } from '../campaign.repository';
import { FindAllCampaignValidDto } from '../dto/campaign.dto';

@Injectable()
export class FindAllCampaignValidUseCase {
  constructor(private readonly campaignRepo: CampaignRepo) {}

  async execute(dto: FindAllCampaignValidDto) {
    const { page, limit, ...filter } = dto;
    const where: Prisma.CampaignWhereInput = {
      status: { in: ['ACTIVE', 'FINISHED'] },
    };

    if (filter.userId) {
      where.userId = Number(filter.userId);
    }

    if (filter.email) {
      where.user = { email: filter.email };
    }

    if (filter.categoryId) {
      where.categoryId = Number(filter.categoryId);
    }

    if (filter.fundraiseTypeId) {
      where.fundraiseTypeId = Number(filter.fundraiseTypeId);
    }

    if (filter.countryId) {
      where.countryId = Number(filter.countryId);
    }

    if (filter.search) {
      where.OR = [
        {
          title: {
            contains: filter.search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          description: {
            contains: filter.search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    const orderBy = {
      [filter.sortBy || 'createdAt']: filter.sort,
    };

    return this.campaignRepo.paginate(page, limit, {
      where,
      orderBy,
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
        _count: {
          select: {
            donations: true,
          },
        },
      },
    });
  }
}
