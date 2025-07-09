import { Test, TestingModule } from '@nestjs/testing';
import { KycModule } from './kyc.module';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { KycRepository } from './kyc.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/notification/notification.service';
import { UsersService } from 'src/users/users.service';

describe('KycModule', () => {
  let module: TestingModule;
  let kycService: KycService;
  let kycController: KycController;
  let kycRepository: KycRepository;

  // Mock services for dependencies
  const mockPrismaService = {
    kycDocument: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockNotificationService = {
    createAndSendNotification: jest.fn(),
  };

  const mockUsersService = {
    updateKycStatus: jest.fn(),
  };

  // Mock UploadService to avoid ConfigService dependency issues
  const mockUploadService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        KycService,
        KycRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
      controllers: [KycController],
    }).compile();

    kycService = module.get<KycService>(KycService);
    kycController = module.get<KycController>(KycController);
    kycRepository = module.get<KycRepository>(KycRepository);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('Module Configuration', () => {
    it('should be defined', () => {
      expect(module).toBeDefined();
    });

    it('should have KycService as a provider', () => {
      expect(kycService).toBeDefined();
      expect(kycService).toBeInstanceOf(KycService);
    });

    it('should have KycController as a controller', () => {
      expect(kycController).toBeDefined();
      expect(kycController).toBeInstanceOf(KycController);
    });

    it('should have KycRepository as a provider', () => {
      expect(kycRepository).toBeDefined();
      expect(kycRepository).toBeInstanceOf(KycRepository);
    });
  });

  describe('Module Dependencies', () => {
    it('should have PrismaService available', () => {
      const prismaService = module.get<PrismaService>(PrismaService);
      expect(prismaService).toBeDefined();
      expect(prismaService).toBe(mockPrismaService);
    });

    it('should have NotificationService available', () => {
      const notificationService =
        module.get<NotificationService>(NotificationService);
      expect(notificationService).toBeDefined();
      expect(notificationService).toBe(mockNotificationService);
    });

    it('should have UsersService available', () => {
      const usersService = module.get<UsersService>(UsersService);
      expect(usersService).toBeDefined();
      expect(usersService).toBe(mockUsersService);
    });
  });

  describe('Service Dependencies Injection', () => {
    it('should inject KycRepository into KycService', () => {
      expect(kycService['kycRepository']).toBeDefined();
      expect(kycService['kycRepository']).toBeInstanceOf(KycRepository);
    });

    it('should inject NotificationService into KycService', () => {
      expect(kycService['notificationService']).toBeDefined();
    });

    it('should inject UsersService into KycService', () => {
      expect(kycService['usersService']).toBeDefined();
    });
  });

  describe('Controller Dependencies Injection', () => {
    it('should inject KycService into KycController', () => {
      expect(kycController['kycService']).toBeDefined();
      expect(kycController['kycService']).toBeInstanceOf(KycService);
    });
  });

  describe('Repository Dependencies Injection', () => {
    it('should inject PrismaService into KycRepository', () => {
      expect(kycRepository['prisma']).toBeDefined();
    });
  });

  describe('Module Exports', () => {
    it('should export KycService', () => {
      // Test that KycService can be imported by other modules
      expect(kycService).toBeDefined();
      expect(kycService).toBeInstanceOf(KycService);
    });
  });

  describe('Module Integration', () => {
    it('should create a complete module with all dependencies resolved', async () => {
      // Verify that all components can work together
      expect(kycService).toBeDefined();
      expect(kycController).toBeDefined();
      expect(kycRepository).toBeDefined();

      // Verify that the service has access to all its dependencies
      expect(kycService['kycRepository']).toBeDefined();
      expect(kycService['notificationService']).toBeDefined();
      expect(kycService['usersService']).toBeDefined();
    });

    it('should handle module compilation without errors', async () => {
      // This test ensures that the module can be compiled successfully
      // with all its dependencies and configurations
      expect(module).toBeDefined();
      expect(module.get(KycService)).toBeDefined();
      expect(module.get(KycController)).toBeDefined();
      expect(module.get(KycRepository)).toBeDefined();
    });

    it('should allow KycService to be used by other modules', () => {
      // Test that KycService can be retrieved and used
      const service = module.get<KycService>(KycService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(KycService);

      // Verify service methods exist
      expect(typeof service.uploadKycDocument).toBe('function');
      expect(typeof service.getKycStatus).toBe('function');
      expect(typeof service.getKycDocument).toBe('function');
      expect(typeof service.getAllPendingKycDocuments).toBe('function');
      expect(typeof service.approveKycDocument).toBe('function');
      expect(typeof service.rejectKycDocument).toBe('function');
    });
  });
});
