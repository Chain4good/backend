import { ReportType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @IsNumber()
  @IsNotEmpty()
  campaignId: number;
}
