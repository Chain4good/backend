import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendCampaignCreated(email: string, campaignName: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Campaign Created Successfully',
      template: 'campaign-created', // tên của template trong thư mục templates
      context: {
        campaignName,
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
}
