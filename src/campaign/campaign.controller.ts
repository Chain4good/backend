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
import { GetUser, UserExtract } from 'src/auth/decorators/auth.decorators';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CampaignService } from './campaign.service';
import { CreateCampaignProgressDto } from './dto/create-campaign-progress.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import {
  FindAllCampaignValidDto,
  FindAllCampaignDto,
  FindMyCampaignDto,
  GetCampaignDonationHistoryDto,
  RejectCampaignDto,
  UpdateCampaignStatusDto,
  RequestVerificationDto,
  AddEvidenceDto,
} from './dto/campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import {
  AddCampaignProgressUseCase,
  ApproveCampaignUseCase,
  FindAllCampaignUseCase,
  FindAllCampaignValidUseCase,
  FindMyCampaignUseCase,
  FindOneCampaignUseCase,
  GenerateFinancialReportUseCase,
  GetCampaignDonationHistoryUseCase,
  GetCampaignProgressHistoryUseCase,
  RejectCampaignUseCase,
  RemoveCampaignUseCase,
  UpdateCampaignStatusUseCase,
  UpdateCampaignUseCase,
} from './use-cases';
import { RequestCampaignVerificationUseCase } from './use-cases/request-campaign-verification.use-case';
import { AddCampaignEvidenceUseCase } from './use-cases/add-campaign-evidence.use-case';

@Controller('campaigns')
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly findAllCampaignUseCase: FindAllCampaignUseCase,
    private readonly findAllCampaignValidUseCase: FindAllCampaignValidUseCase,
    private readonly findMyCampaignUseCase: FindMyCampaignUseCase,
    private readonly findOneCampaignUseCase: FindOneCampaignUseCase,
    private readonly updateCampaignUseCase: UpdateCampaignUseCase,
    private readonly removeCampaignUseCase: RemoveCampaignUseCase,
    private readonly updateCampaignStatusUseCase: UpdateCampaignStatusUseCase,
    private readonly approveCampaignUseCase: ApproveCampaignUseCase,
    private readonly rejectCampaignUseCase: RejectCampaignUseCase,
    private readonly addCampaignProgressUseCase: AddCampaignProgressUseCase,
    private readonly getCampaignProgressHistoryUseCase: GetCampaignProgressHistoryUseCase,
    private readonly getCampaignDonationHistoryUseCase: GetCampaignDonationHistoryUseCase,
    private readonly generateFinancialReportUseCase: GenerateFinancialReportUseCase,
    private readonly requestCampaignVerificationUseCase: RequestCampaignVerificationUseCase,
    private readonly addCampaignEvidenceUseCase: AddCampaignEvidenceUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('USER', 'ADMIN')
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
    @GetUser() user: UserExtract,
  ) {
    return this.campaignService.create({
      ...createCampaignDto,
      userId: user.id,
      email: user.email,
    });
  }

  @Get()
  findAll(@Query() dto: FindAllCampaignDto) {
    return this.findAllCampaignUseCase.execute(dto);
  }

  @Get('valid')
  async findCampaignValid(@Query() dto: FindAllCampaignValidDto) {
    return this.findAllCampaignValidUseCase.execute(dto);
  }

  @Get('my-campaigns')
  @UseGuards(JwtAuthGuard)
  @Roles('USER', 'ADMIN')
  async findMyCampaigns(
    @GetUser() user: UserExtract,
    @Query() dto: FindMyCampaignDto,
  ) {
    return this.findMyCampaignUseCase.execute(user.id, dto);
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
    return this.findOneCampaignUseCase.execute(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'USER')
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.updateCampaignUseCase.execute(+id, updateCampaignDto);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.removeCampaignUseCase.execute(+id);
  }

  @Get(':id/donation-history')
  async getDonationHistory(
    @Param('id') id: string,
    @Query() dto: GetCampaignDonationHistoryDto,
  ) {
    return this.getCampaignDonationHistoryUseCase.execute(+id, dto);
  }

  @Post(':id/progress')
  @UseGuards(JwtAuthGuard)
  async addProgress(
    @Param('id') id: string,
    @Body() createProgressDto: CreateCampaignProgressDto,
  ) {
    return this.addCampaignProgressUseCase.execute(+id, createProgressDto);
  }

  @Get(':id/progress')
  async getProgressHistory(@Param('id') id: string) {
    return this.getCampaignProgressHistoryUseCase.execute(+id);
  }

  @Get(':id/financial-report')
  @UseGuards(JwtAuthGuard)
  @Roles('USER', 'ADMIN')
  async getFinancialReport(@Param('id') id: string) {
    return this.generateFinancialReportUseCase.execute(+id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateCampaignStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCampaignStatusDto,
  ) {
    const campaign = await this.updateCampaignStatusUseCase.execute(
      +id,
      updateStatusDto,
    );
    return {
      message: 'Campaign status updated successfully',
      campaign,
    };
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async approveCampaign(
    @Param('id') id: string,
  ): Promise<{ message: string; campaign: any }> {
    const campaign = await this.approveCampaignUseCase.execute(+id);
    return {
      message: 'Campaign approved successfully',
      campaign,
    };
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async rejectCampaign(
    @Param('id') id: string,
    @Body() rejectDto: RejectCampaignDto,
  ): Promise<{ message: string; campaign: any }> {
    const campaign = await this.rejectCampaignUseCase.execute(+id, rejectDto);
    return {
      message: 'Campaign rejected successfully',
      campaign,
    };
  }

  @Post(':id/request-verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async requestVerification(
    @Param('id') id: string,
    @Body() requestVerificationDto: RequestVerificationDto,
    @GetUser() user: UserExtract,
  ): Promise<{ message: string; verificationRequest: any; campaign: any }> {
    const result = await this.requestCampaignVerificationUseCase.execute(
      +id,
      user.id,
      requestVerificationDto,
    );
    return {
      message: result.message,
      verificationRequest: result.verificationRequest,
      campaign: result.campaign,
    };
  }

  @Post(':id/add-evidence')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN')
  async addEvidence(
    @Param('id') id: string,
    @Body() addEvidenceDto: AddEvidenceDto,
    @GetUser() user: UserExtract,
  ): Promise<{ message: string; evidenceResponse: any }> {
    const result = await this.addCampaignEvidenceUseCase.execute(
      +id,
      user.id,
      addEvidenceDto,
    );
    return {
      message: result.message,
      evidenceResponse: result.evidenceResponse,
    };
  }
}
