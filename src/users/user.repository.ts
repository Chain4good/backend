import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository extends BaseRepository<
  User,
  Prisma.UserWhereInput,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserOrderByWithRelationInput,
  Prisma.UserInclude
> {
  protected readonly modelName = 'User' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
