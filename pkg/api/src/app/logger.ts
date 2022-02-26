import path from "path";
import winston, { format } from "winston";
import "winston-daily-rotate-file";
const { combine, timestamp, printf, splat, colorize, label } = format;

import { dataFolder } from "./env";
import { conf } from "./config";

const logsFolder = path.join(dataFolder, "./logs");

const customFormat = printf(({ level, label, message, timestamp }) => {
  const lbl = label ? `[${label}] ` : "";
  return `${timestamp} ${lbl}${level}: ${message}`;
});

const logger = winston.createLogger({
  level: conf.get("logger.level") || "debug",
  format: combine(
    splat(),
    label({
      label: "",
    }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      level: conf.get("logger.level") || "debug",
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
