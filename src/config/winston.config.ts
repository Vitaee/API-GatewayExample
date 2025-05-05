import { format, transports } from 'winston';

export const winstonConfig = {
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf(({ timestamp, level, message, context, trace }) => {
          return `${timestamp} [${level}] [${context || 'Application'}]: ${message}${trace ? `\n${trace}` : ''}`;
        }),
      ),
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
    }),
    new transports.File({
      filename: 'logs/combined.log',
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
    }),
  ],
};
