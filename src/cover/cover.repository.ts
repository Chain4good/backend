import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { Cover, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CoverRepo extends BaseRepository<
  Cover,
  Prisma.CoverWhereInput,
  Prisma.CoverCreateInput,
  Prisma.CoverUpdateInput,
  Prisma.CoverOrderByWithRelationInput,
  Prisma.CoverInclude
> {
  protected readonly modelName = 'Cover' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
