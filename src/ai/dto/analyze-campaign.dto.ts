import { IsString } from 'class-validator';

export class AnalyzeCampaignDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}
