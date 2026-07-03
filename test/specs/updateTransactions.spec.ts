import * as fs from 'fs';
import { after, before, describe, it } from 'mocha';
import * as path from 'path';
import { Transaction, parseCSV } from '../../utils/csv';
import { MainPage } from '../pages/MainPage';
import { TransactionListPage } from '../pages/TransactionsListPage';

/**
 * Test suite for automating transaction entry in Money Lover app
 */
describe('Money Lover Update Transactions', () => {
    let transactionListPage: TransactionListPage;
    let logFile: fs.WriteStream;
    const logFilePath = path.join(process.cwd(), 'logs', `transaction-test-${Date.now()}.log`);

    /**
     * Write log to both console and file
     */
    const writeLog = (message: string) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(message);
        if (logFile) {
            logFile.write(logMessage + '\n');
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
        logFile = fs.createWriteStream(logFilePath, { flags: 'a' });
        writeLog('🚀 Starting Money Lover automation tests...');
        writeLog(`📄 Log file: ${logFilePath}`);

        // Initialize page objects
        transactionListPage = new TransactionListPage();
    });

    after(async () => {
        writeLog('✅ All transactions processed');
        // Close log file
        if (logFile) {
            logFile.end();
            console.log(`\n📄 Test logs saved to: ${logFilePath}`);
        }
        // Optional: Take screenshot or generate report
    });

    /**
     * Test: Update all transactions from CSV file
     */
    it('should update all transactions', async () => {
        try {
            await transactionListPage.switchExcludeReportTransaction();
            writeLog('✅ All transactions updated successfully');
        } catch (error) {
            throw new Error(`Transaction update failed: ${error}`);
        }
    });
});

