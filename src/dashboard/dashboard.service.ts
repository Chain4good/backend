import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      totalCampaigns,
      totalDonations,
      totalAmount,
      activeCampaigns,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.campaign.count(),
      this.prisma.donation.count(),
      this.prisma.donation.aggregate({
        _sum: {
          amount: true,
        },
      }),
      this.prisma.campaign.count({
        where: {
          status: CampaignStatus.ACTIVE,
        },
      }),
    ]);

    return {
      totalUsers,
      totalCampaigns,
      totalDonations,
      totalAmount: totalAmount._sum.amount || 0,
      activeCampaigns,
    };
  }

  async getCampaignStats(days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const campaigns = await this.prisma.campaign.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    return campaigns;
  }

  async getDonationStats(days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const donations = await this.prisma.donation.findMany({
      where: {
        donatedAt: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        donatedAt: true,
      },
      orderBy: {
        donatedAt: 'asc',
      },
    });

    return donations;
  }

  async getRecentActivities(limit: number) {
    const activities = await this.prisma.donation.findMany({
      take: limit,
      orderBy: {
        donatedAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        campaign: {
          select: {
            title: true,
          },
        },
      },
    });

    return activities;
  }

  async getTopCampaigns(limit: number) {
    return this.prisma.campaign.findMany({
      take: limit,
      orderBy: {
        totalDonated: 'desc',
      },
      include: {
        _count: {
          select: {
            donations: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async getUserGrowth(days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
      orderBy: {
        createdAt: 'asc',
      },
    });

    return users;
  }
}
