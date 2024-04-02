import { IsEmail, IsNotEmpty,IsString, IsOptional } from 'class-validator';
import { TransformLowerCase } from 'src/common';



export class OtpDto {
  @IsEmail()
  @IsNotEmpty()
  @TransformLowerCase()
  email: string;

  @IsString()
  @IsOptional()
  otp?: string;
}