import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/base.repository';
import { Topic, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TopicRepository extends BaseRepository<
  Topic,
  Prisma.TopicWhereInput,
  Prisma.TopicCreateInput,
  Prisma.TopicUpdateInput,
  Prisma.TopicOrderByWithRelationInput,
  Prisma.TopicInclude
> {
  protected readonly modelName = 'Topic' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
