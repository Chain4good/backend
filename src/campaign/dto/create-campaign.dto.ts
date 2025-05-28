// src/campaign/dto/create-campaign.dto.ts
import { CampaignStatus } from '@prisma/client';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsInt,
  IsBoolean,
  IsArray,
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

  @IsString()
  @IsOptional()
  status: CampaignStatus;

  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsInt()
  @IsNotEmpty()
  countryId: number;

  @IsArray()
  @IsNotEmpty()
  images: string[];

  @IsInt()
  @IsNotEmpty()
  fundraiseTypeId: number;

  @IsInt()
  @IsNotEmpty()
  coverId: number;
}
