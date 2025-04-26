import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { Prisma } from '@prisma/client';
import { GetUser, UserExtract } from 'src/auth/decorators/auth.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  async createCampaign(
    @Body() body: Prisma.CampaignCreateInput,
    @GetUser() user: UserExtract,
  ) {
    try {
      const campaign = this.campaignService.createCampaign({
        ...body,
        user: { connect: { id: user.id } },
      });
      return campaign;
    } catch (error: unknown) {
      Logger.error(error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred');
    }
  }
}
