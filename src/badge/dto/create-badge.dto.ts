import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BadgeType } from '../enum/badge-type.enum';

export class CreateBadgeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsEnum(BadgeType)
  type: BadgeType;
}
