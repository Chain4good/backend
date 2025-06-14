import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseRepository } from 'src/common/base.repository';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class RoleRepository extends BaseRepository<
  Role,
  Prisma.RoleWhereInput,
  Prisma.RoleCreateInput,
  Prisma.RoleUpdateInput,
  Prisma.RoleOrderByWithRelationInput,
  Prisma.RoleInclude
> {
  protected readonly prisma: PrismaService;
  protected readonly modelName: Prisma.ModelName = 'Role';

  constructor(prisma: PrismaService) {
    super();
    this.prisma = prisma;
  }
}
