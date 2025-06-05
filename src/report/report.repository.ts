import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/base.repository';
import { Report, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportRepository extends BaseRepository<
  Report,
  Prisma.ReportWhereInput,
  Prisma.ReportCreateInput,
  Prisma.ReportUpdateInput,
  Prisma.ReportOrderByWithRelationInput,
  Prisma.ReportInclude
> {
  protected readonly modelName = 'Report' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
