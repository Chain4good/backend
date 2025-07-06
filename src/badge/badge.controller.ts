import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { CreateBadgeDto } from './dto/create-badge.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('badges')
export class BadgeController {
  // This controller will handle badge-related endpoints
  // You can define methods here to handle requests related to badges
  // For example, you might have methods for creating, updating, deleting, and retrieving badges
  constructor(private readonly badgeService: BadgeService) {}

  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createBadgeDto: CreateBadgeDto) {
    return this.badgeService.createBadge(createBadgeDto);
  }
}
