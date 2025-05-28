import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { Country, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CountryRepo extends BaseRepository<
  Country,
  Prisma.CountryWhereInput,
  Prisma.CountryCreateInput,
  Prisma.CountryUpdateInput,
  Prisma.CountryOrderByWithRelationInput,
  Prisma.CountryInclude
> {
  protected readonly modelName = 'Country' as Prisma.ModelName;

  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
