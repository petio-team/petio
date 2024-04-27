/* eslint-disable import/order */
import * as FileStreamRotator from 'file-stream-rotator';
import path from 'path';
import pino, { Logger as PinoLogger } from 'pino';
import PinoPretty from 'pino-pretty';

import pathsConfig from '@/config/env/paths';

const logsFolder = path.join(pathsConfig.dataDir, './logs');

function createLogger(level: string): PinoLogger<string> {
  return pino(
    {
      level,
    },
    pino.multistream([
      {
        level,
        stream: PinoPretty({
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: true,
          sync: true,
        }),
      },
      {
        level,
        stream: FileStreamRotator.getStream({
          filename: path.join(logsFolder, 'petio-%DATE%.log'),
          frequency: 'daily',
          verbose: false,
          create_symlink: true,
          audit_file: path.join(logsFolder, 'audit.json'),
          date_format: 'YYYY-MM-DD',
          max_logs: '7d',
        }),
      },
    ]),
  );
}

export class Logger {
  private static instance: Logger;

  private logger: PinoLogger;

  private children: pino.Logger<string>[] = [];

  private constructor() {
    const level = process.env.LOG_LEVEL || 'info';
    this.logger = createLogger(
      process.env.NODE_ENV === 'development' ? 'debug' : level,
    );
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, obj = {}) {
    this.logger.info(obj, message);
  }

  public warn(message: string, obj = {}) {
    this.logger.warn(obj, message);
  }

  public error(message: string, obj = {}) {
    this.logger.error(obj, message);
  }

  public debug(message: string, obj = {}) {
    this.logger.debug(obj, message);
  }

  public trace(message: string, obj = {}) {
    this.logger.trace(obj, message);
  }

  public log(level: string, message: string, obj = {}) {
    this.logger[level](obj, message);
  }

  public child(obj: object) {
    const child = this.logger.child<string>(obj);
    this.children.push(child);
    return child;
  }

  public core() {
    return this.logger;
  }
}

const logger = Logger.getInstance();
export default logger;
