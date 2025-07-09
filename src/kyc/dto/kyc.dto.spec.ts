import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UploadKycDocumentDto, UpdateKycStatusDto, KycStatus } from './kyc.dto';
import { KycDocumentType } from '../enum/kyc-document-type.enum';

describe('KYC DTOs', () => {
  describe('UploadKycDocumentDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(UploadKycDocumentDto, {
        documentType: KycDocumentType.PASSPORT,
        documentUrl: 'https://example.com/passport.jpg',
        facialImageUrl: 'https://example.com/face.jpg',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with minimal required data', async () => {
      const dto = plainToClass(UploadKycDocumentDto, {
        documentType: KycDocumentType.NATIONAL_ID,
        documentUrl: 'https://example.com/id.jpg',
        facialImageUrl: 'https://example.com/face.jpg',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when documentType is missing', async () => {
      const dto = plainToClass(UploadKycDocumentDto, {
        documentUrl: 'https://example.com/passport.jpg',
        facialImageUrl: 'https://example.com/face.jpg',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('documentType');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when documentType is invalid', async () => {
      const dto = plainToClass(UploadKycDocumentDto, {
        documentType: 'INVALID_TYPE',
        documentUrl: 'https://example.com/passport.jpg',
        facialImageUrl: 'https://example.com/face.jpg',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('documentType');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail validation when documentUrl is missing', async () => {
      const dto = plainToClass(UploadKycDocumentDto, {
        documentType: KycDocumentType.PASSPORT,
        facialImageUrl: 'https://example.com/face.jpg',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('documentUrl');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when documentUrl is not a valid URL', async () => {
      const dto = plainToClass(UploadKycDocumentDto, {
        documentType: KycDocumentType.PASSPORT,
        documentUrl: 'invalid-url',
        facialImageUrl: 'https://example.com/face.jpg',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('documentUrl');
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should fail validation when facialImageUrl is missing', async () => {
      const dto = plainToClass(UploadKycDocumentDto, {
        documentType: KycDocumentType.PASSPORT,
        documentUrl: 'https://example.com/passport.jpg',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('facialImageUrl');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when facialImageUrl is not a valid URL', async () => {
      const dto = plainToClass(UploadKycDocumentDto, {
        documentType: KycDocumentType.PASSPORT,
        documentUrl: 'https://example.com/passport.jpg',
        facialImageUrl: 'invalid-url',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('facialImageUrl');
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should accept all valid document types', async () => {
      const documentTypes = [
        KycDocumentType.PASSPORT,
        KycDocumentType.NATIONAL_ID,
        KycDocumentType.DRIVER_LICENSE,
      ];

      for (const documentType of documentTypes) {
        const dto = plainToClass(UploadKycDocumentDto, {
          documentType,
          documentUrl: 'https://example.com/document.jpg',
          facialImageUrl: 'https://example.com/face.jpg',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('UpdateKycStatusDto', () => {
    it('should pass validation with valid status', async () => {
      const dto = plainToClass(UpdateKycStatusDto, {
        status: KycStatus.APPROVED,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with status and rejection reason', async () => {
      const dto = plainToClass(UpdateKycStatusDto, {
        status: KycStatus.REJECTED,
        rejectionReason: 'Document is not clear',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when status is missing', async () => {
      const dto = plainToClass(UpdateKycStatusDto, {
        rejectionReason: 'Document is not clear',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when status is invalid', async () => {
      const dto = plainToClass(UpdateKycStatusDto, {
        status: 'INVALID_STATUS',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should accept all valid KYC statuses', async () => {
      const statuses = [
        KycStatus.PENDING,
        KycStatus.APPROVED,
        KycStatus.REJECTED,
      ];

      for (const status of statuses) {
        const dto = plainToClass(UpdateKycStatusDto, {
          status,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('KycStatus Enum', () => {
    it('should have correct enum values', () => {
      expect(KycStatus.PENDING).toBe('PENDING');
      expect(KycStatus.APPROVED).toBe('APPROVED');
      expect(KycStatus.REJECTED).toBe('REJECTED');
    });

    it('should have exactly 3 enum values', () => {
      const values = Object.values(KycStatus);
      expect(values).toHaveLength(3);
      expect(values).toContain('PENDING');
      expect(values).toContain('APPROVED');
      expect(values).toContain('REJECTED');
    });
  });
});
