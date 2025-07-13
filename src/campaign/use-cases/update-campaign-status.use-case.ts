/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Campaign, CampaignStatus } from '@prisma/client';
import { CampaignEmailService } from 'src/email/campaign-email.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/types/notification.types';
import { CampaignRepo } from '../campaign.repository';
import { UpdateCampaignStatusDto } from '../dto/campaign.dto';

@Injectable()
export class UpdateCampaignStatusUseCase {
  constructor(
    private readonly campaignRepo: CampaignRepo,
    private readonly notificationService: NotificationService,
    private readonly campaignEmailService: CampaignEmailService,
  ) {}

  async execute(id: number, dto: UpdateCampaignStatusDto) {
    const currentCampaign = await this.campaignRepo.findOne(id, {
      user: true,
    });

    if (!currentCampaign) {
      throw new NotFoundException('Campaign not found');
    }

    const updatedCampaign = await this.campaignRepo.update(id, {
      status: dto.status,
    });

    await this.sendCampaignStatusNotification(
      currentCampaign,
      dto.status,
      dto.reason,
    );

    return updatedCampaign;
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
      NEED_VERIFICATION: `Chiến dịch "${campaign.title}" của bạn cần bổ sung thêm tài liệu xác minh.`,
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
