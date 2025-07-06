import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GetCampaignProgressHistoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(campaignId: number) {
    const progresses = await this.prisma.campaignProgress.findMany({
      where: {
        campaignId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return progresses;
  }
}
