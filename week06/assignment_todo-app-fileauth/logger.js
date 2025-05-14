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

(async () => {
  try {
    console.info(getISTTimestamp() + " - Log directory initialisation ....");
    await fs.mkdir(LOGS_DIR, { recursive: true });
  } catch (error) {
    console.error(
      getISTTimestamp() + " - Failed to create log directory:",
      error
    );
    process.exit(1);
  }
})();
