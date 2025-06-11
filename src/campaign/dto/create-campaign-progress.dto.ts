import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateCampaignProgressDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsNotEmpty()
  images: string[];

  @IsArray()
  @IsOptional()
  documents?: string[];
}
