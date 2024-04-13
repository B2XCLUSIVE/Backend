import { Logger, Module } from '@nestjs/common';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import {
  CloudinaryService,
  JwtAuthService,
  MailService,
  OTPService,
  PrismaService,
} from 'src/common';
import { UsersService } from 'src/auth/users/users.service';

@Module({
  controllers: [TrackController],
  providers: [
    TrackService,
    PrismaService,
    CloudinaryService,
    OTPService,
    MailService,
    UsersService,
    JwtAuthService,
    Logger,
  ],
})
export class TrackModule {}
