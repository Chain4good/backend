import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('campaigns-stats')
  async getCampaignStats(@Query('days') days: number = 30) {
    return this.dashboardService.getCampaignStats(days);
  }

  @Get('donations-stats')
  async getDonationStats(@Query('days') days: number = 30) {
    return this.dashboardService.getDonationStats(days);
  }

  @Get('recent-activities')
  async getRecentActivities(@Query('limit') limit: number = 10) {
    return this.dashboardService.getRecentActivities(limit);
  }

  @Get('top-campaigns')
  async getTopCampaigns(@Query('limit') limit: number = 5) {
    return this.dashboardService.getTopCampaigns(limit);
  }

  @Get('user-growth')
  async getUserGrowth(@Query('days') days: number = 30) {
    return this.dashboardService.getUserGrowth(days);
  }
}
