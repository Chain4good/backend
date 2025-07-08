import { Test, TestingModule } from '@nestjs/testing';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { UploadKycDocumentDto, KycStatus } from './dto/kyc.dto';
import { UserExtract } from 'src/auth/decorators/auth.decorators';
import { Role } from '@prisma/client';
import { BadRequestException, INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { KycDocumentType } from './enum/kyc-document-type.enum';

describe('KycController', () => {
  let controller: KycController;
  let service: KycService;
  let app: INestApplication;

  const mockKycService = {
    uploadKycDocument: jest.fn(),
    getKycStatus: jest.fn(),
    getKycDocument: jest.fn(),
    getAllPendingKycDocuments: jest.fn(),
    approveKycDocument: jest.fn(),
    rejectKycDocument: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KycController],
      providers: [
        {
          provide: KycService,
          useValue: mockKycService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { id: 1, email: 'test@example.com', role: { id: 1, name: 'USER', description: null } }; // Mock user
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { id: 1, email: 'test@example.com', role: { id: 1, name: 'ADMIN', description: null } }; // Mock admin for roles guard
          return true;
        },
      })
      .compile();

    controller = module.get<KycController>(KycController);
    service = module.get<KycService>(KycService);

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /kyc/upload', () => {
    const user: UserExtract = { id: 1, email: 'test@example.com', role: { id: 1, name: 'USER', description: null } };
    const dto: UploadKycDocumentDto = {
      documentType: KycDocumentType.PASSPORT,
      documentUrl: 'http://example.com/passport.jpg',
      facialImageUrl: 'http://example.com/face.jpg',
    };

    it('should upload a KYC document', async () => {
      mockKycService.uploadKycDocument.mockResolvedValue({ id: 1, userId: user.id, ...dto });

      const response = await request(app.getHttpServer())
        .post('/kyc/upload')
        .set('Authorization', 'Bearer token') // Mock JWT token
        .send(dto);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 1, userId: user.id, ...dto });
      expect(mockKycService.uploadKycDocument).toHaveBeenCalledWith(user.id, dto);
    });
  });

  describe('GET /kyc/status', () => {
    const user: UserExtract = { id: 1, email: 'test@example.com', role: { id: 1, name: 'USER', description: null } };

    it('should return KYC status', async () => {
      mockKycService.getKycStatus.mockResolvedValue(KycStatus.PENDING);

      const response = await request(app.getHttpServer())
        .get('/kyc/status')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.text).toBe(KycStatus.PENDING);
      expect(mockKycService.getKycStatus).toHaveBeenCalledWith(user.id);
    });
  });

  describe('GET /kyc/document', () => {
    const user: UserExtract = { id: 1, email: 'test@example.com', role: { id: 1, name: 'USER', description: null } };

    it('should return KYC document', async () => {
      const mockDocument = { id: 1, userId: user.id, status: KycStatus.APPROVED };
      mockKycService.getKycDocument.mockResolvedValue(mockDocument);

      const response = await request(app.getHttpServer())
        .get('/kyc/document')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDocument);
      expect(mockKycService.getKycDocument).toHaveBeenCalledWith(user.id);
    });
  });

  describe('GET /kyc/admin/pending', () => {
    it('should return pending KYC documents for admin', async () => {
      const mockPendingDocs = [{ id: 1, status: KycStatus.PENDING }];
      mockKycService.getAllPendingKycDocuments.mockResolvedValue(mockPendingDocs);

      const response = await request(app.getHttpServer())
        .get('/kyc/admin/pending')
        .set('Authorization', 'Bearer admin_token'); // Mock admin JWT token

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPendingDocs);
      expect(mockKycService.getAllPendingKycDocuments).toHaveBeenCalled();
    });
  });

  describe('PATCH /kyc/admin/:id/status', () => {
    const kycId = 1;

    it('should approve a KYC document as admin', async () => {
      mockKycService.approveKycDocument.mockResolvedValue({ id: kycId, status: KycStatus.APPROVED });

      const response = await request(app.getHttpServer())
        .patch(`/kyc/admin/${kycId}/status`)
        .set('Authorization', 'Bearer admin_token')
        .send({ status: KycStatus.APPROVED });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: kycId, status: KycStatus.APPROVED });
      expect(mockKycService.approveKycDocument).toHaveBeenCalledWith(kycId);
    });

    it('should reject a KYC document as admin with reason', async () => {
      const rejectionReason = 'Incomplete documents';
      mockKycService.rejectKycDocument.mockResolvedValue({ id: kycId, status: KycStatus.REJECTED, rejectionReason });

      const response = await request(app.getHttpServer())
        .patch(`/kyc/admin/${kycId}/status`)
        .set('Authorization', 'Bearer admin_token')
        .send({ status: KycStatus.REJECTED, rejectionReason });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: kycId, status: KycStatus.REJECTED, rejectionReason });
      expect(mockKycService.rejectKycDocument).toHaveBeenCalledWith(kycId, rejectionReason);
    });

    it('should throw BadRequestException if rejection reason is missing for rejected status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/kyc/admin/${kycId}/status`)
        .set('Authorization', 'Bearer admin_token')
        .send({ status: KycStatus.REJECTED });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Rejection reason is required.');
    });
  });
});
