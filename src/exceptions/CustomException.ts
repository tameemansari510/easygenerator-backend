import { HttpException } from '@nestjs/common';

export class CustomException extends HttpException {
  public errorCode: number;
  public statusCode: number;
  constructor(message: string, statusCode: number, errorCode: number) {
    super(message, statusCode);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
  }
}
