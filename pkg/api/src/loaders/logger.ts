import path from 'path';
import * as FileStreamRotator from 'file-stream-rotator';
import pino, { Logger as PinoLogger } from 'pino';

import PinoPretty from "pino-pretty";
import pathsConfig from "@/config/env/paths";

const logsFolder = path.join(pathsConfig.dataDir, './logs');

function createLogger(level: string): PinoLogger {
  return pino({
    level,
  }, pino.multistream([
    {
      level,
      stream: PinoPretty({
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: true,
        sync: true,
      })
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
      })
    }
  ]));
}

let logger = createLogger('info');

const loggerObj = {
  setLevel: (level: string) => {
    if (!['info', 'warn', 'error', 'debug', 'trace'].includes(level)) {
      throw new Error(`Invalid log level [${level}] expected one of [info, warn, error, debug, trace]`);
    }
    logger = createLogger(level);
  },
  info: (message: string, obj = {}) => {
    logger.info(obj, message);
  },
  warn: (message: string, obj = {}) => {
    logger.warn(obj, message);
  },
  error: (message: string, obj = {}) => {
    logger.error(obj, message);
  },
  debug: (message: string, obj = {}) => {
    logger.debug(obj, message);
  },
  log: (level: string, message: string, obj = {}) => {
    logger[level](obj, message);
  },
  core: logger,
};
export type Logger = typeof loggerObj;

export default loggerObj;
