/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CampaignStatus, Prisma } from '@prisma/client';
import { AiService } from 'src/ai/ai.service';
import { DonationService } from 'src/donation/donation.service';
import { CampaignEmailService } from 'src/email/campaign-email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { CampaignRepo } from './campaign.repository';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignCreatedEvent } from './events/campaign-created.event';
import { CreateCampaignProgressDto } from './dto/create-campaign-progress.dto';

interface CampaignWithRelations {
  id: number;
  title: string;
  description: string;
  status: string;
  name: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  category?: any;
  country?: any;
  cover?: any;
  images?: any[];
  donations?: any[];
}

@Injectable()
export class CampaignService {
  constructor(
    private readonly campaignRepo: CampaignRepo,
    private readonly mailerService: MailerService,
    private readonly aiService: AiService,
    private readonly donationService: DonationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
    private readonly campaignEmailService: CampaignEmailService,
  ) {}

  async create(
    createCampaignDto: CreateCampaignDto & {
      userId: number;
      email: string;
      tokenSymbol?: string;
    },
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

      const ethGoal = await this.getPrice(rest.tokenSymbol || 'ETH');

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

  findAllValid(
    userId?: number,
    email?: string,
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
      ...{ status: { in: ['ACTIVE', 'FINISHED'] } },
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

  async calculateEthGoal(
    vndAmount: number,
    tokenSymbol: string,
  ): Promise<number> {
    const ethPrice = await this.getPrice(tokenSymbol);
    return vndAmount / ethPrice;
  }

  async getPrice(tokenSymbol: string): Promise<number> {
    try {
      if (!tokenSymbol) {
        throw new Error('Token symbol is required');
      }
      const mapSymbol = {
        ETH: 'ethereum',
        BTC: 'bitcoin',
        USDT: 'tether',
        BNB: 'binancecoin',
        XRP: 'ripple',
        ADA: 'cardano',
        SOL: 'solana',
        DOT: 'polkadot',
        DOGE: 'dogecoin',
        MATIC: 'matic-network',
        TRX: 'tron',
        LTC: 'litecoin',
        AVAX: 'avalanche-2',
        USDC: 'usd-coin',
        LINK: 'chainlink',
      };

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${mapSymbol[tokenSymbol.toUpperCase()]}&vs_currencies=vnd`,
      );
      const data = await response.json();
      console.log('Price data:', data);
      return data[mapSymbol[tokenSymbol.toUpperCase()]].vnd;
    } catch (error) {
      console.error('Failed to fetch price:', error);
      throw new Error('Could not fetch price');
    }
  }

  async getDonationHistory(
    campaignId: number,
    startDate?: Date,
    endDate?: Date,
    groupBy: 'day' | 'week' | 'month' = 'day',
  ) {
    let grouping;
    switch (groupBy) {
      case 'week':
        grouping = `date_trunc('week', "donatedAt")`;
        break;
      case 'month':
        grouping = `date_trunc('month', "donatedAt")`;
        break;
      default: // day
        grouping = `date_trunc('day', "donatedAt")`;
    }

    const donationHistory = await this.prisma.$queryRaw<
      { date: string; count: number; total_amount: number }[]
    >`
      SELECT 
        ${Prisma.raw(grouping)} as date,
        COUNT(*)::int as count,
        SUM(amount)::float as total_amount
      FROM "Donation"
      WHERE "campaignId" = ${campaignId}
        ${startDate ? Prisma.sql`AND "donatedAt" >= ${startDate}` : Prisma.empty}
        ${endDate ? Prisma.sql`AND "donatedAt" <= ${endDate}` : Prisma.empty}
      GROUP BY ${Prisma.raw(grouping)}
      ORDER BY ${Prisma.raw(grouping)} ASC
    `;

    const result = this.fillMissingDates(
      donationHistory,
      startDate || new Date(donationHistory[0]?.date),
      endDate || new Date(),
      groupBy,
    );

    return {
      data: result,
      summary: {
        totalDonations: result.reduce((sum, item) => sum + item.count, 0),
        totalAmount: result.reduce((sum, item) => sum + item.total_amount, 0),
        averageAmount:
          result.reduce((sum, item) => sum + item.total_amount, 0) /
            result.reduce((sum, item) => sum + item.count, 0) || 0,
      },
    };
  }

  private fillMissingDates(
    data: any[],
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month',
  ) {
    const result: { date: Date; count: number; total_amount: number }[] = [];
    const current = new Date(startDate);
    const dataMap = new Map(
      data.map((item) => [new Date(item.date).getTime(), item]),
    );

    while (current <= endDate) {
      const time = current.getTime();
      const existingData = dataMap.get(time);

      result.push({
        date: new Date(time),
        count: existingData?.count || 0,
        total_amount: existingData?.total_amount || 0,
      });

      switch (groupBy) {
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
        default: // day
          current.setDate(current.getDate() + 1);
      }
    }

    return result;
  }

  async approveCampaign(campaignId: number) {
    const campaign = (await this.findOne(
      campaignId,
    )) as unknown as CampaignWithRelations;
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    campaign.status = 'APPROVED';
    await this.campaignRepo.update(campaignId, {
      status: 'APPROVED',
    });

    await this.campaignEmailService.sendCampaignApprovalEmail(
      campaign.user.email,
      campaign.name,
    );

    return campaign;
  }

  async rejectCampaign(campaignId: number, reason?: string) {
    const campaign = (await this.findOne(
      campaignId,
    )) as unknown as CampaignWithRelations;
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = 'REJECTED';
    await this.campaignRepo.update(campaignId, {
      status: 'REJECTED',
    });

    if (!campaign.user?.email) {
      throw new Error('Campaign user email not found');
    }

    await this.campaignEmailService.sendCampaignRejectionEmail(
      campaign.user.email,
      campaign.name,
      reason,
    );

    return campaign;
  }

  async addProgress(
    campaignId: number,
    createProgressDto: CreateCampaignProgressDto,
  ) {
    // Kiểm tra campaign có tồn tại
    const campaign = await this.findOne(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Tạo progress mới
    const progress = await this.prisma.campaignProgress.create({
      data: {
        ...createProgressDto,
        campaign: {
          connect: { id: campaignId },
        },
      },
      include: {
        campaign: {
          select: {
            title: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    // Gửi email thông báo cho người donate
    const donations =
      await this.donationService.findAllUserDonationByCampaignId(campaignId);

    // Gửi email tới tất cả người đã donate
    await Promise.all(
      donations.map(async (donation) => {
        if (donation.user?.email) {
          // await this.mailerService.sendMail({
          //   to: donation.user.email,
          //   subject: `Cập nhật mới từ chiến dịch: ${campaign.title}`,
          //   template: 'campaign-progress-update',
          //   context: {
          //     campaignTitle: campaign.title,
          //     progressTitle: progress.title,
          //     progressDescription: progress.description,
          //     images: progress.images,
          //     documents: progress.documents,
          //     date: progress.createdAt,
          //   },
          // });
          await this.mailerService.sendMail(
            donation.user.email,
            `Cập nhật mới từ chiến dịch: ${campaign.title}`,
            'campaign-progress-update',
            {
              campaignTitle: campaign.title,
              progressTitle: progress.title,
              progressDescription: progress.description,
              images: progress.images,
              documents: progress.documents,
              date: progress.createdAt,
            },
          );
        }
      }),
    );

    return progress;
  }

  async getProgressHistory(campaignId: number) {
    return this.prisma.campaignProgress.findMany({
      where: {
        campaignId: campaignId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
