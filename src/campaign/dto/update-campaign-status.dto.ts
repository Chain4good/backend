import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CampaignStatus } from '@prisma/client';

export class UpdateCampaignStatusDto {
  @IsEnum(CampaignStatus)
  status: CampaignStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RejectCampaignDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
