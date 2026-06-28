import * as fs from "fs";
import { after, before, describe, it } from "mocha";
import * as path from "path";
import { AccountPage } from "../pages/AccountPage";

/**
 * Test suite for automating export transaction entry in Money Lover app
 */
describe("Money Lover Export Transaction", () => {
  let accountPage: AccountPage;
  let logFile: fs.WriteStream;
  const logFilePath = path.join(
    process.cwd(),
    "logs",
    `transaction-test-${Date.now()}.log`,
  );

  /**
   * Write log to both console and file
   */
  const writeLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(message);
    if (logFile) {
      logFile.write(logMessage + "\n");
    }
  };

  before(async () => {
    // await driver.activateApp(config.MONEY_LOVER_APP_ID);
    // await driver.pause(5000);

    // Create logs directory if it doesn't exist
    const logsDir = path.dirname(logFilePath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create log file
    logFile = fs.createWriteStream(logFilePath, { flags: "a" });
    writeLog("🚀 Starting Money Lover automation tests...");
    writeLog(`📄 Log file: ${logFilePath}`);

    // Initialize page objects
    accountPage = new AccountPage();
  });

  after(async () => {
    writeLog("✅ All transactions is exported");
    // Close log file
    if (logFile) {
      logFile.end();
      console.log(`\n📄 Test logs saved to: ${logFilePath}`);
    }
    // Optional: Take screenshot or generate report
  });

  /**
   * Test: Add all transactions from CSV file
   */
  it("should export all transactions from CSV file", async () => {
    await accountPage.exportToGoogleSheet();
  });
});
