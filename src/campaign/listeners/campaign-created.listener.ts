import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '../../mailer/mailer.service';
import { UsersService } from '../../users/users.service';
import { CampaignCreatedEvent } from '../events/campaign-created.event';

@Injectable()
export class CampaignCreatedListener {
  constructor(
    private readonly mailerService: MailerService,
    private readonly userService: UsersService,
  ) {}

  @OnEvent('campaign.created', { async: true })
  async handleCampaignCreatedEvent(event: CampaignCreatedEvent) {
    try {
      await this.mailerService.sendCampaignCreated(
        event.userEmail,
        event.campaignTitle,
        event.campaignId,
      );

      const admins = await this.userService.findAllByRole(1);
      await Promise.all(
        admins.map((admin) =>
          this.mailerService.sendToAdminCampaignCreated(
            admin.email,
            event.campaignTitle,
          ),
        ),
      );
    } catch (error) {
      console.error('Failed to send campaign created emails:', error);
    }
  }
}
