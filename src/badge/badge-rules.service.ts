import { Injectable } from '@nestjs/common';
import { BadgeCondition } from './interfaces/badge-condition.interface';
import { BadgeType } from './enum/badge-type.enum';
import { DonationRepo } from '../donation/donation.repository';
import { BadgeService } from './badge.service';

@Injectable()
export class BadgeRulesService {
  private readonly conditions: BadgeCondition[] = [
    {
      type: BadgeType.FIRST_DONATION,
      badgeId: 1,
      check: async (data: { userId: number; donationRepo: DonationRepo }) => {
        const donations = await data.donationRepo.findAllByUserId(data.userId);
        return donations.length === 1;
      },
    },
    {
      type: BadgeType.DONATION_MILESTONE,
      badgeId: 2,
      check: async (data: {
        userId: number;
        amount: number;
        tokenName: string;
      }) => {
        const tokenPrice = await this.getTokenPrice(data.tokenName);
        const vndAmount = data.amount * tokenPrice;
        console.log(vndAmount >= 1000000);
        // Check if the donation amount in VND is greater than or equal to 1,000,000
        return Promise.resolve(vndAmount >= 1000000);
      },
    },
    {
      type: BadgeType.REGULAR_DONOR,
      badgeId: 3,
      check: async (data: { userId: number; donationRepo: DonationRepo }) => {
        const donations = await data.donationRepo.findAllByUserId(data.userId);
        const monthlyDonations = this.countMonthlyDonations(donations);
        return monthlyDonations >= 3;
      },
    },
    {
      type: BadgeType.CAMPAIGN_CREATED,
      badgeId: 4,
      check: (data: { userId: number; campaign: any }) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return Promise.resolve(data.campaign.createdBy === data.userId);
      },
    },
  ];

  private countMonthlyDonations(donations: any[]): number {
    const monthlyDonationMap = new Map<string, number>();
    donations.forEach((donation) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const month = new Date(donation?.donatedAt).toISOString().slice(0, 7); // Extract year-month
      monthlyDonationMap.set(month, (monthlyDonationMap.get(month) || 0) + 1);
    });
    return Array.from(monthlyDonationMap.values()).filter((count) => count > 0)
      .length;
  }

  async checkAndAwardBadges(
    userId: number,
    type: BadgeType,
    data: any,
    badgeService: BadgeService,
  ) {
    const applicableConditions = this.conditions.filter((c) => c.type === type);
    for (const condition of applicableConditions) {
      const shouldAward = await condition.check(data);
      if (shouldAward) {
        await badgeService.awardBadgeToUser(userId, condition.badgeId);
      }
    }
  }
  async getTokenPrice(token: string): Promise<number> {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=vnd`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!data[token] || !data[token].vnd) {
        throw new Error(`Token ${token} not found`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return data[token].vnd;
    } catch (error) {
      console.error(`Failed to fetch ${token} price:`, error);
      throw new Error(`Could not fetch ${token} price`);
    }
  }
}
