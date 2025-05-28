import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { GetUser, UserExtract } from 'src/auth/decorators/auth.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CampaignStatus } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createCampaignDto: CreateCampaignDto,
    @GetUser() user: UserExtract,
  ) {
    const campaign = this.campaignService.create({
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
    );
  }

  @Get('my-campaigns')
  @UseGuards(JwtAuthGuard)
  findMyCampaigns(
    @GetUser() user: UserExtract,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.campaignService.findMyCampaigns(user.id, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignService.update(+id, updateCampaignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campaignService.remove(+id);
  }
}
