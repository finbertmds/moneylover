import * as fs from 'fs';
import { after, before, describe, it } from 'mocha';
import * as path from 'path';
import { Transaction, parseCSV } from '../../utils/csv';
import { MainPage } from '../pages/MainPage';

/**
 * Test suite for automating transaction entry in Money Lover app
 */
describe('Money Lover Transaction Automation', () => {
    let mainPage: MainPage;
    let transactions: Transaction[];
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
        mainPage = new MainPage();

        // Parse CSV file
        try {
            transactions = parseCSV('./data/transactions.csv');
            writeLog(`📊 Loaded ${transactions.length} transactions from CSV`);
        } catch (error) {
            throw new Error(`Failed to load transactions: ${error}`);
        }

        // Wait for app to launch
        // await driver.activateApp('com.bookmark.money');
        await browser.pause(5000);

        // Wait for main page to load
        await mainPage.waitForPageLoad();
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
     * Test: Add all transactions from CSV file
     */
    it('should add all transactions from CSV file', async () => {
        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < transactions.length; i++) {
            const transaction = transactions[i];
            const transactionNumber = i + 1;

            try {
                writeLog(`\n📝 Processing transaction ${transactionNumber}/${transactions.length}:`);
                writeLog(`   Type: ${transaction.type}`);
                writeLog(`   Category: ${transaction.category}`);
                writeLog(`   Amount: ${transaction.amount}`);
                writeLog(`   Date: ${transaction.date}`);
                writeLog(`   Note: ${transaction.note}`);

                // Step 1: Tap "Add Transaction" button
                writeLog('   Step 1: Opening Add Transaction screen...');
                await mainPage.addTransaction(transaction);

                successCount++;
                writeLog(`   ✅ Transaction ${transactionNumber} added successfully\n`);

                // Small delay between transactions
                await browser.pause(1000);

            } catch (error) {
                failureCount++;
                const errorMsg = `   ❌ Failed to add transaction ${transactionNumber}: ${error}`;
                writeLog(errorMsg);
                writeLog(`   Error details: ${error}`);
                console.error(errorMsg);
                console.error(`   Error details: ${error}`);

                // Try to recover: navigate back to main page
                try {
                    await mainPage.navigateBack();
                    await browser.pause(2000);
                    await mainPage.waitForPageLoad();
                } catch (recoveryError) {
                    const recoveryErrorMsg = `   ⚠️  Failed to recover: ${recoveryError}`;
                    writeLog(recoveryErrorMsg);
                    console.error(recoveryErrorMsg);
                    // Continue with next transaction
                }

                // Continue with next transaction even if this one failed
                continue;
            }
        }

        // Summary
        const summarySeparator = '='.repeat(70);
        writeLog('\n' + summarySeparator);
        writeLog('📊 TRANSACTION SUMMARY');
        writeLog(summarySeparator);
        writeLog(`Total transactions: ${transactions.length}`);
        writeLog(`✅ Successful: ${successCount}`);
        writeLog(`❌ Failed: ${failureCount}`);
        writeLog(summarySeparator);

        // Assert that at least some transactions were successful
        if (successCount === 0) {
            throw new Error('All transactions failed! Please check the app and locators.');
        }

        // Log warning if some transactions failed
        if (failureCount > 0) {
            const warningMsg = `⚠️  Warning: ${failureCount} transaction(s) failed. Please review the errors above.`;
            writeLog(warningMsg);
            console.warn(warningMsg);
        }
    });

    /**
     * Test: Verify app is launched and main page is accessible
     */
    it('should verify app is launched', async () => {
        try {
            await mainPage.waitForPageLoad();
            writeLog('✅ App launched successfully');
        } catch (error) {
            throw new Error(`App launch verification failed: ${error}`);
        }
    });
});

