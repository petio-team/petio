/* eslint-disable import/order */
import * as FileStreamRotator from 'file-stream-rotator';
import { join } from 'node:path';
import pino, { ChildLoggerOptions, Logger as PinoLogger } from 'pino';
import PinoPretty from 'pino-pretty';

import { DATA_DIR, LOG_LEVEL } from '../config/env';

/**
 * The Logger class provides logging functionality for the application.
 */
export class Logger {
  private static instance: Logger;

  private logger: PinoLogger;

  private constructor() {
    this.logger = this.createLogger(
      process.env.NODE_ENV === 'development' ? 'debug' : LOG_LEVEL,
    );
  }

  /**
   * Creates a new instance of the logger with the specified log level.
   * @param level - The log level to use.
   * @returns The created logger instance.
   */
  private createLogger(level: string): PinoLogger<string> {
    const logsFolder = join(DATA_DIR, './logs');
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
            filename: join(logsFolder, 'petio-%DATE%.log'),
            frequency: 'daily',
            verbose: false,
            create_symlink: true,
            audit_file: join(logsFolder, 'audit.json'),
            date_format: 'YYYY-MM-DD',
            max_logs: '7d',
          }),
        },
      ]),
    );
  }

  /**
   * Gets the singleton instance of the Logger class.
   * @returns The Logger instance.
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Logs an info message.
   * @param message - The message to log.
   * @param obj - Additional data to log.
   */
  public info(message: string, obj = {}) {
    this.logger.info(obj, message);
  }

  /**
   * Logs a warning message.
   * @param message - The message to log.
   * @param obj - Additional data to log.
   */
  public warn(message: string, obj = {}) {
    this.logger.warn(obj, message);
  }

  /**
   * Logs an error message.
   * @param message - The message to log.
   * @param obj - Additional data to log.
   */
  public error(message: string, obj = {}) {
    this.logger.error(obj, message);
  }

  /**
   * Logs a debug message.
   * @param message - The message to log.
   * @param obj - Additional data to log.
   */
  public debug(message: string, obj = {}) {
    this.logger.debug(obj, message);
  }

  /**
   * Logs a trace message.
   * @param message - The message to log.
   * @param obj - Additional data to log.
   */
  public trace(message: string, obj = {}) {
    this.logger.trace(obj, message);
  }

  /**
   * Logs a message with the specified log level.
   * @param level - The log level to use.
   * @param message - The message to log.
   * @param obj - Additional data to log.
   */
  public log(level: string, message: string, obj = {}) {
    this.logger[level](obj, message);
  }

  /**
   * Creates a child logger with additional properties.
   * @param obj - The additional properties for the child logger.
   * @returns The child logger instance.
   */
  public child(obj: object, options?: ChildLoggerOptions<string>) {
    return this.logger.child<string>(obj, options);
  }

  /**
   * Gets the underlying logger instance.
   * @returns The underlying logger instance.
   */
  public core() {
    return this.logger;
  }
}

const logger = Logger.getInstance();
export default logger;
