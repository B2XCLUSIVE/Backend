import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import {
  AllExceptionsFilter,
  CloudinaryModule,
  ConfigModule,
  UserInterceptor,
} from './common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PaystackModule } from './paystack/paystack.module';

@Module({
  imports: [ConfigModule, AuthModule, CloudinaryModule, PaystackModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
