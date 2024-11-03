import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export class CustomLoggerService {
  dailyRotateFileTransport: any = null;
  myFormat: winston.Logform.Format = null;
  createLoggerConfig: winston.LoggerOptions = null;
  constructor() {
    this.dailyRotateFileTransport = new DailyRotateFile({
      filename: `logs/app_log-%DATE%.log`,
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '1d',
    });

    this.myFormat = winston.format.printf(
      ({ message, timestamp, ...metadata }) => {
        const data = { ...metadata };
        delete data.level;
        const json: any = {
          timestamp,
          context: data.context,
          message,
          error: data.error,
        };

        const msg = JSON.stringify(json);
        return msg;
      },
    );

    this.createLoggerConfig = {
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        this.myFormat,
      ),

      transports: [this.dailyRotateFileTransport],
    };
  }
}
