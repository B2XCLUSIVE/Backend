import { Logger, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import {
  CloudinaryService,
  JwtAuthService,
  MailService,
  OTPService,
  PrismaService,
} from 'src/common';
import { UsersService } from 'src/auth/users/users.service';

@Module({
  controllers: [PostController],
  providers: [
    PostService,
    PrismaService,
    CloudinaryService,
    OTPService,
    //MailService,
    UsersService,
    JwtAuthService,
    Logger,
  ],
})
export class PostModule {}
