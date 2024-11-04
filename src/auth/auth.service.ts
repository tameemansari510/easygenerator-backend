import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserResponse } from './responses/UserResponse';
import { LoginAuthDto } from './dto/login-auth-dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh.schema';
import { v4 as uuidv4 } from 'uuid';
import { CustomException } from 'src/exceptions';
import {
  REFRESH_EXPIRED,
  USER_ALREADY_AVAILABLE,
  USER_NOT_AVAILABLE,
  WRONG_PASSWORD,
} from './constants/error.message.constants';
import { ERROR_CODES } from './constants/error.code.constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
  ) {}
  private logger = new Logger(AuthService.name);

  async create(createAuthDto: CreateAuthDto): Promise<UserResponse> {
    try {
      this.logger.log({
        message: `Entering create for ${createAuthDto.email}`,
      });

      const { email, password, username } = createAuthDto;
      const user: User = await this.findUserByEmail(email);
      if (user) {
        throw new CustomException(
          USER_ALREADY_AVAILABLE,
          HttpStatus.BAD_REQUEST,
          ERROR_CODES.USER_ALREADY_AVAILABLE,
        );
      }
      const hashedPassword: string = await bcrypt.hash(password, 10);

      const createdUser: User = await this.UserModel.create({
        username,
        email,
        password: hashedPassword,
      });
      const { accessToken, refreshToken } = await this.generateTokens(email);

      await this.saveOrUpdateToken(refreshToken, accessToken, email);
      const userRes: UserResponse = {
        username: createdUser.username,
        email: createdUser.email,
        password: createdUser.password,
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully. Login to the application.',
        accessToken,
        refreshToken,
      };

      this.logger.log({
        message: `Entering create for ${createAuthDto.email}`,
      });
      return userRes;
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

  async login(loginAuthDto: LoginAuthDto): Promise<UserResponse> {
    try {
      this.logger.log({
        message: `Entering login for ${loginAuthDto.email}`,
      });
      const { email, password } = loginAuthDto;
      const user: User = await this.findUserByEmail(email);
      if (!user) {
        throw new CustomException(
          USER_NOT_AVAILABLE,
          HttpStatus.UNAUTHORIZED,
          ERROR_CODES.USER_NOT_AVAILABLE,
        );
      }
      const isPasswordMatching: boolean = await bcrypt.compare(
        password,
        user.password,
      );
      if (!isPasswordMatching) {
        throw new CustomException(
          WRONG_PASSWORD,
          HttpStatus.UNAUTHORIZED,
          ERROR_CODES.WRONG_PASSWORD,
        );
      }

      const { accessToken, refreshToken } = await this.generateTokens(email);

      await this.saveOrUpdateToken(refreshToken, accessToken, email);
      const userRes: UserResponse = {
        username: user.username,
        email: user.email,
        password: user.password,
        statusCode: HttpStatus.OK,
        message: 'User available',
        accessToken,
        refreshToken,
      };
      this.logger.log({
        message: `Exiting login for ${loginAuthDto.email}`,
      });
      return userRes;
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

  async findUserByEmail(email: string): Promise<User> {
    try {
      this.logger.log({
        message: `Entering findUserByEmail for ${email}`,
      });
      const user: User = await this.UserModel.findOne({ email });
      this.logger.log({
        message: `Exiting findUserByEmail for ${email}`,
      });
      return user;
    } catch (error) {
      this.logger.error({
        message: `Exception in findUserByEmail for ${email}`,
      });
      throw error;
    }
  }

  async refreshTokens(refreshTokenReq: string) {
    try {
      this.logger.log({
        message: `Entering refreshTokens`,
      });
      const token = await this.RefreshTokenModel.findOne({
        refreshToken: refreshTokenReq,
        expiryDate: { $gte: new Date().toISOString() },
      });

      if (!token) {
        throw new CustomException(
          REFRESH_EXPIRED,
          HttpStatus.UNAUTHORIZED,
          ERROR_CODES.REFRESH_EXPIRED,
        );
      }
      const accessToken = await this.generateUserToken(token.email);
      const res = await this.updateAccessTokenByEmail(accessToken, token.email);
      this.logger.log({
        message: `Entering refreshTokens`,
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

  async generateTokens(email: string) {
    try {
      this.logger.log({
        message: `Entering generateTokens for ${email}`,
      });
      const accessToken: string = await this.generateUserToken(email);
      const refreshToken: string = await this.generateRefreshToken();
      this.logger.log({
        message: `Entering generateTokens for ${email}`,
      });
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error({
        message: `Exception in generateTokens for ${email}`,
      });
      throw error;
    }
  }

  async generateUserToken(email: string) {
    try {
      this.logger.log({
        message: `Entering generateUserToken for ${email}`,
      });
      const accessToken: string = this.jwtService.sign(
        { email },
        { expiresIn: 10 }, //kept the access token expiry time as 10 secs for testing
      );
      this.logger.log({
        message: `Entering generateUserToken for ${email}`,
      });
      return accessToken;
    } catch (error) {
      this.logger.error({
        message: `Exception in generateUserToken for ${email}`,
      });
      throw error;
    }
  }

  async generateRefreshToken() {
    try {
      this.logger.log({
        message: `Entering generateRefreshToken`,
      });
      const uuid = uuidv4();
      this.logger.log({
        message: `Exiting generateRefreshToken`,
      });
      return uuid;
    } catch (error) {
      this.logger.error({
        message: `Exception in generateRefreshToken`,
      });
      throw error;
    }
  }

  async saveOrUpdateToken(
    refreshToken: string,
    accessToken: string,
    email: string,
  ) {
    try {
      this.logger.log({
        message: `Entering saveOrUpdateToken for ${email}`,
      });
      const today = new Date();
      today.setSeconds(today.getSeconds() + 60); //kept the refresh token expiry time as 60 secs for testing
      const expiryDate: string = today.toISOString();
      await this.RefreshTokenModel.updateOne(
        { email },
        { $set: { refreshToken, accessToken, email, expiryDate } },
        { upsert: true },
      );
      this.logger.log({
        message: `Exiting saveOrUpdateToken for ${email}`,
      });
    } catch (error) {
      this.logger.error({
        message: `Exception in saveOrUpdateToken for ${email}`,
      });
      throw error;
    }
  }

  async updateAccessTokenByEmail(accessToken: string, email: string) {
    try {
      this.logger.log({
        message: `Entering updateAccessTokenByEmail for ${email}`,
      });
      const res = await this.RefreshTokenModel.findOneAndUpdate(
        { email },
        { $set: { accessToken } },
        { returnDocument: 'after' },
      );
      this.logger.log({
        message: `Exiting updateAccessTokenByEmail for ${email}`,
      });
      return res;
    } catch (error) {
      this.logger.error({
        message: `Exception in updateAccessTokenByEmail for ${email}`,
      });
      throw error;
    }
  }
}
