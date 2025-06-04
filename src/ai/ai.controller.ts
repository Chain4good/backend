import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AnalyzeCampaignDto } from './dto/analyze-campaign.dto';
import { GetUser, UserExtract } from 'src/auth/decorators/auth.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-campaign')
  async analyze(@Body() dto: AnalyzeCampaignDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.aiService.analyzeCampaign(dto.title, dto.description);
  }
  @Post('analyze-campaign-gemini')
  async analyzeGemine(@Body() dto: AnalyzeCampaignDto) {
    return this.aiService.analyzeCampaignWithGemini(dto.title, dto.description);
  }

  @Get('analyze-campaign-trust/:campaignId')
  async analyzeTrust(@Param('campaignId') campaignId: number) {
    return this.aiService.analyzeCampaignTrust(+campaignId);
  }

  @Post('optimize-campaign')
  async optimize(@Body() dto: AnalyzeCampaignDto) {
    return this.aiService.optimizeCampaignContent(dto.title, dto.description);
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  async getRecommendations(@GetUser() user: UserExtract) {
    return this.aiService.getPersonalizedRecommendations(+user.id);
  }
}
