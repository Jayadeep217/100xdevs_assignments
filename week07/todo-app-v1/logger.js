const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const path = require("path");
const fs = require("fs").promises;

const { createLogger, format, transports } = require("winston");

dayjs.extend(utc);
dayjs.extend(timezone);

const LOGS_DIR = path.join(__dirname, "logs");
const LOGS_FILE = path.join(LOGS_DIR, "app.log");
const ERROR_LOGS_FILE = path.join(LOGS_DIR, "error.log");
const LOG_LEVEL = "info";
const MAX_LOG_SIZE = 50 * 1024 * 1024;
const MAX_LOG_FILES = 20;

function getISTFormattedDateTime() {
  return dayjs().tz("Asia/Kolkata").format("YYYY-MM-DDTHH:mm:ss.SSSZ");
}

const logFormat = format.printf(
  ({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} - ${level.toUpperCase()} - ${message}`;

    if (stack) {
      logMessage += `\n{stack}`;
    }

    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return logMessage;
  }
);

async function initLogStorage() {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
    console.log(`${getISTFormattedDateTime()} - Logs directory initialized`);
  } catch (error) {
    const errorMessage = `${getISTFormattedDateTime()} - Failed to initialize log storage! Exiting application.`;
    console.error(errorMessage, error);
    throw new Error(`Log storage initialization failed: ${error.message}`);
  }
}

async function initLogger() {
  try {
    await initLogStorage();

    const logger = createLogger({
      level: LOG_LEVEL,
      format: format.combine(
        format.errors({ stack: true }), // Capture stack traces
        format.timestamp({ format: getISTFormattedDateTime }),
        format.splat(), // Support string interpolation
        logFormat
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.timestamp({ format: getISTFormattedDateTime }),
            logFormat
          ),
          handleExceptions: true,
          handleRejections: true,
        }),

        new transports.File({
          filename: LOGS_FILE,
          level: LOG_LEVEL,
          maxsize: MAX_LOG_SIZE,
          maxFiles: MAX_LOG_FILES,
          tailable: true,
          handleExceptions: true,
          handleRejections: true,
          format: format.combine(
            format.timestamp({ format: getISTFormattedDateTime }),
            logFormat
          ),
        }),

        new transports.File({
          filename: ERROR_LOGS_FILE,
          level: "error",
          maxsize: MAX_LOG_SIZE,
          maxFiles: MAX_LOG_FILES,
          tailable: true,
          handleExceptions: true,
          handleRejections: true,
          format: format.combine(
            format.timestamp({ format: getISTFormattedDateTime }),
            logFormat
          ),
        }),
      ],
      exitOnError: false,
    });

    logger.info("Logger info", {
      logLevel: LOG_LEVEL,
      logDir: LOGS_DIR,
      maxSize: MAX_LOG_SIZE,
      maxFiles: MAX_LOG_FILES,
    });

    return logger;
  } catch (error) {
    console.error(
      `${getISTFormattedDateTime()} - Logger initialization failed:`,
      error
    );
    throw error;
  }
}

async function closeLogger(logger) {
  return new Promise((resolve) => {
    if (logger) {
      logger.on("finish", resolve);
      logger.end();
    } else {
      resolve();
    }
  });
}

module.exports = {
  initLogger,
  closeLogger,
  getISTFormattedDateTime,
};
