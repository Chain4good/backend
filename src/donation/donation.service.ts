import { Injectable } from '@nestjs/common';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { DonationRepo } from './donation.repository';

@Injectable()
export class DonationService {
  constructor(private readonly donationRepo: DonationRepo) {}

  create(createDonationDto: CreateDonationDto & { userId: number }) {
    const { userId, campaignId, ...rest } = createDonationDto;

    return this.donationRepo.create({
      ...rest,
      user: {
        connect: { id: userId },
      },
      campaign: {
        connect: { id: campaignId },
      },
    });
  }

  findAll() {
    return this.donationRepo.findAll();
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
}
