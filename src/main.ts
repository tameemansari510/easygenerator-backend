import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './gaurds/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { WinstonModule } from 'nest-winston';
import { CustomLoggerService } from './logging/custom-logger';
import { CustomExceptionFiler } from './filter';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./certs/cert.key'),
    cert: fs.readFileSync('./certs/cert.crt'),
  };
  const customLoggerService = new CustomLoggerService();
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
    logger: WinstonModule.createLogger(customLoggerService.createLoggerConfig),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = app.get(ConfigService);
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  app.useGlobalGuards(new AuthGuard(jwtService, reflector));
  app.useGlobalFilters(new CustomExceptionFiler());
  app.enableCors();
  await app.listen(config.get('port'));
}
bootstrap();
