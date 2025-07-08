import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service';
import { createReadStream } from 'fs';

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

// Mock fs
jest.mock('fs', () => ({
  createReadStream: jest.fn(),
}));

describe('UploadService', () => {
  let service: UploadService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should configure cloudinary with valid config', () => {
      configService.get.mockImplementation((key: string) => {
        const config = {
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };
        return config[key];
      });

      expect(() => service.onModuleInit()).not.toThrow();
    });

    it('should throw error when cloudinary config is missing', () => {
      configService.get.mockReturnValue(undefined);

      expect(() => service.onModuleInit()).toThrow(
        'Missing required Cloudinary configuration',
      );
    });
  });
});
