import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignStatus } from '@prisma/client';

describe('DashboardService', () => {
  let service: DashboardService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            campaign: {
              count: jest.fn(),
              groupBy: jest.fn(),
              findMany: jest.fn(),
            },
            donation: {
              count: jest.fn(),
              aggregate: jest.fn(),
              findMany: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = {
        totalUsers: 100,
        totalCampaigns: 50,
        totalDonations: 200,
        totalAmount: 1000000,
        activeCampaigns: 25,
      };

      (prismaService.user.count as jest.Mock).mockResolvedValue(
        mockStats.totalUsers,
      );
      (prismaService.campaign.count as jest.Mock).mockResolvedValueOnce(
        mockStats.totalCampaigns,
      );
      (prismaService.donation.count as jest.Mock).mockResolvedValue(
        mockStats.totalDonations,
      );
      (prismaService.donation.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: mockStats.totalAmount },
      });
      (prismaService.campaign.count as jest.Mock).mockResolvedValueOnce(
        mockStats.activeCampaigns,
      );

      const result = await service.getStats();

      expect(result).toEqual({
        totalUsers: mockStats.totalUsers,
        totalCampaigns: mockStats.totalCampaigns,
        totalDonations: mockStats.totalDonations,
        totalAmount: mockStats.totalAmount,
        activeCampaigns: mockStats.activeCampaigns,
      });
    });
  });
});
