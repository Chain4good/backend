import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { KycDocumentType } from '../enum/kyc-document-type.enum';
export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UploadKycDocumentDto {
  @IsNotEmpty()
  @IsEnum(KycDocumentType)
  documentType: KycDocumentType;

  @IsNotEmpty()
  @IsUrl()
  documentUrl: string;

  @IsNotEmpty()
  @IsUrl()
  facialImageUrl: string;

  @IsOptional()
  @IsString()
  issueDate?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;
}

export class UpdateKycStatusDto {
  @IsNotEmpty()
  @IsEnum(KycStatus)
  status: KycStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
