import { Injectable } from '@nestjs/common';
import { CreateCoverDto } from './dto/create-cover.dto';
import { UpdateCoverDto } from './dto/update-cover.dto';
import { CoverRepo } from './cover.repository';

@Injectable()
export class CoverService {
  constructor(private readonly coverRepo: CoverRepo) {}
  create(createCoverDto: CreateCoverDto) {
    return this.coverRepo.create(createCoverDto);
  }

  findAll() {
    return this.coverRepo.findAll();
  }

  findOne(id: number) {
    return this.coverRepo.findOne(id);
  }

  update(id: number, updateCoverDto: UpdateCoverDto) {
    return this.coverRepo.update(id, updateCoverDto);
  }

  remove(id: number) {
    return this.coverRepo.delete(id);
  }
}
