import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ImageType } from '@prisma/client';

export class CreateCoverDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsEnum(ImageType)
  type?: ImageType;
}
