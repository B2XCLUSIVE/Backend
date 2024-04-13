import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  subtitle: string;

  @IsOptional()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
