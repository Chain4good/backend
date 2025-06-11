import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BadgeService } from 'src/badge/badge.service';
import { CampaignService } from 'src/campaign/campaign.service';
import { UsersService } from 'src/users/users.service';
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
    @Inject(forwardRef(() => CampaignService))
    private readonly campaignService: CampaignService,
    private readonly userService: UsersService,
    private readonly badgeService: BadgeService,
  ) {}

  async create(createDonationDto: CreateDonationDto & { userId: number }) {
    const donation =
      await this.createDonationUseCase.execute(createDonationDto);
    // const campaign = await this.campaignService.findOne(
    //   createDonationDto.campaignId,
    // );
    // const ethPrice = await this.campaignService.getEthPrice();
    // const totalDonated = await this.donationRepo.aggregateDonationsByUser(
    //   createDonationDto.userId,
    // );
    // const amount: any = totalDonated._sum.amount ?? 0;
    // if (amount * ethPrice >= 1000000) {
    //   await this.badgeService.awardBadgeToUser(createDonationDto.userId, 1);
    // }

    // if (!campaign) throw new Error('Campaign not found');
    // const user = await this.userService.findById(createDonationDto.userId);
    // if (!user) throw new Error('User not found');
    return donation;
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

  async findAllByUserId(userId: number) {
    return this.donationRepo.findAllByUserId(userId);
  }
}
