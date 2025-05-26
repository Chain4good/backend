import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { Image, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ImageRepo extends BaseRepository<
  Image,
  Prisma.ImageWhereInput,
  Prisma.ImageCreateInput,
  Prisma.ImageUpdateInput,
  Prisma.ImageOrderByWithRelationInput,
  Prisma.ImageInclude
> {
  protected readonly modelName = 'Image' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
