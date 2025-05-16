const { createLogger, format, transports } = require("winston");
const path = require("path");
const fs = require("fs").promises;
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const LOGS_DIR = path.join(__dirname, "logs");
const LOGS_FILE = path.join(LOGS_DIR, "app.log");

function getISTTimestamp() {
  return dayjs().tz("Asia/Kolkata").format("YYYY-MM-DDTHH:mm:ss.SSSZ");
}

const logFormat = format.printf(({ timestamp, level, message }) => {
  return `${timestamp} - ${level.toUpperCase()} - ${message}`;
});

async function initLogger() {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
  } catch (err) {
    console.error(getISTTimestamp() + " - Failed to create log dir", err);
    process.exit(1);
  }

  return createLogger({
    level: "info",
    transports: [
      new transports.Console({
        format: format.combine(
          format.timestamp({ format: getISTTimestamp }),
          logFormat
        ),
      }),
      new transports.File({
        filename: LOGS_FILE,
        level: "info",
        maxsize: 50 * 1024 * 1024,
        maxFiles: 20,
        tailable: true,
        format: format.combine(
          format.timestamp({ format: getISTTimestamp }),
          logFormat
        ),
      }),
    ],
  });
}

module.exports = initLogger;
