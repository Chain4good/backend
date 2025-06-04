import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/base.repository';
import { Post, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostRepository extends BaseRepository<
  Post,
  Prisma.PostWhereInput,
  Prisma.PostCreateInput,
  Prisma.PostUpdateInput,
  Prisma.PostOrderByWithRelationInput,
  Prisma.PostInclude
> {
  protected readonly modelName = 'Post' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
