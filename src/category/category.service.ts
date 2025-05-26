import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepo } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepo) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.categoryRepo.create(createCategoryDto);
  }

  findAll() {
    return this.categoryRepo.findAll();
  }

  findOne(id: number) {
    return this.categoryRepo.findOne(id);
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.categoryRepo.update(id, updateCategoryDto);
  }

  remove(id: number) {
    return this.categoryRepo.delete(id);
  }
}
