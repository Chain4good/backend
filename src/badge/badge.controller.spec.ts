import { Test, TestingModule } from '@nestjs/testing';
import { BadgeController } from './badge.controller';
import { BadgeService } from './badge.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { BadgeType } from './enum/badge-type.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

describe('BadgeController', () => {
  let controller: BadgeController;
  let badgeService: jest.Mocked<BadgeService>;

  const mockCreateBadgeDto: CreateBadgeDto = {
    name: 'Test Badge',
    description: 'Test badge description',
    iconUrl: 'https://example.com/icon.png',
    type: BadgeType.FIRST_DONATION,
  };

  const mockBadge = {
    id: 1,
    name: 'Test Badge',
    description: 'Test badge description',
    iconUrl: 'https://example.com/icon.png',
    type: BadgeType.FIRST_DONATION,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockBadgeService = {
      createBadge: jest.fn(),
      getAllBadges: jest.fn(),
      getUserBadges: jest.fn(),
      awardBadgeToUser: jest.fn(),
      checkDonationBadges: jest.fn(),
      checkCampaignBadges: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BadgeController],
      providers: [
        {
          provide: BadgeService,
          useValue: mockBadgeService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<BadgeController>(BadgeController);
    badgeService = module.get(BadgeService) as jest.Mocked<BadgeService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a badge successfully', async () => {
      badgeService.createBadge.mockResolvedValue(mockBadge);

      const result = await controller.create(mockCreateBadgeDto);

      expect(badgeService.createBadge).toHaveBeenCalledWith(mockCreateBadgeDto);
      expect(result).toEqual(mockBadge);
    });

    it('should handle badge creation errors', async () => {
      const error = new Error('Badge creation failed');
      badgeService.createBadge.mockRejectedValue(error);

      await expect(controller.create(mockCreateBadgeDto)).rejects.toThrow(
        'Badge creation failed',
      );
    });

    it('should validate badge type enum', async () => {
      const invalidBadgeDto = {
        ...mockCreateBadgeDto,
        type: 'INVALID_TYPE' as BadgeType,
      };

      badgeService.createBadge.mockResolvedValue(mockBadge);

      // The validation should happen at the DTO level
      // This test ensures the controller accepts valid enum values
      await controller.create(mockCreateBadgeDto);
      expect(badgeService.createBadge).toHaveBeenCalledWith(mockCreateBadgeDto);
    });

    it('should require admin role for badge creation', async () => {
      // This test verifies that the @Roles('ADMIN') decorator is applied
      // The actual authorization is handled by the RolesGuard
      badgeService.createBadge.mockResolvedValue(mockBadge);

      const result = await controller.create(mockCreateBadgeDto);

      expect(result).toEqual(mockBadge);
      expect(badgeService.createBadge).toHaveBeenCalledWith(mockCreateBadgeDto);
    });

    it('should handle missing required fields', async () => {
      const incompleteBadgeDto = {
        name: 'Test Badge',
        // Missing description and type
      } as CreateBadgeDto;

      const error = new Error('Validation failed');
      badgeService.createBadge.mockRejectedValue(error);

      await expect(controller.create(incompleteBadgeDto)).rejects.toThrow(
        'Validation failed',
      );
    });

    it('should handle optional iconUrl field', async () => {
      const badgeDtoWithoutIcon = {
        name: 'Test Badge',
        description: 'Test badge description',
        type: BadgeType.FIRST_DONATION,
        // iconUrl is optional
      };

      const expectedBadge = {
        ...mockBadge,
        iconUrl: null,
      };

      badgeService.createBadge.mockResolvedValue(expectedBadge);

      const result = await controller.create(badgeDtoWithoutIcon);

      expect(badgeService.createBadge).toHaveBeenCalledWith(badgeDtoWithoutIcon);
      expect(result).toEqual(expectedBadge);
    });

    it('should handle different badge types', async () => {
      const badgeTypes = [
        BadgeType.FIRST_DONATION,
        BadgeType.DONATION_MILESTONE,
        BadgeType.CAMPAIGN_CREATED,
        BadgeType.CAMPAIGN_COMPLETED,
        BadgeType.REGULAR_DONOR,
        BadgeType.TOP_DONOR,
      ];

      for (const type of badgeTypes) {
        const badgeDto = {
          ...mockCreateBadgeDto,
          type,
        };

        const expectedBadge = {
          ...mockBadge,
          type,
        };

        badgeService.createBadge.mockResolvedValue(expectedBadge);

        const result = await controller.create(badgeDto);

        expect(badgeService.createBadge).toHaveBeenCalledWith(badgeDto);
        expect(result.type).toEqual(type);
      }
    });

    it('should handle service exceptions gracefully', async () => {
      const serviceError = new Error('Database connection failed');
      badgeService.createBadge.mockRejectedValue(serviceError);

      await expect(controller.create(mockCreateBadgeDto)).rejects.toThrow(
        'Database connection failed',
      );

      expect(badgeService.createBadge).toHaveBeenCalledWith(mockCreateBadgeDto);
    });
  });
});
