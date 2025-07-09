import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AnalyzeCampaignDto } from './dto/analyze-campaign.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserExtract } from 'src/auth/decorators/auth.decorators';
import { Role } from '@prisma/client';

describe('AiController', () => {
  let controller: AiController;
  let aiService: jest.Mocked<AiService>;

  const mockUser: UserExtract = {
    id: 1,
    email: 'test@example.com',
    role: { id: 1, name: 'USER', description: 'User role' } as Role,
  };

  const mockAnalyzeCampaignDto: AnalyzeCampaignDto = {
    title: 'Test Campaign',
    description: 'Test campaign description',
  };

  beforeEach(async () => {
    const mockAiService = {
      analyzeCampaign: jest.fn(),
      analyzeCampaignWithGemini: jest.fn(),
      analyzeCampaignTrust: jest.fn(),
      optimizeCampaignContent: jest.fn(),
      getPersonalizedRecommendations: jest.fn(),
      textToSpeech: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AiController>(AiController);
    aiService = module.get(AiService) as jest.Mocked<AiService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('analyze', () => {
    it('should analyze campaign successfully', async () => {
      const mockAnalysis = {
        summary: 'Test summary',
        analysis: 'Test analysis',
      };

      aiService.analyzeCampaign.mockResolvedValue(mockAnalysis);

      const result = await controller.analyze(mockAnalyzeCampaignDto);

      expect(aiService.analyzeCampaign).toHaveBeenCalledWith(
        mockAnalyzeCampaignDto.title,
        mockAnalyzeCampaignDto.description,
      );
      expect(result).toEqual(mockAnalysis);
    });

    it('should handle analysis errors', async () => {
      const error = new Error('Analysis failed');
      aiService.analyzeCampaign.mockRejectedValue(error);

      await expect(controller.analyze(mockAnalyzeCampaignDto)).rejects.toThrow(
        'Analysis failed',
      );
    });
  });

  describe('analyzeGemine', () => {
    it('should analyze campaign with Gemini successfully', async () => {
      const mockAnalysis = {
        summary: 'Gemini summary',
        analysis: 'Gemini analysis',
      };

      aiService.analyzeCampaignWithGemini.mockResolvedValue(mockAnalysis);

      const result = await controller.analyzeGemine(mockAnalyzeCampaignDto);

      expect(aiService.analyzeCampaignWithGemini).toHaveBeenCalledWith(
        mockAnalyzeCampaignDto.title,
        mockAnalyzeCampaignDto.description,
      );
      expect(result).toEqual(mockAnalysis);
    });

    it('should handle Gemini analysis errors', async () => {
      const error = new Error('Gemini analysis failed');
      aiService.analyzeCampaignWithGemini.mockRejectedValue(error);

      await expect(
        controller.analyzeGemine(mockAnalyzeCampaignDto),
      ).rejects.toThrow('Gemini analysis failed');
    });
  });

  describe('analyzeTrust', () => {
    it('should analyze campaign trust successfully', async () => {
      const campaignId = 1;
      const mockTrustAnalysis = {
        trustScore: 85,
        sentiment: 'positive' as const,
        credibilityFactors: ['Factor 1', 'Factor 2'],
        riskFactors: ['Risk 1'],
        recommendations: ['Recommendation 1'],
      };

      aiService.analyzeCampaignTrust.mockResolvedValue(mockTrustAnalysis);

      const result = await controller.analyzeTrust(campaignId);

      expect(aiService.analyzeCampaignTrust).toHaveBeenCalledWith(campaignId);
      expect(result).toEqual(mockTrustAnalysis);
    });

    it('should handle trust analysis errors', async () => {
      const campaignId = 1;
      const error = new Error('Trust analysis failed');
      aiService.analyzeCampaignTrust.mockRejectedValue(error);

      await expect(controller.analyzeTrust(campaignId)).rejects.toThrow(
        'Trust analysis failed',
      );
    });
  });

  describe('optimize', () => {
    it('should optimize campaign content successfully', async () => {
      const mockOptimization = {
        optimizedTitle: 'Optimized Title',
        optimizedDescription: '<p>Optimized Description</p>',
        keywords: ['charity', 'donation', 'help'],
        suggestedImprovements: ['Improvement 1', 'Improvement 2'],
        targetAudienceInsights: ['Young professionals', 'Social media users'],
      };

      aiService.optimizeCampaignContent.mockResolvedValue(mockOptimization);

      const result = await controller.optimize(mockAnalyzeCampaignDto);

      expect(aiService.optimizeCampaignContent).toHaveBeenCalledWith(
        mockAnalyzeCampaignDto.title,
        mockAnalyzeCampaignDto.description,
      );
      expect(result).toEqual(mockOptimization);
    });

    it('should handle optimization errors', async () => {
      const error = new Error('Optimization failed');
      aiService.optimizeCampaignContent.mockRejectedValue(error);

      await expect(controller.optimize(mockAnalyzeCampaignDto)).rejects.toThrow(
        'Optimization failed',
      );
    });
  });

  describe('getRecommendations', () => {
    it('should get personalized recommendations successfully', async () => {
      const mockRecommendations = {
        recommendations: [
          {
            campaignId: 1,
            score: 85,
            matchingFactors: ['Similar category', 'Past donation history'],
            relevanceScore: 0.85,
            blockchainFactors: {
              gasFeeEstimate: '0.01 ETH',
              networkCompatibility: 'High',
              contractSecurity: 'Verified',
            },
          },
        ],
        explanations: [
          'Based on your donation history, this campaign matches your interests',
        ],
      };

      aiService.getPersonalizedRecommendations.mockResolvedValue(
        mockRecommendations,
      );

      const result = await controller.getRecommendations(mockUser);

      expect(aiService.getPersonalizedRecommendations).toHaveBeenCalledWith(
        Number(mockUser.id),
      );
      expect(result).toEqual(mockRecommendations);
    });

    it('should handle recommendation errors', async () => {
      const error = new Error('Recommendations failed');
      aiService.getPersonalizedRecommendations.mockRejectedValue(error);

      await expect(controller.getRecommendations(mockUser)).rejects.toThrow(
        'Recommendations failed',
      );
    });
  });

  describe('textToSpeech', () => {
    it('should generate text-to-speech successfully', async () => {
      const campaignId = 1;
      const mockAudioUrl = 'https://example.com/audio.mp3';

      aiService.textToSpeech.mockResolvedValue(mockAudioUrl);

      const result = await controller.textToSpeech(campaignId);

      expect(aiService.textToSpeech).toHaveBeenCalledWith(campaignId);
      expect(result).toEqual(mockAudioUrl);
    });

    it('should handle text-to-speech errors', async () => {
      const campaignId = 1;
      const error = new Error('TTS failed');
      aiService.textToSpeech.mockRejectedValue(error);

      await expect(controller.textToSpeech(campaignId)).rejects.toThrow(
        'TTS failed',
      );
    });
  });
});
