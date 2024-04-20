import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateAuthDto } from './dto/create-auth.dto';
import {
  JwtAuthService,
  PrismaService,
  OTPService,
  MailService,
} from 'src/common';
import { UsersService } from './users/users.service';
import { OtpDto } from './users/dto/otp.dto';
import { SignInDto } from './dto/signin-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly prismaService: PrismaService,
    private readonly otpService: OTPService,
    private readonly usersService: UsersService,
    // private readonly mailService: MailService,
  ) {}

  async signin(signInDto: SignInDto) {
    try {
      const user = await this.usersService.verifyUser(
        signInDto.email,
        signInDto.password,
      );

      const token = this.generateAuthTokenBasedOnType(user);
      return this.formatLoginResponse(user, token);
    } catch (error) {
      throw error;
    }
  }

  private generateAuthTokenBasedOnType(user: any): string {
    // Generate token for regular user
    return this.jwtAuthService.generateAuthToken(
      user.id,
      user.firstName,
      user.role,
    );
  }

  async signup(createAuthDto: CreateAuthDto, role?: string) {
    try {
      await this.usersService.checkUserExists(createAuthDto.email);

      // await this.comparePassword(
      //   createAuthDto.password,
      //   createAuthDto.confirmPassword,
      // );

      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

      const newUser = await this.createUser(
        createAuthDto,
        hashedPassword,
        role,
      );

      return this.formatSignupResponse(newUser);
    } catch (error) {
      throw error;
    }
  }

  private async comparePassword(password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new HttpException('Passwords must match', HttpStatus.BAD_REQUEST);
    }
  }

  private async createUser(
    createAuthDto: CreateAuthDto,
    password: string,
    role: string,
  ) {
    //const { otp, otpExpiryTime } = this.otpService.OTPGenerator(4);
    return this.prismaService.user.create({
      data: {
        userName: createAuthDto.userName,
        role,
        email: createAuthDto.email,
        password,
        field: createAuthDto.field,
        friends: createAuthDto.friends,
      },
    });
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

  private formatLoginResponse(user: any, token: string) {
    return {
      success: true,
      message: 'Login successful',
      data: {
        ...user,
        token,
        otp: undefined,
        otpExpiryTime: undefined,
        passwordReset: undefined,
        password: undefined,
      },
    };
  }

  private formatSignupResponse(newUser: any) {
    return {
      success: true,
      message: 'Signup successful',
      data: {
        ...newUser,
        otp: undefined,
        otpExpiryTime: undefined,
        passwordReset: undefined,
        password: undefined,
      },
    };
  }
}
