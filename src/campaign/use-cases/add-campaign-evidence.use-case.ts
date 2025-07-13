import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CampaignStatus } from '@prisma/client';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/types/notification.types';
import { CampaignEmailService } from 'src/email/campaign-email.service';
import { AddEvidenceDto } from '../dto/campaign.dto';
import { FindOneCampaignUseCase } from './find-one-campaign.use-case';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
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
export class AddCampaignEvidenceUseCase {
  constructor(
    private readonly findOneCampaignUseCase: FindOneCampaignUseCase,
    private readonly notificationService: NotificationService,
    private readonly campaignEmailService: CampaignEmailService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly auditService: CampaignAuditService,
  ) {}

  async execute(campaignId: number, userId: number, dto: AddEvidenceDto) {
    const campaign = (await this.findOneCampaignUseCase.execute(
      campaignId,
    )) as unknown as CampaignWithRelations;

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Check if user owns the campaign
    if (campaign.user.id !== userId) {
      throw new ForbiddenException(
        'You can only add evidence to your own campaigns',
      );
    }

    // Check if campaign has pending verification requests
    const pendingVerificationRequest =
      await this.prisma.campaignVerificationRequest.findFirst({
        where: {
          campaignId,
          isResolved: false,
        },
        include: {
          admin: true,
        },
      });

    if (!pendingVerificationRequest) {
      throw new NotFoundException(
        'No pending verification request found for this campaign',
      );
    }

    // Create evidence response
    const evidenceResponse = await this.prisma.campaignEvidenceResponse.create({
      data: {
        description: dto.description,
        documents: dto.documents,
        verificationRequestId: pendingVerificationRequest.id,
      },
    });

    // Update campaign status back to PENDING for admin review
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.PENDING },
    });

    // Notify admin about the evidence submission
    await this.notificationService.createAndSendNotification({
      userId: pendingVerificationRequest.adminId,
      type: NotificationType.CAMPAIGN_UPDATE,
      content: `Chủ chiến dịch "${campaign.title}" đã gửi thêm tài liệu xác minh.`,
      metadata: {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        evidenceResponseId: evidenceResponse.id,
        verificationRequestId: pendingVerificationRequest.id,
      },
    });

    // Send email to admin
    if (pendingVerificationRequest.admin?.email) {
      await this.campaignEmailService.sendEvidenceSubmittedEmail(
        pendingVerificationRequest.admin.email,
        campaign.title,
        pendingVerificationRequest.admin.name || 'Admin',
        campaign.id,
      );
    }

    // Log audit trail
    await this.auditService.logEvidenceSubmission(
      campaign.id,
      userId,
      dto.documents.length,
      dto.description,
    );

    return {
      evidenceResponse,
      message:
        'Evidence submitted successfully. Your campaign is now under review.',
    };
  }
}
