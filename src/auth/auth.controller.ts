import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { SignInDto } from './dto/signin-auth.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user/signin')
  userLogin(@Body() signInDto: SignInDto) {
    return this.authService.signin(signInDto);
  }

  @Post('admin-account/signup')
  adminLogin(@Body() createAuthDto: CreateAuthDto, role = 'admin') {
    return this.authService.signup(createAuthDto, role);
  }

  @Post('user/signup')
  userSignup(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signup(createAuthDto);
  }
}
