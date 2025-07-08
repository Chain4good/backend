import { Test, TestingModule } from '@nestjs/testing';
import { CoverService } from './cover.service';
import { CoverRepo } from './cover.repository';

describe('CoverService', () => {
  let service: CoverService;

  beforeEach(async () => {
    const mockCoverRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoverService,
        {
          provide: CoverRepo,
          useValue: mockCoverRepo,
        },
      ],
    }).compile();

    service = module.get<CoverService>(CoverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
