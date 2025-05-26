import { Module } from '@nestjs/common';
import { FundraiseTypeService } from './fundraise-type.service';
import { FundraiseTypeController } from './fundraise-type.controller';
import { FundraiseTypeRepo } from './fundraise-type.repository';

@Module({
  controllers: [FundraiseTypeController],
  providers: [FundraiseTypeService, FundraiseTypeRepo],
})
export class FundraiseTypeModule {}
