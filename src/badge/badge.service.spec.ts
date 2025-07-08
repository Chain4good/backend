import { Test, TestingModule } from '@nestjs/testing';
import { BadgeService } from './badge.service';
import { BadgeRepository } from './badge.repository';
import { UserBadgeRepository } from './user-badge.repository';
import { BadgeRulesService } from './badge-rules.service';

describe('BadgeService', () => {
  let service: BadgeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgeService,
        {
          provide: BadgeRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UserBadgeRepository,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: BadgeRulesService,
          useValue: {
            evaluateAllConditions: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BadgeService>(BadgeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
