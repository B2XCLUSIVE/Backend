import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TransformLowerCase } from 'src/common';


export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  @TransformLowerCase()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}