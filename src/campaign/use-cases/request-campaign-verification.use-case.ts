import { Injectable } from '@nestjs/common';
import { CampaignStatus } from '@prisma/client';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/types/notification.types';
import { CampaignEmailService } from 'src/email/campaign-email.service';
import { CampaignRepo } from '../campaign.repository';
import { RequestVerificationDto } from '../dto/campaign.dto';
import { FindOneCampaignUseCase } from './find-one-campaign.use-case';
import { UpdateCampaignStatusUseCase } from './update-campaign-status.use-case';
import { PrismaService } from 'src/prisma/prisma.service';
import { CampaignAuditService } from '../services/campaign-audit.service';

interface CampaignWithRelations {
  id: number;
  title: string;
  description: string;
  status: string;
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
export class RequestCampaignVerificationUseCase {
  constructor(
    private readonly findOneCampaignUseCase: FindOneCampaignUseCase,
    private readonly campaignRepo: CampaignRepo,
    private readonly campaignEmailService: CampaignEmailService,
    private readonly updateCampaignStatusUseCase: UpdateCampaignStatusUseCase,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
    private readonly auditService: CampaignAuditService,
  ) {}

  async execute(
    campaignId: number,
    adminId: number,
    dto: RequestVerificationDto,
  ) {
    const campaign = (await this.findOneCampaignUseCase.execute(
      campaignId,
    )) as unknown as CampaignWithRelations;

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Create verification request record
    const verificationRequest =
      await this.prisma.campaignVerificationRequest.create({
        data: {
          message: dto.message,
          reason: dto.reason,
          adminId,
          campaignId,
        },
      });

    // Update campaign status to NEED_VERIFICATION
    await this.updateCampaignStatusUseCase.execute(campaignId, {
      status: CampaignStatus.NEED_VERIFICATION,
      reason: dto.reason,
    });

    // Send notification to campaign owner
    await this.notificationService.createAndSendNotification({
      userId: campaign.user.id,
      type: NotificationType.VERIFICATION_REQUEST,
      content: `Chiến dịch "${campaign.title}" cần bổ sung thêm tài liệu xác minh. ${dto.message}`,
      metadata: {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        verificationRequestId: verificationRequest.id,
        adminMessage: dto.message,
        reason: dto.reason,
      },
    });

    // Send email notification
    if (campaign.user?.email && campaign.user?.name) {
      await this.campaignEmailService.sendVerificationRequestEmail(
        campaign.user.email,
        campaign.title,
        campaign.user.name,
        dto.message,
        campaign.id,
        dto.reason,
      );
    }

    // Log audit trail
    await this.auditService.logVerificationRequest(
      campaign.id,
      adminId,
      dto.message,
      dto.reason,
    );

    return {
      campaign,
      verificationRequest,
      message: 'Verification request sent successfully',
    };
  }
}
