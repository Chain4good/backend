import { Test, TestingModule } from '@nestjs/testing';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CreateCampaignProgressDto } from './dto/create-campaign-progress.dto';
import {
  FindAllCampaignDto,
  FindAllCampaignValidDto,
  FindMyCampaignDto,
  GetCampaignDonationHistoryDto,
  RejectCampaignDto,
  UpdateCampaignStatusDto,
} from './dto/campaign.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserExtract } from 'src/auth/decorators/auth.decorators';
import { CampaignStatus, Role } from '@prisma/client';
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

describe('CampaignController', () => {
  let controller: CampaignController;
  let campaignService: jest.Mocked<CampaignService>;
  let findAllCampaignUseCase: jest.Mocked<FindAllCampaignUseCase>;
  let findAllCampaignValidUseCase: jest.Mocked<FindAllCampaignValidUseCase>;
  let findMyCampaignUseCase: jest.Mocked<FindMyCampaignUseCase>;
  let findOneCampaignUseCase: jest.Mocked<FindOneCampaignUseCase>;
  let updateCampaignUseCase: jest.Mocked<UpdateCampaignUseCase>;
  let removeCampaignUseCase: jest.Mocked<RemoveCampaignUseCase>;
  let updateCampaignStatusUseCase: jest.Mocked<UpdateCampaignStatusUseCase>;
  let approveCampaignUseCase: jest.Mocked<ApproveCampaignUseCase>;
  let rejectCampaignUseCase: jest.Mocked<RejectCampaignUseCase>;
  let addCampaignProgressUseCase: jest.Mocked<AddCampaignProgressUseCase>;
  let getCampaignProgressHistoryUseCase: jest.Mocked<GetCampaignProgressHistoryUseCase>;
  let getCampaignDonationHistoryUseCase: jest.Mocked<GetCampaignDonationHistoryUseCase>;
  let generateFinancialReportUseCase: jest.Mocked<GenerateFinancialReportUseCase>;

  const mockUser: UserExtract = {
    id: 1,
    email: 'test@example.com',
    role: { id: 1, name: 'USER', description: 'User role' } as Role,
  };

  const mockCreateCampaignDto: CreateCampaignDto = {
    title: 'Test Campaign',
    description: 'Test campaign description',
    goal: 1000000,
    deadline: '2024-12-31T23:59:59.000Z',
    categoryId: 1,
    countryId: 1,
    images: ['image1.jpg', 'image2.jpg'],
    fundraiseTypeId: 1,
    coverId: 1,
  } as CreateCampaignDto;

  const mockCampaign: any = {
    id: 1,
    title: 'Test Campaign',
    description: 'Test campaign description',
    goal: 1000000,
    deadline: new Date('2024-12-31T23:59:59.000Z'),
    status: CampaignStatus.PENDING,
    userId: 1,
    categoryId: 1,
    countryId: 1,
    fundraiseTypeId: 1,
    coverId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockCampaignService = {
      create: jest.fn(),
      calculateEthGoal: jest.fn(),
      calculateGoal: jest.fn(),
    };

    const mockUseCases = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignController],
      providers: [
        { provide: CampaignService, useValue: mockCampaignService },
        { provide: FindAllCampaignUseCase, useValue: mockUseCases },
        { provide: FindAllCampaignValidUseCase, useValue: mockUseCases },
        { provide: FindMyCampaignUseCase, useValue: mockUseCases },
        { provide: FindOneCampaignUseCase, useValue: mockUseCases },
        { provide: UpdateCampaignUseCase, useValue: mockUseCases },
        { provide: RemoveCampaignUseCase, useValue: mockUseCases },
        { provide: UpdateCampaignStatusUseCase, useValue: mockUseCases },
        { provide: ApproveCampaignUseCase, useValue: mockUseCases },
        { provide: RejectCampaignUseCase, useValue: mockUseCases },
        { provide: AddCampaignProgressUseCase, useValue: mockUseCases },
        { provide: GetCampaignProgressHistoryUseCase, useValue: mockUseCases },
        { provide: GetCampaignDonationHistoryUseCase, useValue: mockUseCases },
        { provide: GenerateFinancialReportUseCase, useValue: mockUseCases },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CampaignController>(CampaignController);
    campaignService = module.get(
      CampaignService,
    ) as jest.Mocked<CampaignService>;
    findAllCampaignUseCase = module.get(
      FindAllCampaignUseCase,
    ) as jest.Mocked<FindAllCampaignUseCase>;
    findAllCampaignValidUseCase = module.get(
      FindAllCampaignValidUseCase,
    ) as jest.Mocked<FindAllCampaignValidUseCase>;
    findMyCampaignUseCase = module.get(
      FindMyCampaignUseCase,
    ) as jest.Mocked<FindMyCampaignUseCase>;
    findOneCampaignUseCase = module.get(
      FindOneCampaignUseCase,
    ) as jest.Mocked<FindOneCampaignUseCase>;
    updateCampaignUseCase = module.get(
      UpdateCampaignUseCase,
    ) as jest.Mocked<UpdateCampaignUseCase>;
    removeCampaignUseCase = module.get(
      RemoveCampaignUseCase,
    ) as jest.Mocked<RemoveCampaignUseCase>;
    updateCampaignStatusUseCase = module.get(
      UpdateCampaignStatusUseCase,
    ) as jest.Mocked<UpdateCampaignStatusUseCase>;
    approveCampaignUseCase = module.get(
      ApproveCampaignUseCase,
    ) as jest.Mocked<ApproveCampaignUseCase>;
    rejectCampaignUseCase = module.get(
      RejectCampaignUseCase,
    ) as jest.Mocked<RejectCampaignUseCase>;
    addCampaignProgressUseCase = module.get(
      AddCampaignProgressUseCase,
    ) as jest.Mocked<AddCampaignProgressUseCase>;
    getCampaignProgressHistoryUseCase = module.get(
      GetCampaignProgressHistoryUseCase,
    ) as jest.Mocked<GetCampaignProgressHistoryUseCase>;
    getCampaignDonationHistoryUseCase = module.get(
      GetCampaignDonationHistoryUseCase,
    ) as jest.Mocked<GetCampaignDonationHistoryUseCase>;
    generateFinancialReportUseCase = module.get(
      GenerateFinancialReportUseCase,
    ) as jest.Mocked<GenerateFinancialReportUseCase>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a campaign successfully', async () => {
      campaignService.create.mockResolvedValue(mockCampaign);

      const result = await controller.create(mockCreateCampaignDto, mockUser);

      expect(campaignService.create).toHaveBeenCalledWith({
        ...mockCreateCampaignDto,
        userId: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual(mockCampaign);
    });

    it('should handle campaign creation errors', async () => {
      const error = new Error('Campaign creation failed');
      campaignService.create.mockRejectedValue(error);

      await expect(
        controller.create(mockCreateCampaignDto, mockUser),
      ).rejects.toThrow('Campaign creation failed');
    });
  });

  describe('findAll', () => {
    it('should find all campaigns', async () => {
      const dto: FindAllCampaignDto = { page: 1, limit: 10 };
      const mockResult: any = { data: [mockCampaign], meta: { total: 1 } };

      findAllCampaignUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.findAll(dto);

      expect(findAllCampaignUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findCampaignValid', () => {
    it('should find valid campaigns', async () => {
      const dto: FindAllCampaignValidDto = { page: 1, limit: 10 };
      const mockResult: any = { data: [mockCampaign], meta: { total: 1 } };

      findAllCampaignValidUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.findCampaignValid(dto);

      expect(findAllCampaignValidUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findMyCampaigns', () => {
    it('should find user campaigns', async () => {
      const dto: FindMyCampaignDto = { page: 1, limit: 10 };
      const mockResult: any = { data: [mockCampaign], meta: { total: 1 } };

      findMyCampaignUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.findMyCampaigns(mockUser, dto);

      expect(findMyCampaignUseCase.execute).toHaveBeenCalledWith(
        mockUser.id,
        dto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('calculateEthGoal', () => {
    it('should calculate ETH goal', async () => {
      const vndAmount = 1000000;
      const ethGoal = 0.5;

      campaignService.calculateEthGoal.mockResolvedValue(ethGoal);

      const result = await controller.calculateEthGoal(vndAmount);

      expect(campaignService.calculateEthGoal).toHaveBeenCalledWith(vndAmount);
      expect(result).toEqual(ethGoal);
    });
  });

  describe('calculateGoal', () => {
    it('should calculate token goal', async () => {
      const vndAmount = 1000000;
      const token = 'bitcoin';
      const tokenGoal = 0.02;

      campaignService.calculateGoal.mockResolvedValue(tokenGoal);

      const result = await controller.calculateGoal(vndAmount, token);

      expect(campaignService.calculateGoal).toHaveBeenCalledWith(
        vndAmount,
        token,
      );
      expect(result).toEqual(tokenGoal);
    });
  });

  describe('findOne', () => {
    it('should find one campaign', async () => {
      const campaignId = '1';

      findOneCampaignUseCase.execute.mockResolvedValue(mockCampaign);

      const result = await controller.findOne(campaignId);

      expect(findOneCampaignUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCampaign);
    });
  });

  describe('update', () => {
    it('should update a campaign', async () => {
      const campaignId = '1';
      const updateDto: UpdateCampaignDto = { title: 'Updated Campaign' };

      updateCampaignUseCase.execute.mockResolvedValue({
        ...mockCampaign,
        title: 'Updated Campaign',
      });

      const result = await controller.update(campaignId, updateDto);

      expect(updateCampaignUseCase.execute).toHaveBeenCalledWith(1, updateDto);
      expect(result.title).toEqual('Updated Campaign');
    });
  });

  describe('remove', () => {
    it('should remove a campaign', async () => {
      const campaignId = '1';

      removeCampaignUseCase.execute.mockResolvedValue(mockCampaign);

      const result = await controller.remove(campaignId);

      expect(removeCampaignUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCampaign);
    });
  });

  describe('getDonationHistory', () => {
    it('should get campaign donation history', async () => {
      const campaignId = '1';
      const dto: GetCampaignDonationHistoryDto = { groupBy: 'day' };
      const mockHistory: any = {
        data: [{ date: new Date('2024-01-01'), count: 5, total_amount: 100 }],
        summary: { totalDonations: 5, totalAmount: 100, averageAmount: 20 },
      };

      getCampaignDonationHistoryUseCase.execute.mockResolvedValue(mockHistory);

      const result = await controller.getDonationHistory(campaignId, dto);

      expect(getCampaignDonationHistoryUseCase.execute).toHaveBeenCalledWith(
        1,
        dto,
      );
      expect(result).toEqual(mockHistory);
    });
  });

  describe('addProgress', () => {
    it('should add campaign progress', async () => {
      const campaignId = '1';
      const progressDto: CreateCampaignProgressDto = {
        title: 'Progress Update',
        description: 'Progress description',
        images: ['progress1.jpg'],
      };
      const mockProgress: any = {
        id: 1,
        ...progressDto,
        campaign: { user: { name: 'Test User', id: 1 } },
      };

      addCampaignProgressUseCase.execute.mockResolvedValue(mockProgress);

      const result = await controller.addProgress(campaignId, progressDto);

      expect(addCampaignProgressUseCase.execute).toHaveBeenCalledWith(
        1,
        progressDto,
      );
      expect(result).toEqual(mockProgress);
    });
  });

  describe('getProgressHistory', () => {
    it('should get campaign progress history', async () => {
      const campaignId = '1';
      const mockProgressHistory: any = [
        {
          id: 1,
          title: 'Progress 1',
          description: 'Description 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          images: ['image1.jpg'],
          documents: ['doc1.pdf'],
          campaignId: 1,
        },
      ];

      getCampaignProgressHistoryUseCase.execute.mockResolvedValue(
        mockProgressHistory,
      );

      const result = await controller.getProgressHistory(campaignId);

      expect(getCampaignProgressHistoryUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProgressHistory);
    });
  });

  describe('getFinancialReport', () => {
    it('should get financial report', async () => {
      const campaignId = '1';
      const mockReport: any = {
        campaignId: 1,
        campaignTitle: 'Test Campaign',
        totalDonatedAmount: 1000,
        totalDonationsCount: 10,
        averageDonationAmount: 100,
        detailedDonationHistory: [
          { date: new Date(), count: 5, total_amount: 500 },
        ],
      };

      generateFinancialReportUseCase.execute.mockResolvedValue(mockReport);

      const result = await controller.getFinancialReport(campaignId);

      expect(generateFinancialReportUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockReport);
    });
  });

  describe('updateCampaignStatus', () => {
    it('should update campaign status', async () => {
      const campaignId = '1';
      const statusDto: UpdateCampaignStatusDto = {
        status: CampaignStatus.APPROVED,
        reason: 'Approved by admin',
      };
      const updatedCampaign = {
        ...mockCampaign,
        status: CampaignStatus.APPROVED,
      };

      updateCampaignStatusUseCase.execute.mockResolvedValue(updatedCampaign);

      const result = await controller.updateCampaignStatus(
        campaignId,
        statusDto,
      );

      expect(updateCampaignStatusUseCase.execute).toHaveBeenCalledWith(
        1,
        statusDto,
      );
      expect(result).toEqual({
        message: 'Campaign status updated successfully',
        campaign: updatedCampaign,
      });
    });
  });

  describe('approveCampaign', () => {
    it('should approve campaign', async () => {
      const campaignId = '1';
      const approvedCampaign = {
        ...mockCampaign,
        status: CampaignStatus.APPROVED,
      };

      approveCampaignUseCase.execute.mockResolvedValue(approvedCampaign);

      const result = await controller.approveCampaign(campaignId);

      expect(approveCampaignUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Campaign approved successfully',
        campaign: approvedCampaign,
      });
    });
  });

  describe('rejectCampaign', () => {
    it('should reject campaign', async () => {
      const campaignId = '1';
      const rejectDto: RejectCampaignDto = { reason: 'Invalid content' };
      const rejectedCampaign = {
        ...mockCampaign,
        status: CampaignStatus.REJECTED,
      };

      rejectCampaignUseCase.execute.mockResolvedValue(rejectedCampaign);

      const result = await controller.rejectCampaign(campaignId, rejectDto);

      expect(rejectCampaignUseCase.execute).toHaveBeenCalledWith(1, rejectDto);
      expect(result).toEqual({
        message: 'Campaign rejected successfully',
        campaign: rejectedCampaign,
      });
    });
  });
});
