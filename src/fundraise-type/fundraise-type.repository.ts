import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { FundraiseType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FundraiseTypeRepo extends BaseRepository<
  FundraiseType,
  Prisma.FundraiseTypeWhereInput,
  Prisma.FundraiseTypeCreateInput,
  Prisma.FundraiseTypeUpdateInput,
  Prisma.FundraiseTypeOrderByWithRelationInput,
  Prisma.FundraiseTypeInclude
> {
  protected readonly modelName = 'FundraiseType' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
