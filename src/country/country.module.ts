import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { CountryRepo } from './country.repository';

@Module({
  controllers: [CountryController],
  providers: [CountryService, CountryRepo],
})
export class CountryModule {}
