import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser, JwtGuard } from 'src/common';
import { OtpDto } from './dto/otp.dto';
import { OtpVerifyDto } from './dto/otp.verify.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('forgot-password')
  forgotPassword(@Body() otpDto: OtpDto) {
    return this.usersService.forgotPassword(otpDto);
  }

  @Post('reset-password')
  resetPassword(@Body() createUserDto: CreateUserDto) {
    return this.usersService.resetPassword(createUserDto);
  }

  @Post('send-otp')
  sendOTP(@Body() otpDto: OtpDto) {
    return this.usersService.sendOTP(otpDto);
  }

  @Post('verify-otp')
  verifyOTP(@Body() otpVerifyDto: OtpVerifyDto) {
    return this.usersService.verifyOTP(otpVerifyDto);
  }
}
