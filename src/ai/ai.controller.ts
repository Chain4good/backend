import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AnalyzeCampaignDto } from './dto/analyze-campaign.dto';
import { GetUser, UserExtract } from 'src/auth/decorators/auth.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'USER')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-campaign')
  @Post('analyze-campaign')
  async analyze(@Body() dto: AnalyzeCampaignDto): Promise<any> {
    return this.aiService.analyzeCampaign(dto.title, dto.description);
  }
  @Post('analyze-campaign-gemini')
  async analyzeGemine(@Body() dto: AnalyzeCampaignDto): Promise<any> {
    return this.aiService.analyzeCampaignWithGemini(dto.title, dto.description);
  }

  @Get('analyze-campaign-trust/:campaignId')
  async analyzeTrust(@Param('campaignId') campaignId: number): Promise<any> {
    return this.aiService.analyzeCampaignTrust(+campaignId);
  }

  @Post('optimize-campaign')
  async optimize(@Body() dto: AnalyzeCampaignDto): Promise<any> {
    return this.aiService.optimizeCampaignContent(dto.title, dto.description);
  }

  @Get('recommendations')
  async getRecommendations(@GetUser() user: UserExtract): Promise<any> {
    return this.aiService.getPersonalizedRecommendations(+user.id);
  }

  @Get('campaigns/:campaignId/audio')
  async textToSpeech(@Param('campaignId') campaignId: number): Promise<any> {
    return this.aiService.textToSpeech(+campaignId);
  }
}
