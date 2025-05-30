import { Module } from '@nestjs/common';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';
import { DonationRepo } from './donation.repository';

@Module({
  controllers: [DonationController],
  providers: [DonationService, DonationRepo],
})
export class DonationModule {}
