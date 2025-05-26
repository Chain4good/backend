import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryRepo extends BaseRepository<
  Category,
  Prisma.CategoryWhereInput,
  Prisma.CategoryCreateInput,
  Prisma.CategoryUpdateInput,
  Prisma.CategoryOrderByWithRelationInput,
  Prisma.CategoryInclude
> {
  protected readonly modelName = 'Category' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
