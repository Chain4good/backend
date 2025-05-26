import { Injectable } from '@nestjs/common';
import { CreateFundraiseTypeDto } from './dto/create-fundraise-type.dto';
import { UpdateFundraiseTypeDto } from './dto/update-fundraise-type.dto';
import { FundraiseTypeRepo } from './fundraise-type.repository';

@Injectable()
export class FundraiseTypeService {
  constructor(private readonly fundraiseTypeRepo: FundraiseTypeRepo) {}

  create(createFundraiseTypeDto: CreateFundraiseTypeDto) {
    return this.fundraiseTypeRepo.create(createFundraiseTypeDto);
  }

  findAll() {
    return this.fundraiseTypeRepo.findAll();
  }

  findOne(id: number) {
    return this.fundraiseTypeRepo.findOne(id);
  }

  update(id: number, updateFundraiseTypeDto: UpdateFundraiseTypeDto) {
    return this.fundraiseTypeRepo.update(id, updateFundraiseTypeDto);
  }

  remove(id: number) {
    return this.fundraiseTypeRepo.delete(id);
  }
}
