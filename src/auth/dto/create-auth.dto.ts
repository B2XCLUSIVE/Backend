import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TransformLowerCase } from 'src/common';

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty()
  @TransformLowerCase()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsOptional()
  role: string;

  @IsString()
  @IsOptional()
  field: string;

  @IsString()
  @IsOptional()
  friends: string;
}
