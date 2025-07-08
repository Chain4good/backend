import { Test, TestingModule } from '@nestjs/testing';
import { KycRepository } from './kyc.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { KycStatus } from '@prisma/client';
import { KycDocumentType } from './enum/kyc-document-type.enum';

describe('KycRepository', () => {
  let repository: KycRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KycRepository,
        {
          provide: PrismaService,
          useValue: {
            kycDocument: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<KycRepository>(KycRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new KYC document', async () => {
      const data = {
        userId: 1,
        documentType: KycDocumentType.PASSPORT,
        documentUrl: 'url1',
        facialImageUrl: 'url2',
        issueDate: new Date(),
        expiryDate: new Date(),
      };
      const expectedResult = { id: 1, ...data, status: KycStatus.PENDING, uploadedAt: new Date(), reviewedAt: null, rejectionReason: null };
      (prisma.kycDocument.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.create(data);
      expect(prisma.kycDocument.create).toHaveBeenCalledWith({
        data: { ...data, status: KycStatus.PENDING },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByUserId', () => {
    it('should find a KYC document by user ID', async () => {
      const userId = 1;
      const expectedResult = { id: 1, userId, status: KycStatus.APPROVED };
      (prisma.kycDocument.findUnique as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.findByUserId(userId);
      expect(prisma.kycDocument.findUnique).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual(expectedResult);
    });

    it('should return null if no KYC document is found by user ID', async () => {
      const userId = 1;
      (prisma.kycDocument.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByUserId(userId);
      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a KYC document', async () => {
      const id = 1;
      const status = KycStatus.APPROVED;
      const expectedResult = { id, status, reviewedAt: new Date() };
      (prisma.kycDocument.update as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.updateStatus(id, status);
      expect(prisma.kycDocument.update).toHaveBeenCalledWith({
        where: { id },
        data: { status, reviewedAt: expect.any(Date), rejectionReason: undefined },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should update the status and rejection reason of a KYC document', async () => {
      const id = 1;
      const status = KycStatus.REJECTED;
      const rejectionReason = 'reason';
      const expectedResult = { id, status, rejectionReason, reviewedAt: new Date() };
      (prisma.kycDocument.update as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.updateStatus(id, status, rejectionReason);
      expect(prisma.kycDocument.update).toHaveBeenCalledWith({
        where: { id },
        data: { status, rejectionReason, reviewedAt: expect.any(Date) },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAllPending', () => {
    it('should find all pending KYC documents', async () => {
      const expectedResult = [{ id: 1, status: KycStatus.PENDING, user: { id: 1 } }];
      (prisma.kycDocument.findMany as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.findAllPending();
      expect(prisma.kycDocument.findMany).toHaveBeenCalledWith({
        where: { status: KycStatus.PENDING },
        include: { user: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('should find a KYC document by ID', async () => {
      const id = 1;
      const expectedResult = { id, status: KycStatus.APPROVED, user: { id: 1 } };
      (prisma.kycDocument.findUnique as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.findById(id);
      expect(prisma.kycDocument.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { user: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return null if no KYC document is found by ID', async () => {
      const id = 1;
      (prisma.kycDocument.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById(id);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a KYC document', async () => {
      const id = 1;
      const data = {
        documentType: KycDocumentType.NATIONAL_ID,
        documentUrl: 'new_url1',
      };
      const expectedResult = { id, ...data, status: KycStatus.PENDING, rejectionReason: null, reviewedAt: null };
      (prisma.kycDocument.update as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.update(id, data);
      expect(prisma.kycDocument.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          ...data,
          status: KycStatus.PENDING,
          rejectionReason: null,
          reviewedAt: null,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
