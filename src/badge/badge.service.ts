import { Injectable } from '@nestjs/common';
import { BadgeRepository } from './badge.repository';
import { UserBadgeRepository } from './user-badge.repository';

@Injectable()
export class BadgeService {
  constructor(
    private readonly badgeRepo: BadgeRepository,
    private readonly userBadgeRepo: UserBadgeRepository,
  ) {}

  async getAllBadges() {
    return this.badgeRepo.findAll();
  }

  async getUserBadges(userId: number) {
    return this.userBadgeRepo.findBy({ userId }, { badge: true });
  }

  async awardBadgeToUser(userId: number, badgeId: number) {
    // Kiểm tra user đã có badge chưa
    const existing = await this.userBadgeRepo.findBy({ userId, badgeId });
    if (existing.length > 0) return existing[0];

    return this.userBadgeRepo.create({
      user: { connect: { id: userId } },
      badge: { connect: { id: badgeId } },
    });
  }
}
