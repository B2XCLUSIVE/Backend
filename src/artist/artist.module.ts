import { Logger, Module } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
import { UsersService } from 'src/auth/users/users.service';
import {
  CloudinaryService,
  JwtAuthService,
  MailService,
  OTPService,
  PrismaService,
} from 'src/common';

@Module({
  controllers: [ArtistController],
  providers: [
    ArtistService,
    UsersService,
    PrismaService,
    CloudinaryService,
    OTPService,
    // MailService,
    JwtAuthService,
    Logger,
  ],
})
export class ArtistModule {}
