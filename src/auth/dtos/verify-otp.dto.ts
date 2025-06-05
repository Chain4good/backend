import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class VerifyOTPDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
