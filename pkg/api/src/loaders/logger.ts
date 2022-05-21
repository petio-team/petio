import path from "path";
import winston, { format } from "winston";
import "winston-daily-rotate-file";
const {
  combine,
  timestamp,
  printf,
  splat,
  colorize,
  label,
  errors,
  prettyPrint,
} = format;

import { dataFolder } from "@/app/env";
import { conf } from "@/app/config";

const logsFolder = path.join(dataFolder, "./logs");

const customFormat = printf(({ level, formatLabel, message, timestamp }) => {
  const lbl = formatLabel ? `[${formatLabel}] ` : "";
  return `${timestamp} ${lbl}${level}: ${message}`;
});

const logger = winston.createLogger({
  level: conf.get("logger.level") || "debug",
  format: combine(
    errors({ stack: true }),
    splat(),
    prettyPrint(),
    label({
      label: "label",
    }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      format: combine(colorize(), splat(), timestamp(), customFormat),
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logsFolder, `petio-%DATE%.log`),
      maxSize: "20m",
      maxFiles: "7d",
      createSymlink: true,
      symlinkName: "petio.log",
    }),
    new winston.transports.File({
      filename: path.join(logsFolder, "live.log"),
      level: "silly",
      maxsize: 100000,
      maxFiles: 1,
      tailable: true,
      format: combine(
        timestamp(),
        printf((info) => {
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

export default logger;
