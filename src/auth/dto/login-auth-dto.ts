import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { PASSWORD_REGEX } from '../constants/regex.constants';

export class LoginAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one number, one letter and one symbol',
  })
  password: string;
}
