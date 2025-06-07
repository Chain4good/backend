// user-badge.repository.ts
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { UserBadge, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserBadgeRepository extends BaseRepository<
  UserBadge,
  Prisma.UserBadgeWhereInput,
  Prisma.UserBadgeCreateInput,
  Prisma.UserBadgeUpdateInput,
  Prisma.UserBadgeOrderByWithRelationInput,
  Prisma.UserBadgeInclude
> {
  protected readonly modelName = 'UserBadge' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
