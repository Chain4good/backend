import { Module } from '@nestjs/common';
import { CoverService } from './cover.service';
import { CoverController } from './cover.controller';
import { CoverRepo } from './cover.repository';

@Module({
  controllers: [CoverController],
  providers: [CoverService, CoverRepo],
})
export class CoverModule {}
