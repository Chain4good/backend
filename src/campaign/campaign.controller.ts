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

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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

  @Get('my-campaigns')
  @UseGuards(JwtAuthGuard)
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    const campaign = await this.campaignService.update(+id, updateCampaignDto);
    return campaign;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campaignService.remove(+id);
  }
}
