import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DonationRepo } from './donation.repository';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { CreateDonationUseCase } from './use-cases/create-donation.use-case';

type DonationWithUser = Prisma.DonationGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

@Injectable()
export class DonationService {
  constructor(
    private readonly donationRepo: DonationRepo,
    private readonly createDonationUseCase: CreateDonationUseCase,
  ) {}

  create(createDonationDto: CreateDonationDto & { userId: number }) {
    return this.createDonationUseCase.execute(createDonationDto);
  }

  findAll() {
    return this.donationRepo.findAll({});
  }

  findOne(id: number) {
    return this.donationRepo.findOne(id);
  }

  update(id: number, updateDonationDto: UpdateDonationDto) {
    return this.donationRepo.update(id, updateDonationDto);
  }

  remove(id: number) {
    return this.donationRepo.delete(id);
  }

  async findAllUserDonationByCampaignId(
    campaignId: number,
  ): Promise<DonationWithUser[]> {
    return this.donationRepo.findAll({
      where: {
        campaignId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
