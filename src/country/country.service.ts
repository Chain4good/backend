import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CountryRepo } from './country.repository';

@Injectable()
export class CountryService {
  constructor(private readonly countryRepo: CountryRepo) {}
  create(createCountryDto: CreateCountryDto) {
    return this.countryRepo.create(createCountryDto);
  }

  findAll() {
    return this.countryRepo.findAll();
  }

  findOne(id: number) {
    return this.countryRepo.findOne(id);
  }

  update(id: number, updateCountryDto: UpdateCountryDto) {
    return this.countryRepo.update(id, updateCountryDto);
  }

  remove(id: number) {
    return this.countryRepo.delete(id);
  }
}
