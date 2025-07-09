import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { GeminiService } from '../gemini/gemini.service';
import { FindOneCampaignUseCase } from '../campaign/use-cases/find-one-campaign.use-case';
import { UsersService } from '../users/users.service';
import { DonationService } from '../donation/donation.service';

// Mock OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => mockOpenAI),
  };
});

describe('AiService', () => {
  let service: AiService;
  let configService: jest.Mocked<ConfigService>;
  let geminiService: jest.Mocked<GeminiService>;
  let findOneCampaignUseCase: jest.Mocked<FindOneCampaignUseCase>;
  let usersService: jest.Mocked<UsersService>;
  let donationService: jest.Mocked<DonationService>;

  const mockCampaign = {
    id: 1,
    title: 'Test Campaign',
    description: 'This is a test campaign description for charity work.',
    audio: 'audio-url.mp3',
  };

  const mockUser = {
    id: 1,
    address: '0x123456789',
    password: 'hashedPassword',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockDonations = [
    {
      campaignId: 1,
      amount: '100',
      donatedAt: new Date(),
      campaign: { categoryId: 1 },
    },
    {
      campaignId: 2,
      amount: '50',
      donatedAt: new Date(),
      campaign: { categoryId: 2 },
    },
  ];

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const mockGeminiService = {
      generateContent: jest.fn(),
      tts: jest.fn(),
    };

    const mockFindOneCampaignUseCase = {
      execute: jest.fn(),
    };

    const mockUsersService = {
      findById: jest.fn(),
    };

    const mockDonationService = {
      findAllByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: GeminiService,
          useValue: mockGeminiService,
        },
        {
          provide: FindOneCampaignUseCase,
          useValue: mockFindOneCampaignUseCase,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: DonationService,
          useValue: mockDonationService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    configService = module.get(ConfigService);
    geminiService = module.get(GeminiService);
    findOneCampaignUseCase = module.get(FindOneCampaignUseCase);
    usersService = module.get(UsersService);
    donationService = module.get(DonationService);

    // Setup default mocks
    configService.get.mockReturnValue('test-api-key');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeCampaign', () => {
    it('should analyze campaign with OpenAI successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Test campaign summary',
                analysis: 'Test analysis of the campaign',
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.analyzeCampaign(
        'Test Title',
        'Test Description',
      );

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo-0125',
        messages: [
          { role: 'user', content: expect.stringContaining('Test Title') },
        ],
      });

      expect(result).toEqual({
        summary: 'Test campaign summary',
        analysis: 'Test analysis of the campaign',
      });
    });

    it('should handle empty response from OpenAI', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.analyzeCampaign(
        'Test Title',
        'Test Description',
      );

      expect(result).toEqual({});
    });

    it('should handle invalid JSON response from OpenAI', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'invalid json',
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      await expect(
        service.analyzeCampaign('Test Title', 'Test Description'),
      ).rejects.toThrow();
    });

    it('should handle OpenAI API error', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('OpenAI API error'),
      );

      await expect(
        service.analyzeCampaign('Test Title', 'Test Description'),
      ).rejects.toThrow('OpenAI API error');
    });
  });

  describe('generateThankYouLetter', () => {
    it('should generate thank you letter successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                subject: 'Thank you for your donation',
                content: '<div>Thank you for supporting our campaign</div>',
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.generateThankYouLetter('Test Campaign');

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: expect.stringContaining('Test Campaign') },
        ],
        response_format: { type: 'json_object' },
      });

      expect(result).toEqual({
        subject: 'Thank you for your donation',
        content: '<div>Thank you for supporting our campaign</div>',
      });
    });

    it('should handle empty response from OpenAI', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      await expect(
        service.generateThankYouLetter('Test Campaign'),
      ).rejects.toThrow('Failed to generate TTS: Empty response from OpenAI');
    });

    it('should clean control characters from response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                subject: 'Thank\x00 you',
                content: '<div>Thank\x1F you\x7F</div>',
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.generateThankYouLetter('Test Campaign');

      expect(result).toEqual({
        subject: 'Thank you',
        content: '<div>Thank you</div>',
      });
    });

    it('should handle JSON parsing error', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'invalid json',
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      await expect(
        service.generateThankYouLetter('Test Campaign'),
      ).rejects.toThrow('Failed to generate TTS:');
    });
  });

  describe('analyzeCampaignWithGemini', () => {
    it('should analyze campaign with Gemini successfully', async () => {
      const mockAnalysis = {
        summary: 'Gemini campaign summary',
        analysis: 'Gemini analysis of the campaign',
      };

      geminiService.generateContent.mockResolvedValue(
        JSON.stringify(mockAnalysis),
      );

      const result = await service.analyzeCampaignWithGemini(
        'Test Title',
        'Test Description',
      );

      expect(geminiService.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('Test Title'),
      );
      expect(result).toEqual(mockAnalysis);
    });

    it('should handle Gemini service error gracefully', async () => {
      geminiService.generateContent.mockRejectedValue(
        new Error('Gemini API error'),
      );

      const result = await service.analyzeCampaignWithGemini(
        'Test Title',
        'Test Description',
      );

      expect(result).toEqual({
        summary: 'Không thể phân tích chiến dịch này',
        analysis:
          'Đã xảy ra lỗi trong quá trình phân tích. Vui lòng thử lại sau.',
      });
    });

    it('should handle invalid JSON from Gemini', async () => {
      geminiService.generateContent.mockResolvedValue('invalid json');

      const result = await service.analyzeCampaignWithGemini(
        'Test Title',
        'Test Description',
      );

      expect(result).toEqual({
        summary: 'Không thể phân tích chiến dịch này',
        analysis:
          'Đã xảy ra lỗi trong quá trình phân tích. Vui lòng thử lại sau.',
      });
    });
  });

  describe('analyzeCampaignTrust', () => {
    it('should analyze campaign trust successfully', async () => {
      const mockTrustAnalysis = {
        trustScore: 85,
        sentiment: 'positive' as const,
        credibilityFactors: ['Clear goals', 'Transparent reporting'],
        riskFactors: ['New organization'],
        recommendations: ['Add more documentation'],
      };

      findOneCampaignUseCase.execute.mockResolvedValue(mockCampaign as any);
      geminiService.generateContent.mockResolvedValue(
        JSON.stringify(mockTrustAnalysis),
      );

      const result = await service.analyzeCampaignTrust(1);

      expect(findOneCampaignUseCase.execute).toHaveBeenCalledWith(1);
      expect(geminiService.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('Test Campaign'),
      );
      expect(result).toEqual(mockTrustAnalysis);
    });

    it('should throw error when campaign not found', async () => {
      findOneCampaignUseCase.execute.mockResolvedValue(null);

      await expect(service.analyzeCampaignTrust(999)).rejects.toThrow(
        'Campaign not found',
      );
    });

    it('should handle Gemini service error', async () => {
      findOneCampaignUseCase.execute.mockResolvedValue(mockCampaign as any);
      geminiService.generateContent.mockRejectedValue(
        new Error('Gemini error'),
      );

      await expect(service.analyzeCampaignTrust(1)).rejects.toThrow(
        'Gemini error',
      );
    });
  });

  describe('optimizeCampaignContent', () => {
    it('should optimize campaign content successfully', async () => {
      const mockOptimization = {
        optimizedTitle: 'Optimized Campaign Title',
        optimizedDescription:
          '<div>Optimized campaign description with proper HTML formatting</div>',
        keywords: ['charity', 'donation', 'help'],
        suggestedImprovements: [
          'Add more emotional appeal',
          'Include success stories',
        ],
        targetAudienceInsights: ['Young professionals', 'Social media users'],
      };

      geminiService.generateContent.mockResolvedValue(
        JSON.stringify(mockOptimization),
      );

      const result = await service.optimizeCampaignContent(
        'Test Title',
        'This is a test campaign description for charity work.',
      );

      expect(geminiService.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('Test Title'),
      );
      expect(result).toEqual(mockOptimization);
    });

    it('should wrap description in div if not starting with HTML tag', async () => {
      const mockOptimization = {
        optimizedTitle: 'Optimized Title',
        optimizedDescription: 'Plain text description without HTML tags',
        keywords: ['charity'],
        suggestedImprovements: ['Add HTML formatting'],
        targetAudienceInsights: ['General public'],
      };

      geminiService.generateContent.mockResolvedValue(
        JSON.stringify(mockOptimization),
      );

      const result = await service.optimizeCampaignContent(
        'Test Title',
        'This is a test campaign description for charity work.',
      );

      expect(result.optimizedDescription).toBe(
        '<div>Plain text description without HTML tags</div>',
      );
    });

    it('should throw error if content is too shortened', async () => {
      const shortDescription = 'Very short description';
      const mockOptimization = {
        optimizedTitle: 'Title',
        optimizedDescription: '<div>Short</div>', // Much shorter than original
        keywords: ['test'],
        suggestedImprovements: [],
        targetAudienceInsights: [],
      };

      geminiService.generateContent.mockResolvedValue(
        JSON.stringify(mockOptimization),
      );

      await expect(
        service.optimizeCampaignContent('Test Title', shortDescription),
      ).rejects.toThrow('Nội dung đã bị rút gọn quá nhiều');
    });

    it('should handle Gemini service error', async () => {
      geminiService.generateContent.mockRejectedValue(
        new Error('Gemini error'),
      );

      await expect(
        service.optimizeCampaignContent('Test Title', 'Test Description'),
      ).rejects.toThrow('Tối ưu hóa chiến dịch thất bại - Vui lòng thử lại');
    });

    it('should handle invalid JSON response', async () => {
      geminiService.generateContent.mockResolvedValue('invalid json');

      await expect(
        service.optimizeCampaignContent('Test Title', 'Test Description'),
      ).rejects.toThrow('Tối ưu hóa chiến dịch thất bại - Vui lòng thử lại');
    });
  });

  describe('getPersonalizedRecommendations', () => {
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

      usersService.findById.mockResolvedValue(mockUser as any);
      donationService.findAllByUserId.mockResolvedValue(mockDonations as any);
      geminiService.generateContent.mockResolvedValue(
        JSON.stringify(mockRecommendations),
      );

      const result = await service.getPersonalizedRecommendations(1);

      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(donationService.findAllByUserId).toHaveBeenCalledWith(1);
      expect(geminiService.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('0x123456789'),
      );
      expect(result).toEqual(mockRecommendations);
    });

    it('should handle user with no address', async () => {
      const userWithoutAddress = { ...mockUser, address: null };
      const mockRecommendations = {
        recommendations: [],
        explanations: ['No recommendations available'],
      };

      usersService.findById.mockResolvedValue(userWithoutAddress as any);
      donationService.findAllByUserId.mockResolvedValue([]);
      geminiService.generateContent.mockResolvedValue(
        JSON.stringify(mockRecommendations),
      );

      const result = await service.getPersonalizedRecommendations(1);

      expect(geminiService.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('Chưa xác định'),
      );
      expect(result).toEqual(mockRecommendations);
    });

    it('should handle user not found', async () => {
      usersService.findById.mockResolvedValue(null);
      donationService.findAllByUserId.mockResolvedValue([]);

      const mockRecommendations = {
        recommendations: [],
        explanations: [],
      };

      geminiService.generateContent.mockResolvedValue(
        JSON.stringify(mockRecommendations),
      );

      const result = await service.getPersonalizedRecommendations(999);

      expect(result).toEqual(mockRecommendations);
    });

    it('should handle Gemini service error', async () => {
      usersService.findById.mockResolvedValue(mockUser as any);
      donationService.findAllByUserId.mockResolvedValue(mockDonations as any);
      geminiService.generateContent.mockRejectedValue(
        new Error('Gemini error'),
      );

      await expect(service.getPersonalizedRecommendations(1)).rejects.toThrow(
        'Không thể tạo đề xuất chiến dịch',
      );
    });
  });

  describe('textToSpeech', () => {
    it('should return existing audio if available', async () => {
      findOneCampaignUseCase.execute.mockResolvedValue(mockCampaign as any);

      const result = await service.textToSpeech(1);

      expect(findOneCampaignUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toBe('audio-url.mp3');
      expect(geminiService.tts).not.toHaveBeenCalled();
    });

    it('should generate new audio if not available', async () => {
      const campaignWithoutAudio = { ...mockCampaign, audio: null };
      findOneCampaignUseCase.execute.mockResolvedValue(
        campaignWithoutAudio as any,
      );
      geminiService.tts.mockResolvedValue('new-audio-url.mp3');

      const result = await service.textToSpeech(1);

      expect(findOneCampaignUseCase.execute).toHaveBeenCalledWith(1);
      expect(geminiService.tts).toHaveBeenCalledWith(
        campaignWithoutAudio.description,
        1,
      );
      expect(result).toBe('new-audio-url.mp3');
    });

    it('should throw error when campaign not found', async () => {
      findOneCampaignUseCase.execute.mockResolvedValue(null);

      await expect(service.textToSpeech(999)).rejects.toThrow(
        'Campaign not found',
      );
    });

    it('should throw error when article content is too short', async () => {
      const campaignWithShortDescription = {
        ...mockCampaign,
        description: 'Short',
        audio: null,
      };
      findOneCampaignUseCase.execute.mockResolvedValue(
        campaignWithShortDescription as any,
      );

      await expect(service.textToSpeech(1)).rejects.toThrow(
        'Article content is too short for TTS',
      );
    });

    it('should throw error when description is null', async () => {
      const campaignWithNullDescription = {
        ...mockCampaign,
        description: null,
        audio: null,
      };
      findOneCampaignUseCase.execute.mockResolvedValue(
        campaignWithNullDescription as any,
      );

      await expect(service.textToSpeech(1)).rejects.toThrow(
        'Article content is too short for TTS',
      );
    });

    it('should handle TTS service error', async () => {
      const campaignWithoutAudio = { ...mockCampaign, audio: null };
      findOneCampaignUseCase.execute.mockResolvedValue(
        campaignWithoutAudio as any,
      );
      geminiService.tts.mockRejectedValue(new Error('TTS service error'));

      await expect(service.textToSpeech(1)).rejects.toThrow(
        'TTS service error',
      );
    });
  });

  describe('Constructor and Configuration', () => {
    it('should initialize OpenAI with correct API key', () => {
      expect(configService.get).toHaveBeenCalledWith('OPENAI_API_KEY');
    });

    it('should handle missing API key gracefully', async () => {
      // Test that service still initializes even if API key is not set
      configService.get.mockReturnValue(undefined);

      // The service should still be created
      expect(service).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';

      mockOpenAI.chat.completions.create.mockRejectedValue(networkError);

      await expect(service.analyzeCampaign('Test', 'Test')).rejects.toThrow(
        'Network error',
      );
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';

      mockOpenAI.chat.completions.create.mockRejectedValue(rateLimitError);

      await expect(
        service.generateThankYouLetter('Test Campaign'),
      ).rejects.toThrow('Rate limit exceeded');
    });
  });
});
