import { Test, TestingModule } from '@nestjs/testing';
import { CountryService } from './country.service';
import { CountryRepo } from './country.repository';

describe('CountryService', () => {
  let service: CountryService;

  beforeEach(async () => {
    const mockCountryRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        {
          provide: CountryRepo,
          useValue: mockCountryRepo,
        },
      ],
    }).compile();

    service = module.get<CountryService>(CountryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
