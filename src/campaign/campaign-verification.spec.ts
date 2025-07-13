import { Test, TestingModule } from '@nestjs/testing';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { RequestCampaignVerificationUseCase } from './use-cases/request-campaign-verification.use-case';
import { AddCampaignEvidenceUseCase } from './use-cases/add-campaign-evidence.use-case';
import { RequestVerificationDto, AddEvidenceDto } from './dto/campaign.dto';
import {
  FindAllCampaignUseCase,
  FindAllCampaignValidUseCase,
  FindMyCampaignUseCase,
  FindOneCampaignUseCase,
  UpdateCampaignUseCase,
  RemoveCampaignUseCase,
  UpdateCampaignStatusUseCase,
  ApproveCampaignUseCase,
  RejectCampaignUseCase,
  AddCampaignProgressUseCase,
  GetCampaignProgressHistoryUseCase,
  GetCampaignDonationHistoryUseCase,
  GenerateFinancialReportUseCase,
} from './use-cases';

describe('Campaign Verification', () => {
  let controller: CampaignController;
  let requestVerificationUseCase: RequestCampaignVerificationUseCase;
  let addEvidenceUseCase: AddCampaignEvidenceUseCase;

  const mockRequestVerificationUseCase = {
    execute: jest.fn(),
  };

  const mockAddEvidenceUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignController],
      providers: [
        {
          provide: RequestCampaignVerificationUseCase,
          useValue: mockRequestVerificationUseCase,
        },
        {
          provide: AddCampaignEvidenceUseCase,
          useValue: mockAddEvidenceUseCase,
        },
        // Mock other dependencies
        { provide: CampaignService, useValue: {} },
        { provide: FindAllCampaignUseCase, useValue: {} },
        { provide: FindAllCampaignValidUseCase, useValue: {} },
        { provide: FindMyCampaignUseCase, useValue: {} },
        { provide: FindOneCampaignUseCase, useValue: {} },
        { provide: UpdateCampaignUseCase, useValue: {} },
        { provide: RemoveCampaignUseCase, useValue: {} },
        { provide: UpdateCampaignStatusUseCase, useValue: {} },
        { provide: ApproveCampaignUseCase, useValue: {} },
        { provide: RejectCampaignUseCase, useValue: {} },
        { provide: AddCampaignProgressUseCase, useValue: {} },
        { provide: GetCampaignProgressHistoryUseCase, useValue: {} },
        { provide: GetCampaignDonationHistoryUseCase, useValue: {} },
        { provide: GenerateFinancialReportUseCase, useValue: {} },
      ],
    }).compile();

    controller = module.get<CampaignController>(CampaignController);
    requestVerificationUseCase = module.get<RequestCampaignVerificationUseCase>(
      RequestCampaignVerificationUseCase,
    );
    addEvidenceUseCase = module.get<AddCampaignEvidenceUseCase>(
      AddCampaignEvidenceUseCase,
    );
  });

  describe('requestVerification', () => {
    it('should request verification for a campaign', async () => {
      const campaignId = '1';
      const adminUser = { id: 1, email: 'admin@test.com', name: 'Admin' };
      const requestDto: RequestVerificationDto = {
        message: 'Please provide additional documents',
        reason: 'Missing identity verification',
      };

      const expectedResult = {
        message: 'Verification request sent successfully',
        verificationRequest: { id: 1 },
        campaign: { id: 1, title: 'Test Campaign' },
      };

      mockRequestVerificationUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.requestVerification(
        campaignId,
        requestDto,
        adminUser,
      );

      expect(mockRequestVerificationUseCase.execute).toHaveBeenCalledWith(
        1,
        1,
        requestDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('addEvidence', () => {
    it('should add evidence to a campaign', async () => {
      const campaignId = '1';
      const user = { id: 2, email: 'user@test.com', name: 'User' };
      const evidenceDto: AddEvidenceDto = {
        description: 'Additional identity documents',
        documents: [
          'https://example.com/doc1.pdf',
          'https://example.com/doc2.jpg',
        ],
      };

      const expectedResult = {
        message:
          'Evidence submitted successfully. Your campaign is now under review.',
        evidenceResponse: { id: 1 },
      };

      mockAddEvidenceUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.addEvidence(
        campaignId,
        evidenceDto,
        user,
      );

      expect(mockAddEvidenceUseCase.execute).toHaveBeenCalledWith(
        1,
        2,
        evidenceDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('DTOs validation', () => {
    it('should validate RequestVerificationDto', () => {
      const validDto: RequestVerificationDto = {
        message: 'Please provide additional documents',
        reason: 'Missing verification',
      };

      expect(validDto.message).toBeDefined();
      expect(typeof validDto.message).toBe('string');
      expect(validDto.reason).toBeDefined();
    });

    it('should validate AddEvidenceDto', () => {
      const validDto: AddEvidenceDto = {
        description: 'Additional documents',
        documents: ['https://example.com/doc1.pdf'],
      };

      expect(validDto.documents).toBeDefined();
      expect(Array.isArray(validDto.documents)).toBe(true);
      expect(validDto.documents.length).toBeGreaterThan(0);
    });
  });
});
