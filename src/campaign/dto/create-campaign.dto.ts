// src/campaign/dto/create-campaign.dto.ts
import { CampaignStatus } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  goal: number;

  @IsDateString()
  @IsNotEmpty()
  deadline: string;

  @IsNumber()
  @IsOptional()
  totalDonated: number;

  @IsBoolean()
  @IsOptional()
  isClosed: boolean;

  @IsBoolean()
  @IsOptional()
  isNoLimit: boolean;

  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsInt()
  @IsNotEmpty()
  countryId: number;

  @IsArray()
  @IsNotEmpty()
  images: string[];

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsInt()
  @IsNotEmpty()
  fundraiseTypeId: number;

  @IsInt()
  @IsNotEmpty()
  coverId: number;

  @IsInt()
  @IsOptional()
  chainCampaignId: number;

  @IsString()
  @IsOptional()
  txHash: string;

  @IsString()
  @IsOptional()
  creatorAddress: string;

  @IsString()
  @IsOptional()
  tokenAddress: string;

  @IsString()
  @IsOptional()
  tokenGoal: string;

  @IsString()
  @IsOptional()
  tokenSymbol: string;

  @IsInt()
  @IsOptional()
  tokenDecimals: number;
}
