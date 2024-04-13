import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from './users/users.module';
import {
  CloudinaryService,
  JwtAuthService,
  MailModule,
  OTPService,
  PrismaService,
} from 'src/common';
import { UsersService } from './users/users.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtAuthService,
    OTPService,
    UsersService,
    CloudinaryService,
    Logger,
  ],
  imports: [UsersModule, MailModule],
})
export class AuthModule {}
