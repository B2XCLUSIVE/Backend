import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
  JwtAuthService,
  PrismaService,
  OTPService,
  MailService,
  CloudinaryService,
} from 'src/common';
import { OtpDto } from './dto/otp.dto';
import { OtpVerifyDto } from './dto/otp.verify.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly otpService: OTPService,
    private readonly mailService: MailService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logger: Logger,
  ) {}

  async forgotPassword({ email }: OtpDto) {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Generate OTP
    const { otp, otpExpiryTime } = this.otpService.OTPGenerator(4);
    console.log(otp);

    // Save OTP to database
    const newUser = await this.prismaService.user.update({
      where: { email: user.email },
      data: { otp, otpExpiryTime },
    });

    // Send OTP via messaging service
    await this.mailService.forgotPassword(user, otp);
    return {
      message: 'Password reset initiated. Check your email for the OTP',
      ...newUser,
      otp: undefined,
      rating: undefined,
      passwordReset: undefined,
      otpExpiryTime: undefined,
      password: undefined,
    };
  }

  async sendOTP({ email }: OtpDto) {
    const user = await this.getUserByEmail(email);

    if (!user) {
      // Handle case when user is not found
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Generate OTP
    const { otp, otpExpiryTime } = this.otpService.OTPGenerator(4);
    console.log(otp);

    // Save OTP to database
    await this.prismaService.$transaction(async (prisma: any) => {
      await prisma.user.update({
        where: { email: user.email },
        data: { otp, otpExpiryTime },
      });
    });

    // Send OTP via messaging service
    await this.mailService.forgotPassword(user, otp);

    return {
      message: 'OTP sent successfully',
    };
  }

  async verifyOTP(otpVerifyDto: OtpVerifyDto) {
    const user = await this.getUserByEmail(otpVerifyDto.email);

    if (!user) {
      // Handle case when user is not found
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.otp !== otpVerifyDto.otp) {
      throw new HttpException('Invalid Otp', HttpStatus.BAD_REQUEST);
    }

    if (user.otpExpiryTime < new Date()) {
      throw new HttpException('Otp Expired', HttpStatus.GATEWAY_TIMEOUT);
    }

    await this.prismaService.user.update({
      where: { email: otpVerifyDto.email },
      data: { passwordReset: true },
    });

    return {
      status: 'success',
      message: 'OTP verification successfull',
    };
  }

  async resetPassword(createUserDto: CreateUserDto) {
    try {
      // Check if resetPassword flag is true
      const user = await this.prismaService.user.findUnique({
        where: { email: createUserDto.email },
      });

      await this.checkUserExistence(user);

      if (!user.passwordReset) {
        throw new HttpException(
          'Please verify OTP to continue',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if passwords match
      await this.comparePassword(
        createUserDto.password,
        createUserDto.confirmPassword,
      );

      // Hash the new password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Update the user's password and resetPassword flag
      await this.prismaService.user.update({
        where: { email: createUserDto.email },
        data: { password: hashedPassword, passwordReset: false },
      });

      return {
        success: true,
        message: 'Password reset successful',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  private async comparePassword(password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new HttpException('Passwords must match', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyUser(email: string, password: string) {
    let user: any;

    user = await this.getUserByEmail(email);

    await this.checkUserExistence(user);

    await this.checkPasswordMatch(password, user.password);

    return user;
  }

  async checkUserExists(email: string) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.CONFLICT,
      );
    }
  }

  async getUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async getUserById(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async checkUserExistence(user: any) {
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  private async checkPasswordMatch(password: string, hashedPassword: string) {
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatch) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    try {
      const user = await this.getUserById(userId);

      const existingUser = await this.prismaService.user.findUnique({
        where: { id: user.id },
        include: { image: true },
      });

      if (!existingUser) {
        throw new HttpException(
          `User with id number ${userId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (!Object.keys(updateUserDto).length) {
        return {
          status: 'No Updates',
          data: [],
        };
      }

      let image = null;
      if (file) {
        if (existingUser.image) {
          await this.cloudinaryService.deleteResource(
            existingUser.image.publicId,
          );
        }

        const imagesLink = await this.cloudinaryService
          .uploadImage(file)
          .catch((error) => {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
          });

        if (existingUser.image) {
          image = await this.prismaService.image.update({
            where: { id: existingUser.image.id },
            data: {
              publicId: imagesLink.public_id,
              url: imagesLink.url,
            },
          });
        } else {
          image = await this.prismaService.image.create({
            data: {
              publicId: imagesLink.public_id,
              url: imagesLink.url,
            },
          });
        }
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          userName: updateUserDto.userName,
          bio: updateUserDto.bio,
          ...updateUserDto,
          imageId: image?.id,
          socials: updateUserDto?.socials?.map((social) => ({
            Facebook: social?.facebook,
            twitter: social.twitter,
            Instagram: social.instagram,
          })),
        },
        include: { image: true },
      });

      return {
        status: 'Success',
        message: 'User profile updated successfully',
        data: {
          ...updatedUser,
          password: undefined,
          otp: undefined,
          otpExpiration: undefined,
          passwordReset: undefined,
          otpExpiryTime: undefined,
        },
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while updating profile',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }
}
