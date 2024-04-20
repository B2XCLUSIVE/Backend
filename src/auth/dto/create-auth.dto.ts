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
  field1: string;

  @IsString()
  @IsOptional()
  field2: string;

  @IsString()
  @IsOptional()
  field3: string;

  @IsString()
  @IsOptional()
  friends: string;
}
