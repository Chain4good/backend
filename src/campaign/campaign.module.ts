import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { CampaignRepository } from './campaign.repository';
import { AuthModule } from '../auth/auth.module';
import { LocalStrategy } from 'src/auth/strategies/local.strategy';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';

@Module({
  imports: [AuthModule],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignRepository, LocalStrategy, JwtStrategy],
  exports: [CampaignService, CampaignRepository],
})
export class CampaignModule {}
