import { Module, forwardRef } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiModule } from 'src/gemini/gemini.module';
import { CampaignModule } from 'src/campaign/campaign.module';
import { UsersModule } from 'src/users/users.module';
import { DonationModule } from 'src/donation/donation.module';

@Module({
  imports: [
    GeminiModule,
    forwardRef(() => CampaignModule), // Add forwardRef here
    UsersModule,
    DonationModule,
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
