import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { Donation, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DonationRepo extends BaseRepository<
  Donation,
  Prisma.DonationWhereInput,
  Prisma.DonationCreateInput,
  Prisma.DonationUpdateInput,
  Prisma.DonationOrderByWithRelationInput,
  Prisma.DonationInclude
> {
  protected readonly modelName = 'Donation' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
  findAll<T extends Prisma.DonationInclude>(params: {
    where?: Prisma.DonationWhereInput;
    include?: T;
  }) {
    return this.prisma.donation.findMany({
      where: params.where,
      include: params.include,
    }) as Promise<Prisma.DonationGetPayload<{ include: T }>[]>;
  }

  async findAllByUserId(userId: number) {
    return this.prisma.donation.findMany({
      where: { userId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            categoryId: true,
            countryId: true,
          },
        },
      },
      orderBy: { donatedAt: 'desc' },
    });
  }
  async aggregateDonationsByUser(userId: number) {
    return this.prisma.donation.aggregate({
      _sum: { amount: true },
      where: { userId },
    });
  }
}
