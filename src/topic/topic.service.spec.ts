import { Test, TestingModule } from '@nestjs/testing';
import { TopicService } from './topic.service';
import { TopicRepository } from './topic.repository';

describe('TopicService', () => {
  let service: TopicService;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findManyByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicService,
        {
          provide: TopicRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<TopicService>(TopicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
