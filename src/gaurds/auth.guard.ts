import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { CustomException } from 'src/exceptions';
import {
  ACCESS_TOKEN_EXPIRED,
  ERROR_CODES,
  TOKEN_UNAVAILABLE,
} from 'src/auth/constants';
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();
    const token: string = this.extractTokenFromHeader(request);

    if (!token) {
      throw new CustomException(
        TOKEN_UNAVAILABLE,
        HttpStatus.UNAUTHORIZED,
        ERROR_CODES.TOKEN_UNAVAILABLE,
      );
    }
    try {
      this.jwtService.verify(token);
    } catch (error) {
      Logger.error(error);
      throw new CustomException(
        ACCESS_TOKEN_EXPIRED,
        HttpStatus.UNAUTHORIZED,
        ERROR_CODES.ACCESS_TOKEN_EXPIRED,
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string {
    return request.headers.authorization?.split(' ')[1];
  }
}
