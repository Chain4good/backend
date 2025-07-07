import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { KycDocument, KycStatus } from '@prisma/client';

@Injectable()
export class KycRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: number;
    documentType: string;
    documentUrl: string;
    facialImageUrl: string;
    issueDate?: Date;
    expiryDate?: Date;
  }): Promise<KycDocument> {
    return this.prisma.kycDocument.create({
      data: {
        userId: data.userId,
        documentType: data.documentType,
        documentUrl: data.documentUrl,
        facialImageUrl: data.facialImageUrl,
        issueDate: data.issueDate,
        expiryDate: data.expiryDate,
        status: KycStatus.PENDING,
      },
    });
  }

  async findByUserId(userId: number): Promise<KycDocument | null> {
    return this.prisma.kycDocument.findUnique({
      where: { userId },
    });
  }

  async updateStatus(
    id: number,
    status: KycStatus,
    rejectionReason?: string,
  ): Promise<KycDocument> {
    return this.prisma.kycDocument.update({
      where: { id },
      data: {
        status,
        rejectionReason,
        reviewedAt: new Date(),
      },
    });
  }

  async findAllPending(): Promise<KycDocument[]> {
    return this.prisma.kycDocument.findMany({
      where: { status: KycStatus.PENDING },
      include: { user: true },
    });
  }

  async findById(id: number): Promise<KycDocument | null> {
    return this.prisma.kycDocument.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async update(id: number, data: {
    documentType?: string;
    documentUrl?: string;
    facialImageUrl?: string;
    issueDate?: Date;
    expiryDate?: Date;
    status?: KycStatus;
    rejectionReason?: string;
  }): Promise<KycDocument> {
    return this.prisma.kycDocument.update({
      where: { id },
      data: {
        ...data,
        status: KycStatus.PENDING, // Reset status to PENDING on update
        rejectionReason: null, // Clear rejection reason on update
        reviewedAt: null,
      },
    });
  }
}
