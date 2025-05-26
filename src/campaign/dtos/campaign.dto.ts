import { IsDate, IsDecimal, IsNumber, IsString } from 'class-validator';

export class CampaignDTO {
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsDecimal()
  goal: number;
  @IsString()
  image: string;
  @IsDate()
  deadline: Date;
  @IsString()
  coverId: string;
  @IsNumber()
  totalDonated: number;
}
