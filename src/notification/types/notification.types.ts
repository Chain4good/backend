export enum NotificationType {
  DONATION = 'DONATION',
  COMMENT_REPLY = 'COMMENT_REPLY',
  COMMENT = 'COMMENT',
  CAMPAIGN_UPDATE = 'CAMPAIGN_UPDATE',
  CAMPAIGN_STATUS = 'CAMPAIGN_STATUS',
  KYC_SUBMISSION = 'KYC_SUBMISSION',
  KYC_STATUS_UPDATE = 'KYC_STATUS_UPDATE',
  VERIFICATION_REQUEST = 'VERIFICATION_REQUEST',
}

export interface NotificationMetadata {
  campaignId?: number;
  donationId?: number;
  commentId?: number;
  amount?: number;
  donorName?: string;
  replierName?: string;
  status?: string;
  [key: string]: any;
}

export interface NotificationEntity {
  id: number;
  type: NotificationType;
  content: string;
  metadata: NotificationMetadata | null;
  isRead: boolean;
  createdAt: Date;
  userId: number;
}

export type NotificationResponse = {
  data: NotificationEntity[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};
