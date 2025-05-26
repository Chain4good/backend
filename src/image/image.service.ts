import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ImageRepo } from './image.repository';

@Injectable()
export class ImageService {
  constructor(private readonly imageRepo: ImageRepo) {}
  create(createImageDto: CreateImageDto) {
    return this.imageRepo.create(createImageDto);
  }

  findAll() {
    return this.imageRepo.findAll();
  }

  findOne(id: number) {
    return this.imageRepo.findOne(id);
  }

  update(id: number, updateImageDto: UpdateImageDto) {
    return this.imageRepo.update(id, updateImageDto);
  }

  remove(id: number) {
    return this.imageRepo.delete(id);
  }
}
