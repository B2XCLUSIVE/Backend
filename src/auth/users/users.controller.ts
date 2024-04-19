import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Put,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser, JwtGuard } from 'src/common';
import { OtpDto } from './dto/otp.dto';
import { OtpVerifyDto } from './dto/otp.verify.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';

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

  /************************ SINGLE USER *****************************/
  @Get('singleUser/:id')
  @UseGuards(JwtGuard)
  async getUser(@Param('id') id: number) {
    return await this.usersService.getUserById(id);
  }

  /************************ Update USER *****************************/
  @UseGuards(JwtGuard)
  // @Roles('ADMIN', 'EMPLOYEE')
  @UseInterceptors(FileInterceptor('file'))
  @Put('update')
  updateUser(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        // .addFileTypeValidator({
        //   fileType: 'jpeg',
        // })
        .addMaxSizeValidator({
          maxSize: 5000000,
        })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.updateUser(user.id, updateUserDto, file);
  }
}
