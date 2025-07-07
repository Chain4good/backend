/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { KycRepository } from './kyc.repository';
import { UploadKycDocumentDto, KycStatus } from './dto/kyc.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/types/notification.types';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class KycService {
  constructor(
    private readonly kycRepository: KycRepository,
    private readonly notificationService: NotificationService,
    private readonly usersService: UsersService,
  ) {}

  async uploadKycDocument(userId: number, dto: UploadKycDocumentDto) {
    try {
      const existingKyc = await this.kycRepository.findByUserId(userId);

      if (existingKyc) {
        // If KYC exists and is rejected, allow re-submission
        if ((existingKyc as any).status === KycStatus.REJECTED) {
          return await this.kycRepository.update((existingKyc as any).id, {
            documentType: dto.documentType,
            documentUrl: dto.documentUrl,
            facialImageUrl: dto.facialImageUrl,
            issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
            expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
          });
        } else if ((existingKyc as any).status === KycStatus.PENDING) {
          throw new BadRequestException('KYC document already pending review.');
        } else if ((existingKyc as any).status === KycStatus.APPROVED) {
          throw new BadRequestException('KYC document already approved.');
        }
      }

      const kycDocument = await this.kycRepository.create({
        userId,
        documentType: dto.documentType,
        documentUrl: dto.documentUrl,
        facialImageUrl: dto.facialImageUrl,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      });

      // Notify admin about new KYC submission
      // In a real application, you might have a dedicated admin notification system
      await this.notificationService.createAndSendNotification({
        userId: 1, // Assuming admin user ID is 1 for now
        type: NotificationType.KYC_SUBMISSION,
        content: `New KYC document submitted by user ${userId}`,
        metadata: { kycDocumentId: (kycDocument as any).id, userId },
      });

      return kycDocument;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to upload KYC document');
    }
  }

  async getKycStatus(userId: number) {
    const kycDocument = await this.kycRepository.findByUserId(userId);
    return kycDocument ? (kycDocument as any).status : null;
  }

  async getKycDocument(userId: number) {
    const kycDocument = await this.kycRepository.findByUserId(userId);
    if (!kycDocument) {
      throw new NotFoundException('KYC document not found for this user.');
    }
    return kycDocument;
  }

  // Admin functions
  async getAllPendingKycDocuments() {
    return this.kycRepository.findAllPending();
  }

  async approveKycDocument(kycDocumentId: number) {
    const kycDocument = await this.kycRepository.findById(kycDocumentId);
    if (!kycDocument) {
      throw new NotFoundException('KYC document not found.');
    }
    if ((kycDocument as any).status === KycStatus.APPROVED) {
      throw new BadRequestException('KYC document already approved.');
    }

    const updatedKyc = await this.kycRepository.updateStatus(
      kycDocumentId,
      KycStatus.APPROVED,
    );

    // Update user's kycStatus
    await this.usersService.updateKycStatus(
      (kycDocument as any).userId,
      KycStatus.APPROVED,
    );

    await this.notificationService.createAndSendNotification({
      userId: (kycDocument as any).userId,
      type: NotificationType.KYC_STATUS_UPDATE,
      content: 'Your KYC document has been approved!',
      metadata: {
        kycDocumentId: (updatedKyc as any).id,
        status: (updatedKyc as any).status,
      },
    });

    return updatedKyc;
  }

  async rejectKycDocument(kycDocumentId: number, rejectionReason: string) {
    const kycDocument = await this.kycRepository.findById(kycDocumentId);
    if (!kycDocument) {
      throw new NotFoundException('KYC document not found.');
    }
    if ((kycDocument as any).status === KycStatus.REJECTED) {
      throw new BadRequestException('KYC document already rejected.');
    }

    const updatedKyc = await this.kycRepository.updateStatus(
      kycDocumentId,
      KycStatus.REJECTED,
      rejectionReason,
    );

    // Update user's kycStatus
    await this.usersService.updateKycStatus(
      (kycDocument as any).userId,
      KycStatus.REJECTED,
    );

    await this.notificationService.createAndSendNotification({
      userId: (kycDocument as any).userId,
      type: NotificationType.KYC_STATUS_UPDATE,
      content: `Your KYC document has been rejected. Reason: ${rejectionReason}`,
      metadata: {
        kycDocumentId: (updatedKyc as any).id,
        status: (updatedKyc as any).status,
        rejectionReason: rejectionReason,
      },
    });

    return updatedKyc;
  }
}
