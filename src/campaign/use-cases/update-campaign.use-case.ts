import { Injectable, NotFoundException } from '@nestjs/common';
import { Campaign, CampaignStatus, Prisma } from '@prisma/client';
import { AiService } from 'src/ai/ai.service';
import { DonationService } from 'src/donation/donation.service';
import { CampaignEmailService } from 'src/email/campaign-email.service';
import { MailerService } from 'src/mailer/mailer.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/types/notification.types';
import { CampaignRepo } from '../campaign.repository';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';

@Injectable()
export class UpdateCampaignUseCase {
  constructor(
    private readonly campaignRepo: CampaignRepo,
    private readonly mailerService: MailerService,
    private readonly aiService: AiService,
    private readonly donationService: DonationService,
    private readonly campaignEmailService: CampaignEmailService,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(id: number, dto: UpdateCampaignDto) {
    const currentCampaign = await this.campaignRepo.findOne(id, {
      user: true,
    });

    if (!currentCampaign) {
      throw new NotFoundException('Campaign not found');
    }

    const { images, ...rest } = dto;

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

    if (dto.status && dto.status !== currentCampaign.status) {
      await this.sendCampaignStatusNotification(currentCampaign, dto.status);
    }

    if (dto.status === 'FINISHED') {
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

  private async sendCampaignStatusNotification(
    campaign: Campaign & { user?: { email?: string; name?: string } },
    newStatus: CampaignStatus,
    reason?: string,
  ) {
    const statusMessages = {
      APPROVED: `Chiến dịch "${campaign.title}" của bạn đã được phê duyệt và có thể bắt đầu gây quỹ.`,
      REJECTED: `Chiến dịch "${campaign.title}" của bạn đã bị từ chối. Vui lòng kiểm tra lại nội dung và gửi lại.`,
      ACTIVE: `Chiến dịch "${campaign.title}" của bạn đã được kích hoạt và đang hoạt động.`,
      FINISHED: `Chiến dịch "${campaign.title}" của bạn đã kết thúc thành công.`,
      CANCELLED: `Chiến dịch "${campaign.title}" của bạn đã bị hủy bởi quản trị viên.`,
      PENDING: `Chiến dịch "${campaign.title}" của bạn đang chờ xét duyệt.`,
      DRAFT: `Chiến dịch "${campaign.title}" của bạn đã được chuyển về trạng thái nháp.`,
    };

    const content =
      statusMessages[newStatus] ||
      `Trạng thái chiến dịch "${campaign.title}" đã được cập nhật.`;

    try {
      await this.notificationService.createAndSendNotification({
        userId: campaign.userId,
        type: NotificationType.CAMPAIGN_STATUS,
        content,
        metadata: {
          campaignId: campaign.id,
          status: newStatus,
          campaignTitle: campaign.title,
          reason,
        },
      });

      if (campaign.user?.email && campaign.user?.name) {
        await this.campaignEmailService.sendCampaignStatusUpdateEmail(
          campaign.user.email,
          campaign.title,
          campaign.user.name,
          newStatus,
          campaign.id,
          reason,
        );
      }
    } catch (error) {
      console.error('Failed to send campaign status notification:', error);
    }
  }
}
