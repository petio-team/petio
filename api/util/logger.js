var path = require("path");
const winston = require("winston");

let logfile = process.pkg
  ? path.join(path.dirname(process.execPath), "./logs/logfile.log")
  : "./logs/logfile.log";
let liveLogfile = process.pkg
  ? path.join(path.dirname(process.execPath), "./logs/live.log")
  : "./logs/live.log";

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
    new winston.transports.File({
      level: "silly",
      filename: logfile,
      maxsize: 1000000,
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
    new winston.transports.File({
      filename: liveLogfile,
      level: "silly",
      maxsize: 10000,
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

module.exports = logger;
