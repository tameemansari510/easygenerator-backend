import { HttpStatus } from '@nestjs/common';

export interface UserResponse {
  statusCode: HttpStatus; // here we can also use our application custom codes
  username: string;
  email: string;
  password: string;
  message: string;
  accessToken: string;
  refreshToken: string;
}
