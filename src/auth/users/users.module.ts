import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtAuthService, MailService, OTPService, PrismaService } from 'src/common';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, OTPService, MailService, JwtAuthService],
})
export class UsersModule {}
