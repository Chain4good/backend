import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CampaignStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CampaignEmailService } from '../../email/campaign-email.service';

@Injectable()
export class CampaignMonitorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly campaignEmailService: CampaignEmailService,
  ) {}

  @Cron('0 * * * *')
  async handleCampaignChecks() {
    const now = new Date();
    const nearDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const campaigns = await this.prisma.campaign.findMany({
      where: {
        isClosed: false,
        status: {
          in: [CampaignStatus.APPROVED, CampaignStatus.ACTIVE],
        },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    for (const campaign of campaigns) {
      const goal = Number(campaign.goal);
      const total = Number(campaign.totalDonated);

      if (campaign.deadline <= now || total >= goal) {
        await this.prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: CampaignStatus.FINISHED, isClosed: true },
        });
        if (campaign.user?.email) {
          await this.campaignEmailService.sendCampaignCompletedEmail(
            campaign.user.email,
            campaign.title,
          );
        }
        continue;
      }

      if (campaign.deadline <= nearDeadline) {
        const diff = Math.ceil(
          (campaign.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (campaign.user?.email) {
          await this.campaignEmailService.sendDeadlineReminderEmail(
            campaign.user.email,
            campaign.title,
            diff,
          );
        }
      }
    }
  }
}
