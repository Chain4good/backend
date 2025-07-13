import { CampaignStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class FindAllCampaignDto {
  @IsOptional()
  @IsString()
  userId?: number;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  fundraiseTypeId?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  countryId?: number;
}

export class FindAllCampaignValidDto {
  @IsOptional()
  @IsString()
  userId?: number;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  fundraiseTypeId?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  countryId?: number;
}

export class FindMyCampaignDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}

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

export class GetCampaignDonationHistoryDto {
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsEnum(['day', 'week', 'month'])
  groupBy?: 'day' | 'week' | 'month' = 'day';
}

export class RequestVerificationDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AddEvidenceDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  documents: string[];
}
