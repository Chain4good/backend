import { Test, TestingModule } from '@nestjs/testing';
import { DonationService } from './donation.service';
import { DonationRepo } from './donation.repository';
import { CreateDonationUseCase } from './use-cases/create-donation.use-case';
import { CampaignService } from '../campaign/campaign.service';
import { UsersService } from '../users/users.service';
import { BadgeService } from '../badge/badge.service';

describe('DonationService', () => {
  let service: DonationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationService,
        {
          provide: DonationRepo,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findAllByUserId: jest.fn(),
          },
        },
        {
          provide: CreateDonationUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: CampaignService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: BadgeService,
          useValue: {
            checkDonationBadges: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DonationService>(DonationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
