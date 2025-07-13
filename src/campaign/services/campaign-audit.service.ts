import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export enum AuditAction {
  STATUS_CHANGED = 'STATUS_CHANGED',
  VERIFICATION_REQUESTED = 'VERIFICATION_REQUESTED',
  EVIDENCE_SUBMITTED = 'EVIDENCE_SUBMITTED',
  CAMPAIGN_CREATED = 'CAMPAIGN_CREATED',
  CAMPAIGN_UPDATED = 'CAMPAIGN_UPDATED',
  CAMPAIGN_APPROVED = 'CAMPAIGN_APPROVED',
  CAMPAIGN_REJECTED = 'CAMPAIGN_REJECTED',
}

interface AuditLogData {
  action: AuditAction;
  description: string;
  userId: number;
  campaignId: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class CampaignAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(data: AuditLogData) {
    try {
      return await this.prisma.campaignAuditLog.create({
        data: {
          action: data.action,
          description: data.description,
          userId: data.userId,
          campaignId: data.campaignId,
          metadata: data.metadata || undefined,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  async logStatusChange(
    campaignId: number,
    userId: number,
    oldStatus: string,
    newStatus: string,
    reason?: string,
  ) {
    return this.logAction({
      action: AuditAction.STATUS_CHANGED,
      description: `Campaign status changed from ${oldStatus} to ${newStatus}`,
      userId,
      campaignId,
      metadata: {
        oldStatus,
        newStatus,
        reason,
      },
    });
  }

  async logVerificationRequest(
    campaignId: number,
    adminId: number,
    message: string,
    reason?: string,
  ) {
    return this.logAction({
      action: AuditAction.VERIFICATION_REQUESTED,
      description: `Admin requested additional verification for campaign`,
      userId: adminId,
      campaignId,
      metadata: {
        message,
        reason,
      },
    });
  }

  async logEvidenceSubmission(
    campaignId: number,
    userId: number,
    documentsCount: number,
    description?: string,
  ) {
    return this.logAction({
      action: AuditAction.EVIDENCE_SUBMITTED,
      description: `Campaign owner submitted ${documentsCount} evidence document(s)`,
      userId,
      campaignId,
      metadata: {
        documentsCount,
        description,
      },
    });
  }

  async logCampaignApproval(campaignId: number, adminId: number) {
    return this.logAction({
      action: AuditAction.CAMPAIGN_APPROVED,
      description: `Campaign approved by admin`,
      userId: adminId,
      campaignId,
    });
  }

  async logCampaignRejection(
    campaignId: number,
    adminId: number,
    reason?: string,
  ) {
    return this.logAction({
      action: AuditAction.CAMPAIGN_REJECTED,
      description: `Campaign rejected by admin`,
      userId: adminId,
      campaignId,
      metadata: {
        reason,
      },
    });
  }

  async getCampaignAuditHistory(campaignId: number) {
    return this.prisma.campaignAuditLog.findMany({
      where: { campaignId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
