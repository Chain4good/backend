import { Injectable } from '@nestjs/common';
import { BadgeRepository } from './badge.repository';
import { UserBadgeRepository } from './user-badge.repository';
import { BadgeRulesService } from './badge-rules.service';
import { BadgeType } from './enum/badge-type.enum';
import { DonationRepo } from 'src/donation/donation.repository';
import { CreateBadgeDto } from './dto/create-badge.dto';

@Injectable()
export class BadgeService {
  constructor(
    private readonly badgeRepo: BadgeRepository,
    private readonly userBadgeRepo: UserBadgeRepository,
    private readonly badgeRulesService: BadgeRulesService,
  ) {}

  async getAllBadges() {
    return this.badgeRepo.findAll();
  }

  async getUserBadges(userId: number) {
    return this.userBadgeRepo.findBy({ userId }, { badge: true });
  }

  async awardBadgeToUser(userId: number, badgeId: number) {
    const existing = await this.userBadgeRepo.findBy({ userId, badgeId });
    if (existing.length > 0) return existing[0];

    return this.userBadgeRepo.create({
      user: { connect: { id: userId } },
      badge: { connect: { id: badgeId } },
    });
  }

  async createBadge(createBadgeDto: CreateBadgeDto) {
    return this.badgeRepo.create(createBadgeDto);
  }

  async checkDonationBadges(
    userId: number,
    amount: number,
    donationRepo: DonationRepo,
    tokenName?: string,
  ) {
    await this.badgeRulesService.checkAndAwardBadges(
      userId,
      BadgeType.FIRST_DONATION,
      { userId, donationRepo },
      this,
    );

    await this.badgeRulesService.checkAndAwardBadges(
      userId,
      BadgeType.DONATION_MILESTONE,
      { userId, amount, tokenName },
      this,
    );
  }

  async checkCampaignBadges(userId: number, campaign: any) {
    // Kiểm tra và trao badge cho người tạo chiến dịch
  }
}
