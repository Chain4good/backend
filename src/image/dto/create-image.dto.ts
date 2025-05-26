import { ImageType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateImageDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl({}, { message: 'URL must be a valid URL' })
  url: string;

  @IsOptional()
  @IsInt({ message: 'Campaign ID must be an integer' })
  campaignId?: number;

  @IsOptional()
  @IsEnum(ImageType, { message: 'Type must be either IMAGE or VIDEO' })
  type?: ImageType;
}
