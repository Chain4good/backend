import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { AnalyzeCampaignDto } from './dto/analyze-campaign.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-campaign')
  async analyze(@Body() dto: AnalyzeCampaignDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.aiService.analyzeCampaign(dto.title, dto.description);
  }
}
