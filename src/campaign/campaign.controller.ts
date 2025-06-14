/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CampaignStatus } from '@prisma/client';
import { GetUser, UserExtract } from 'src/auth/decorators/auth.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CreateCampaignProgressDto } from './dto/create-campaign-progress.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('USER', 'ADMIN')
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
    @GetUser() user: UserExtract,
  ) {
    const campaign = await this.campaignService.create({
      ...createCampaignDto,
      userId: user.id,
      email: user.email,
    });
    return campaign;
  }

  @Get()
  findAll(
    @Query('userId') userId: number,
    @Query('email') email: string,
    @Query('status') status: CampaignStatus,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('sort') sort: 'asc' | 'desc',
    @Query('sortBy') sortBy: string,
    @Query('categoryId') categoryId: number,
    @Query('fundraiseTypeId') fundraiseTypeId: number,
    @Query('countryId') countryId: number,
  ) {
    return this.campaignService.findAll(
      userId,
      email,
      status,
      page,
      limit,
      search,
      sort,
      sortBy,
      categoryId,
      fundraiseTypeId,
      countryId,
    );
  }

  @Get('valid')
  async findCampaignValid(
    @Query('userId') userId: number,
    @Query('email') email: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('sort') sort: 'asc' | 'desc',
    @Query('sortBy') sortBy: string,
    @Query('categoryId') categoryId: number,
    @Query('fundraiseTypeId') fundraiseTypeId: number,
    @Query('countryId') countryId: number,
  ) {
    return this.campaignService.findAllValid(
      userId,
      email,
      page,
      limit,
      search,
      sort,
      sortBy,
      categoryId,
      fundraiseTypeId,
      countryId,
    );
  }

  @Get('my-campaigns')
  @UseGuards(JwtAuthGuard)
  @Roles('USER', 'ADMIN')
  async findMyCampaigns(
    @GetUser() user: UserExtract,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('status') status: CampaignStatus,
  ) {
    const campaigns = await this.campaignService.findMyCampaigns(
      user.id,
      page,
      limit,
      status,
    );

    return campaigns;
  }

  @Get('calculate-eth-goal')
  calculateEthGoal(@Query('vndAmount') vndAmount: number) {
    return this.campaignService.calculateEthGoal(vndAmount);
  }

  @Get('calculate-goal')
  calculateGoal(
    @Query('vndAmount') vndAmount: number,
    @Query('token') token: string,
  ) {
    return this.campaignService.calculateGoal(vndAmount, token);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'USER')
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    const campaign = await this.campaignService.update(+id, updateCampaignDto);
    return campaign;
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.campaignService.remove(+id);
  }

  @Get(':id/donation-history')
  async getDonationHistory(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day',
  ) {
    return this.campaignService.getDonationHistory(
      +id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      groupBy,
    );
  }

  @Post(':id/progress')
  @UseGuards(JwtAuthGuard)
  async addProgress(
    @Param('id') id: string,
    @Body() createProgressDto: CreateCampaignProgressDto,
  ) {
    return this.campaignService.addProgress(+id, createProgressDto);
  }

  @Get(':id/progress')
  async getProgressHistory(@Param('id') id: string) {
    return this.campaignService.getProgressHistory(+id);
  }

  @Get(':id/financial-report')
  @UseGuards(JwtAuthGuard)
  @Roles('USER', 'ADMIN')
  async getFinancialReport(@Param('id') id: string) {
    return this.campaignService.generateFinancialReport(+id);
  }
}
