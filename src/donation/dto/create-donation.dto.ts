import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDonationDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsInt()
  @IsNotEmpty()
  campaignId: number;

  @IsInt()
  @IsOptional()
  onChainDonatedId?: number;

  @IsString()
  @IsOptional()
  txHash?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
