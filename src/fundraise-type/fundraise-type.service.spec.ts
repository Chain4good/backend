import { Test, TestingModule } from '@nestjs/testing';
import { FundraiseTypeService } from './fundraise-type.service';
import { FundraiseTypeRepo } from './fundraise-type.repository';

describe('FundraiseTypeService', () => {
  let service: FundraiseTypeService;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundraiseTypeService,
        {
          provide: FundraiseTypeRepo,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<FundraiseTypeService>(FundraiseTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
