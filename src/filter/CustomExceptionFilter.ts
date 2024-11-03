import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { CustomException } from '../exceptions';

@Catch(CustomException)
export class CustomExceptionFiler implements ExceptionFilter<CustomException> {
  catch(exception: CustomException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response
      .status(exception.getStatus())
      .json({ message: exception.message, errorCode: exception.errorCode });
  }
}
