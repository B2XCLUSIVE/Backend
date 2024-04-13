import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {
  CloudinaryService,
  JwtAuthService,
  MailService,
  OTPService,
  PrismaService,
} from 'src/common';
import { AuthModule } from '../auth.module';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService,
    OTPService,
    MailService,
    JwtAuthService,
    CloudinaryService,
    Logger,
  ],
})
export class UsersModule {}
