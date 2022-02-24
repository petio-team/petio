import path from "path";
import winston from "winston";
import 'winston-daily-rotate-file';

import { dataFolder } from './env';
import { conf } from "./config";

const logsFolder = path.join(dataFolder, './logs');

export default winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: conf.get('logger.level'),
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
      handleExceptions: true,
    }),
    new winston.transports.DailyRotateFile({
      level: conf.get('logger.level'),
      filename: path.join(logsFolder, `petio-%DATE%.log`),
      maxSize: '20m',
      maxFiles: '7d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
    new winston.transports.File({
      filename: path.join(logsFolder, 'live.log'),
      level: "silly",
      maxsize: 100000,
      maxFiles: 1,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => {
          return `${JSON.stringify({
            [info.timestamp]: {
              type: info.level,
              log: info.message,
            },
          })},`;
        })
      ),
    }),
  ],
});