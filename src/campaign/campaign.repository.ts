import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { Campaign, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CampaignRepository extends BaseRepository<
  Campaign,
  Prisma.CampaignWhereInput,
  Prisma.CampaignCreateInput,
  Prisma.CampaignUpdateInput,
  Prisma.CampaignOrderByWithRelationInput,
  Prisma.CampaignInclude
> {
  protected readonly modelName = 'Campaign' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
