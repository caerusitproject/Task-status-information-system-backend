const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const level = process.env.LOG_LEVEL || "info";

const logger = createLogger({
  level,
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      dirname: "logs",
      filename: "app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "10m",
      maxFiles: "30d"
    })
  ]
});

// Make logger global
global.logger = logger;

module.exports = logger;
