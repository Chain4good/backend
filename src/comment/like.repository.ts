import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { Like, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikeRepo extends BaseRepository<
  Like,
  Prisma.LikeWhereInput,
  Prisma.LikeCreateInput,
  Prisma.LikeUpdateInput,
  Prisma.LikeOrderByWithRelationInput,
  Prisma.LikeInclude
> {
  protected readonly modelName = 'Like' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
