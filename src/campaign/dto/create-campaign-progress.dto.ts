import { IsArray, IsNotEmpty, IsString } from 'class-validator';

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
  documents: string[];
}
