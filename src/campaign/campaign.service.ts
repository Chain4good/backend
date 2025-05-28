/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignRepo } from './campaign.repository';
import { MailerService } from '../mailer/mailer.service';
import { CampaignStatus, Prisma } from '@prisma/client';

@Injectable()
export class CampaignService {
  constructor(
    private readonly campaignRepo: CampaignRepo,
    private readonly mailerService: MailerService,
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
        },
        {
          user: true,
        },
      );
      await this.mailerService.sendCampaignCreated(email, campaign.title);

      return campaign;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  findAll(
    userId?: number,
    email?: string,
    status?: CampaignStatus,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sort: 'asc' | 'desc' = 'desc',
    sortBy: string = 'createdAt',
    categoryId?: number,
    fundraiseTypeId?: number,
  ) {
    const where: Prisma.CampaignWhereInput = {
      ...(userId && { userId: Number(userId) }),
      ...(email && { user: { email } }),
      ...(status && { status: status }),
      ...(categoryId && { categoryId: Number(categoryId) }),
      ...(fundraiseTypeId && { fundraiseTypeId: Number(fundraiseTypeId) }),
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    const orderBy = {
      [sortBy]: sort,
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
      },
    });
  }

  findMyCampaigns(userId: number, page: number = 1, limit: number = 10) {
    return this.campaignRepo.paginate(page, limit, {
      where: { userId },
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

  findOne(id: number) {
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
          address: true,
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

  update(id: number, updateCampaignDto: UpdateCampaignDto) {
    // return this.campaignRepo.update(id, updateCampaignDto);
  }

  remove(id: number) {
    return this.campaignRepo.delete(id);
  }

  async calculateEthGoal(usdAmount: number): Promise<number> {
    // Add integration with an ETH price oracle service
    const ethPrice = await this.getEthPrice(); // USD/ETH
    return usdAmount / ethPrice;
  }

  private async getEthPrice(): Promise<number> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      );
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return data.ethereum.vnd;
    } catch (error) {
      console.error('Failed to fetch ETH price:', error);
      throw new Error('Could not fetch ETH price');
    }
  }
}
