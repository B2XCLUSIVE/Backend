import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'https://b2exclusive.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,PATCH',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api/v1/');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const logger = new Logger('bootstrap');

  await app.listen(configService.get('PORT'), () => {
    return logger.log(`Server running on port ${configService.get('PORT')}`);
  });
}
bootstrap();
