import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFundraiseTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  description: string;
}
