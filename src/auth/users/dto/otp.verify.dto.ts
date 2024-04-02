import { IsEmail, IsNotEmpty,IsString, IsOptional } from 'class-validator';
import { TransformLowerCase } from 'src/common';


export class OtpVerifyDto {
  @IsEmail()
  @IsNotEmpty()
  @TransformLowerCase()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}