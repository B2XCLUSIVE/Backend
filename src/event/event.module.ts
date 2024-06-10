import { Logger, Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import {
  CloudinaryService,
  JwtAuthService,
  MailService,
  OTPService,
  PrismaService,
} from 'src/common';
import { UsersService } from 'src/auth/users/users.service';

@Module({
  controllers: [EventController],
  providers: [
    EventService,
    PrismaService,
    CloudinaryService,
    OTPService,
    UsersService,
    //MailService,
    JwtAuthService,
    Logger,
  ],
})
export class EventModule {}
