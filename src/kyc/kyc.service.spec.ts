
import { Test, TestingModule } from '@nestjs/testing';
import { KycService } from './kyc.service';
import { KycRepository } from './kyc.repository';
import { NotificationService } from '../notification/notification.service';
import { UsersService } from '../users/users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { KycStatus, UploadKycDocumentDto } from './dto/kyc.dto';
import { NotificationType } from '../notification/types/notification.types';
import { KycDocumentType } from './enum/kyc-document-type.enum';

describe('KycService', () => {
  let service: KycService;
  let kycRepository: KycRepository;
  let notificationService: NotificationService;
  let usersService: UsersService;

  // Helper function to create a full KycDocument mock
  const createMockKycDocument = (overrides?: any) => ({
    id: 1,
    userId: 1,
    documentType: KycDocumentType.PASSPORT,
    documentUrl: 'http://example.com/passport.jpg',
    facialImageUrl: 'http://example.com/face.jpg',
    status: KycStatus.PENDING,
    rejectionReason: null,
    uploadedAt: new Date(),
    reviewedAt: null,
    issueDate: new Date('2020-01-01'),
    expiryDate: new Date('2030-01-01'),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KycService,
        {
          provide: KycRepository,
          useValue: {
            findByUserId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
            updateStatus: jest.fn(),
            findAllPending: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            createAndSendNotification: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            updateKycStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<KycService>(KycService);
    kycRepository = module.get<KycRepository>(KycRepository);
    notificationService = module.get<NotificationService>(NotificationService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadKycDocument', () => {
    const userId = 1;
    const dto: UploadKycDocumentDto = {
      documentType: KycDocumentType.PASSPORT,
      documentUrl: 'http://example.com/passport.jpg',
      facialImageUrl: 'http://example.com/face.jpg',
      issueDate: '2020-01-01',
      expiryDate: '2030-01-01',
    };

    it('should upload a new KYC document successfully', async () => {
      jest.spyOn(kycRepository, 'findByUserId').mockResolvedValue(null);
      const mockKycDocument = createMockKycDocument({ userId, ...dto, status: KycStatus.PENDING });
      jest.spyOn(kycRepository, 'create').mockResolvedValue(mockKycDocument);
      jest.spyOn(notificationService, 'createAndSendNotification').mockResolvedValue(null as any);

      const result = await service.uploadKycDocument(userId, dto);

      expect(kycRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(kycRepository.create).toHaveBeenCalledWith({
        userId,
        documentType: dto.documentType,
        documentUrl: dto.documentUrl,
        facialImageUrl: dto.facialImageUrl,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      });
      expect(notificationService.createAndSendNotification).toHaveBeenCalledWith({
        userId: 1,
        type: NotificationType.KYC_SUBMISSION,
        content: `New KYC document submitted by user ${userId}`,
        metadata: { kycDocumentId: mockKycDocument.id, userId },
      });
      expect(result).toEqual(mockKycDocument);
    });

    it('should allow re-submission if existing KYC is rejected', async () => {
      const existingKyc = createMockKycDocument({ userId, status: KycStatus.REJECTED });
      jest.spyOn(kycRepository, 'findByUserId').mockResolvedValue(existingKyc);
      const updatedKyc = createMockKycDocument({ ...existingKyc, ...dto, status: KycStatus.PENDING });
      jest.spyOn(kycRepository, 'update').mockResolvedValue(updatedKyc);

      const result = await service.uploadKycDocument(userId, dto);

      expect(kycRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(kycRepository.update).toHaveBeenCalledWith(existingKyc.id, {
        documentType: dto.documentType,
        documentUrl: dto.documentUrl,
        facialImageUrl: dto.facialImageUrl,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      });
      expect(result).toEqual(updatedKyc);
    });

    it('should throw BadRequestException if KYC document is already pending', async () => {
      const existingKyc = createMockKycDocument({ userId, status: KycStatus.PENDING });
      jest.spyOn(kycRepository, 'findByUserId').mockResolvedValue(existingKyc);

      await expect(service.uploadKycDocument(userId, dto)).rejects.toThrow(
        new BadRequestException('KYC document already pending review.'),
      );
    });

    it('should throw BadRequestException if KYC document is already approved', async () => {
      const existingKyc = createMockKycDocument({ userId, status: KycStatus.APPROVED });
      jest.spyOn(kycRepository, 'findByUserId').mockResolvedValue(existingKyc);

      await expect(service.uploadKycDocument(userId, dto)).rejects.toThrow(
        new BadRequestException('KYC document already approved.'),
      );
    });

    it('should throw BadRequestException for generic errors during upload', async () => {
      jest.spyOn(kycRepository, 'findByUserId').mockRejectedValue(new Error('Database error'));

      await expect(service.uploadKycDocument(userId, dto)).rejects.toThrow(
        new BadRequestException('Failed to upload KYC document'),
      );
    });
  });

  describe('getKycStatus', () => {
    const userId = 1;

    it('should return the KYC status if document exists', async () => {
      const kycDocument = createMockKycDocument({ status: KycStatus.APPROVED });
      jest.spyOn(kycRepository, 'findByUserId').mockResolvedValue(kycDocument);

      const result = await service.getKycStatus(userId);
      expect(result).toBe(KycStatus.APPROVED);
      expect(kycRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return null if KYC document does not exist', async () => {
      jest.spyOn(kycRepository, 'findByUserId').mockResolvedValue(null);

      const result = await service.getKycStatus(userId);
      expect(result).toBeNull();
      expect(kycRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('getKycDocument', () => {
    const userId = 1;

    it('should return the KYC document if it exists', async () => {
      const kycDocument = createMockKycDocument({ userId, status: KycStatus.APPROVED });
      jest.spyOn(kycRepository, 'findByUserId').mockResolvedValue(kycDocument);

      const result = await service.getKycDocument(userId);
      expect(result).toEqual(kycDocument);
      expect(kycRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if KYC document does not exist', async () => {
      jest.spyOn(kycRepository, 'findByUserId').mockResolvedValue(null);

      await expect(service.getKycDocument(userId)).rejects.toThrow(
        new NotFoundException('KYC document not found for this user.'),
      );
    });
  });

  describe('approveKycDocument', () => {
    const kycDocumentId = 1;
    const userId = 1;
    const kycDocument = createMockKycDocument({ id: kycDocumentId, userId, status: KycStatus.PENDING });

    it('should approve a KYC document successfully', async () => {
      jest.spyOn(kycRepository, 'findById').mockResolvedValue(kycDocument);
      const updatedKyc = createMockKycDocument({ ...kycDocument, status: KycStatus.APPROVED });
      jest.spyOn(kycRepository, 'updateStatus').mockResolvedValue(updatedKyc);
      jest.spyOn(usersService, 'updateKycStatus').mockResolvedValue(null as any);
      jest.spyOn(notificationService, 'createAndSendNotification').mockResolvedValue(null as any);

      const result = await service.approveKycDocument(kycDocumentId);

      expect(kycRepository.findById).toHaveBeenCalledWith(kycDocumentId);
      expect(kycRepository.updateStatus).toHaveBeenCalledWith(kycDocumentId, KycStatus.APPROVED);
      expect(usersService.updateKycStatus).toHaveBeenCalledWith(userId, KycStatus.APPROVED);
      expect(notificationService.createAndSendNotification).toHaveBeenCalledWith({
        userId,
        type: NotificationType.KYC_STATUS_UPDATE,
        content: 'Your KYC document has been approved!',
        metadata: { kycDocumentId, status: KycStatus.APPROVED },
      });
      expect(result).toEqual(updatedKyc);
    });

    it('should throw NotFoundException if KYC document not found', async () => {
      jest.spyOn(kycRepository, 'findById').mockResolvedValue(null);

      await expect(service.approveKycDocument(kycDocumentId)).rejects.toThrow(
        new NotFoundException('KYC document not found.'),
      );
    });

    it('should throw BadRequestException if KYC document is already approved', async () => {
      const approvedKyc = createMockKycDocument({ ...kycDocument, status: KycStatus.APPROVED });
      jest.spyOn(kycRepository, 'findById').mockResolvedValue(approvedKyc);

      await expect(service.approveKycDocument(kycDocumentId)).rejects.toThrow(
        new BadRequestException('KYC document already approved.'),
      );
    });
  });

  describe('rejectKycDocument', () => {
    const kycDocumentId = 1;
    const userId = 1;
    const rejectionReason = 'Incomplete documents';
    const kycDocument = createMockKycDocument({ id: kycDocumentId, userId, status: KycStatus.PENDING });

    it('should reject a KYC document successfully', async () => {
      jest.spyOn(kycRepository, 'findById').mockResolvedValue(kycDocument);
      const updatedKyc = createMockKycDocument({ ...kycDocument, status: KycStatus.REJECTED, rejectionReason });
      jest.spyOn(kycRepository, 'updateStatus').mockResolvedValue(updatedKyc);
      jest.spyOn(usersService, 'updateKycStatus').mockResolvedValue(null as any);
      jest.spyOn(notificationService, 'createAndSendNotification').mockResolvedValue(null as any);

      const result = await service.rejectKycDocument(kycDocumentId, rejectionReason);

      expect(kycRepository.findById).toHaveBeenCalledWith(kycDocumentId);
      expect(kycRepository.updateStatus).toHaveBeenCalledWith(kycDocumentId, KycStatus.REJECTED, rejectionReason);
      expect(usersService.updateKycStatus).toHaveBeenCalledWith(userId, KycStatus.REJECTED);
      expect(notificationService.createAndSendNotification).toHaveBeenCalledWith({
        userId,
        type: NotificationType.KYC_STATUS_UPDATE,
        content: `Your KYC document has been rejected. Reason: ${rejectionReason}`,
        metadata: { kycDocumentId, status: KycStatus.REJECTED, rejectionReason },
      });
      expect(result).toEqual(updatedKyc);
    });

    it('should throw NotFoundException if KYC document not found', async () => {
      jest.spyOn(kycRepository, 'findById').mockResolvedValue(null);

      await expect(service.rejectKycDocument(kycDocumentId, rejectionReason)).rejects.toThrow(
        new NotFoundException('KYC document not found.'),
      );
    });

    it('should throw BadRequestException if KYC document is already rejected', async () => {
      const rejectedKyc = createMockKycDocument({ ...kycDocument, status: KycStatus.REJECTED });
      jest.spyOn(kycRepository, 'findById').mockResolvedValue(rejectedKyc);

      await expect(service.rejectKycDocument(kycDocumentId, rejectionReason)).rejects.toThrow(
        new BadRequestException('KYC document already rejected.'),
      );
    });
  });
});
