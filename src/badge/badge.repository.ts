// badge.repository.ts
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { Badge, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BadgeRepository extends BaseRepository<
  Badge,
  Prisma.BadgeWhereInput,
  Prisma.BadgeCreateInput,
  Prisma.BadgeUpdateInput,
  Prisma.BadgeOrderByWithRelationInput,
  Prisma.BadgeInclude
> {
  protected readonly modelName = 'Badge' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
