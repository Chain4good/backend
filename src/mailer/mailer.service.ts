import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendCampaignCreated(
    email: string,
    campaignName: string,
    campaignId: number,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Chiến dịch tạo ra thành công',
      template: 'campaign-created',
      context: {
        campaignName,
        campaignId,
      },
    });
  }

  async sendDonationConfirmation(
    email: string,
    data: {
      campaignName: string;
      amount: number;
      donorName: string;
    },
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Thank You for Your Donation',
      template: 'donation-confirmation',
      context: {
        ...data,
      },
    });
  }

  async sendCampaignStatusUpdate(
    email: string,
    data: {
      campaignName: string;
      status: string;
    },
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Campaign Status Updated',
      template: 'campaign-status-update',
      context: {
        ...data,
      },
    });
  }

  async sendCustomThankYouEmail(
    email: string,
    subject: string,
    content: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      html: content,
    });
  }

  async sendCustomEmail(email: string, subject: string, content: string) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      html: content,
    });
  }

  async sendToAdminCampaignCreated(email: string, campaignName: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Chiến dịch mới được tạo',
      template: 'campaign-created-admin',
      context: {
        campaignName,
      },
    });
  }
}
