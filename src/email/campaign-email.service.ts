import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class CampaignEmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendCampaignApprovalEmail(userEmail: string, campaignName: string) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Campaign Approved',
      template: 'campaign-approval',
      context: {
        campaignName,
        status: 'approved',
      },
    });
  }

  async sendCampaignRejectionEmail(
    userEmail: string,
    campaignName: string,
    reason?: string,
  ) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Campaign Rejected',
      template: 'campaign-rejection',
      context: {
        campaignName,
        status: 'rejected',
        reason: reason || 'No specific reason provided',
      },
    });
  }

  async sendDeadlineReminderEmail(
    userEmail: string,
    campaignName: string,
    daysLeft: number,
  ) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Campaign Deadline Approaching',
      template: 'campaign-deadline-reminder',
      context: {
        campaignName,
        daysLeft,
      },
    });
  }

  async sendCampaignCompletedEmail(userEmail: string, campaignName: string) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Campaign Completed',
      template: 'campaign-completed',
      context: {
        campaignName,
      },
    });
  }
}
