import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { ImageRepo } from './image.repository';

@Module({
  controllers: [ImageController],
  providers: [ImageService, ImageRepo],
})
export class ImageModule {}
