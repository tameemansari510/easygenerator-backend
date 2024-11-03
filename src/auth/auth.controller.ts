import { Controller, Post, Body, Logger, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth-dto';
import { UserResponse } from './responses/UserResponse';
import { RefreshTokenDto } from './dto/refresh-tokens.dto';
import { Public } from 'src/decorators/public.decorator';
import { CustomExceptionFiler } from 'src/filter';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private logger = new Logger(AuthController.name);
  @Post('signup')
  @Public()
  @UseFilters(CustomExceptionFiler)
  async create(@Body() createAuthDto: CreateAuthDto): Promise<UserResponse> {
    try {
      this.logger.log({
        message: `Entering create for ${createAuthDto.email}`,
      });
      const res: UserResponse = await this.authService.create(createAuthDto);
      this.logger.log({
        message: `Exiting create for ${createAuthDto.email}`,
      });
      return res;
    } catch (error) {
      this.logger.error({
        message: `Exception in create for ${createAuthDto.email}`,
        error: {
          errorCode: error?.errorCode,
          message: error?.message,
        },
      });
      throw error;
    }
  }

  @Post('login')
  @Public()
  @UseFilters(CustomExceptionFiler)
  async login(@Body() loginAuthDto: LoginAuthDto): Promise<UserResponse> {
    try {
      this.logger.log({
        message: `Entering login for ${loginAuthDto.email}`,
      });

      const res: UserResponse = await this.authService.login(loginAuthDto);
      this.logger.log({
        message: `Exiting login for ${loginAuthDto.email}`,
      });
      return res;
    } catch (error) {
      this.logger.error({
        message: `Exception in login for ${loginAuthDto.email}`,
        error: {
          errorCode: error?.errorCode,
          message: error?.message,
        },
      });
      throw error;
    }
  }

  @Post('refresh')
  @Public()
  @UseFilters(CustomExceptionFiler)
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      this.logger.log({
        message: `Entering refreshTokens`,
      });
      const res = this.authService.refreshTokens(refreshTokenDto.token);
      this.logger.log({
        message: `Exiting refreshTokens`,
      });
      return res;
    } catch (error) {
      this.logger.error({
        message: `Exception in refreshTokens`,
        error: {
          errorCode: error?.errorCode,
          message: error?.message,
        },
      });
      throw error;
    }
  }
}
