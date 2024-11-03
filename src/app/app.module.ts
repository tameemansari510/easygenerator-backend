import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from '../config/config';
import { JwtModule } from '@nestjs/jwt';
import { ReadmeModule } from 'src/readme/readme.module';
import { CustomExceptionFiler } from 'src/filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config], cache: true }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.connectionstring'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ReadmeModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger, CustomExceptionFiler],
  exports: [CustomExceptionFiler],
})
export class AppModule {}
