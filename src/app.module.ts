import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import {
  AllExceptionsFilter,
  CloudinaryModule,
  ConfigModule,
  RequestSizeMiddleware,
  UserInterceptor,
} from './common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PaystackModule } from './paystack/paystack.module';
import { ArtistModule } from './artist/artist.module';
import { EventModule } from './event/event.module';
import { PostModule } from './post/post.module';
import { TrackModule } from './track/track.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    CloudinaryModule,
    PaystackModule,
    ArtistModule,
    EventModule,
    PostModule,
    TrackModule,
  ],
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestSizeMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
