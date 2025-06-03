/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignRepo } from './campaign.repository';
import { MailerService } from '../mailer/mailer.service';
import { CampaignStatus, Prisma } from '@prisma/client';
import { AiService } from 'src/ai/ai.service';
import { DonationService } from 'src/donation/donation.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CampaignCreatedEvent } from './events/campaign-created.event';

@Injectable()
export class CampaignService {
  constructor(
    private readonly campaignRepo: CampaignRepo,
    private readonly mailerService: MailerService,
    private readonly aiService: AiService,
    private readonly donationService: DonationService,
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
    countryId?: number,
  ) {
    const where: Prisma.CampaignWhereInput = {
      ...(userId && { userId: Number(userId) }),
      ...(email && { user: { email } }),
      ...(status && { status: status }),
      ...(categoryId && { categoryId: Number(categoryId) }),
      ...(fundraiseTypeId && { fundraiseTypeId: Number(fundraiseTypeId) }),
      ...(countryId && { countryId: Number(countryId) }),
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
        // donations: {}
        _count: {
          select: {
            donations: true,
          },
        },
      },
    });
  }

  findMyCampaigns(
    userId: number,
    page: number = 1,
    limit: number = 10,
    status: CampaignStatus,
  ) {
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

    if (updateCampaignDto.status === 'FINISHED') {
      const campaign = await this.campaignRepo.findOne(id);
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      const donations =
        await this.donationService.findAllUserDonationByCampaignId(id);
      if (donations.length === 0) {
        throw new Error('No donations found');
      }
      const aiContent = await this.aiService.generateThankYouLetter(
        campaign.title,
      );
      await Promise.all(
        donations.map(async (donation) => {
          if (donation.user?.name || donation.user?.email) {
            try {
              if (
                donation.user.email &&
                aiContent.subject &&
                aiContent.content
              ) {
                await this.mailerService.sendCustomThankYouEmail(
                  donation.user.email,
                  aiContent.subject,
                  aiContent.content,
                );
              }
            } catch (error) {
              console.error('Failed to generate thank you letter:', error);
            }
          }
        }),
      );
    }

    return this.campaignRepo.update(id, data);
  }

  remove(id: number) {
    return this.campaignRepo.delete(id);
  }

  async calculateEthGoal(vndAmount: number): Promise<number> {
    const ethPrice = await this.getEthPrice();
    return vndAmount / ethPrice;
  }

  private async getEthPrice(): Promise<number> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=vnd',
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
