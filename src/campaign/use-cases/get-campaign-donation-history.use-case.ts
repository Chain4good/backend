import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetCampaignDonationHistoryDto } from '../dto/campaign.dto';

@Injectable()
export class GetCampaignDonationHistoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(campaignId: number, dto: GetCampaignDonationHistoryDto) {
    const { startDate, endDate, groupBy } = dto;
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
        ${Prisma.raw(grouping as string)} as date,
        COUNT(*)::int as count,
        SUM(amount)::float as total_amount
      FROM "Donation"
      WHERE "campaignId" = ${campaignId}
        ${startDate ? Prisma.sql`AND "donatedAt" >= ${startDate}` : Prisma.empty}
        ${endDate ? Prisma.sql`AND "donatedAt" <= ${endDate}` : Prisma.empty}
      GROUP BY ${Prisma.raw(grouping as string)}
      ORDER BY ${Prisma.raw(grouping as string)} ASC
    `;

    const result = this.fillMissingDates(
      donationHistory,
      startDate || new Date(donationHistory[0]?.date),
      endDate || new Date(),
      groupBy || 'day',
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
    data: { date: string; count: number; total_amount: number }[],
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
}
