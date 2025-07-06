import { Injectable, NotFoundException } from '@nestjs/common';
import { DonationService } from 'src/donation/donation.service';
import { MailerService } from 'src/mailer/mailer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCampaignProgressDto } from '../dto/create-campaign-progress.dto';
import { FindOneCampaignUseCase } from './find-one-campaign.use-case';

@Injectable()
export class AddCampaignProgressUseCase {
  constructor(
    private readonly findOneCampaignUseCase: FindOneCampaignUseCase,
    private readonly prisma: PrismaService,
    private readonly donationService: DonationService,
    private readonly mailerService: MailerService,
  ) {}

  async execute(campaignId: number, dto: CreateCampaignProgressDto) {
    const campaign = await this.findOneCampaignUseCase.execute(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const progress = await this.prisma.campaignProgress.create({
      data: {
        ...dto,
        campaign: {
          connect: { id: campaignId },
        },
      },
      include: {
        campaign: {
          include: {
            user: true,
          },
        },
      },
    });

    const donors =
      await this.donationService.findAllUserDonationByCampaignId(campaignId);

    await Promise.all(
      donors.map(async (donation) => {
        if (donation.user?.email) {
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
}
