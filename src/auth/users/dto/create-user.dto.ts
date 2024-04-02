import { IsEmail, IsNotEmpty,IsString, IsOptional } from 'class-validator';
import { TransformLowerCase } from 'src/common';



export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @TransformLowerCase()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}