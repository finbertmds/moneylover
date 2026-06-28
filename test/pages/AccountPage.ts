import { $ } from '@wdio/globals';
import Gestures from '../helpers/Gestures';
import timeSelectionPopup from './TimeSelectionPopup';

/**
 * Account Page Object for Money Lover app
 * Contains methods to interact with the account screen
 */
export class AccountPage {

    private get tabAccountButton() {
        return $('id=com.bookmark.money:id/tabAccount');
    }

    private get toolsButton() {
        return $('//android.widget.TextView[contains(@text, "Tools")]');
    }

    private get exportToGoogleSheetButton() {
        return $('//android.widget.TextView[contains(@text, "Export to Google sheet")]');
    }

    private get walletNameInput() {
        return $('id=com.bookmark.money:id/wallet_name');
    }

    private get walletNameByText() {
        return (walletName: string) => $(`//android.widget.TextView[contains(@text, "${walletName}")]`);
    }

    private get rakutenCardWallet() {
        return this.walletNameByText('楽天カード');
    }

    private get selectTimeRangeButton() {
        return $('id=com.bookmark.money:id/time_chooser_layout');
    }

    private get afterTimeRangeOption() {
        return $('//android.widget.TextView[contains(@text, "After")]');
    }

    private get exportButton() {
        return $('id=com.bookmark.money:id/actionExport');
    }

    private get exportActionButton() {
        return $('id=com.bookmark.money:id/button_positive');
    }

    private get exportSuccessMessage() {
        return $('//android.widget.TextView[contains(@text, "Export successfully")]');
    }

    private get exportAlertCloseButton() {
        return $('id=com.bookmark.money:id/button_negative');
    }

    
    /**
     * Scroll down to find category element
     * @param categoryElement - The element to find
     * @param maxScrolls - Maximum number of scroll attempts (default: 10)
     * @returns true if element found, false otherwise
     */
    private async scrollToFindElement(element: any, maxScrolls: number = 15): Promise<boolean> {
        for (let i = 0; i < maxScrolls; i++) {
            try {
                // Check if element is displayed
                if (await element.isDisplayed()) {
                    return true;
                }
            } catch (e) {
                // Element not found, continue scrolling
            }
            
            await Gestures.swipeUp(0.9);
            
            await browser.pause(500);
            
            // Check again after scroll
            try {
                if (await element.isDisplayed()) {
                    return true;
                }
            } catch (e) {
                // Continue scrolling
            }
        }
        
        return false;
    }

    async exportToGoogleSheet(): Promise<void> {
        await this.tabAccountButton.click();
        await browser.pause(1000);

        await this.scrollToFindElement(this.toolsButton);
        await this.toolsButton.click();
        await browser.pause(1000);

        await this.scrollToFindElement(this.exportToGoogleSheetButton);
        await this.exportToGoogleSheetButton.click();
        await browser.pause(1000);

        await this.walletNameInput.click();
        await this.rakutenCardWallet.click();

        await this.selectTimeRangeButton.click();
        await this.afterTimeRangeOption.click();
        // move to 2 months ago from current date and click on the last day of that month
        const currentDate = new Date();
        const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
        const year = twoMonthsAgo.getFullYear().toString();
        const month = (twoMonthsAgo.getMonth() + 1).toString().padStart(2, '0');
        const lastDayOfTwoMonthsAgo = new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth() + 1, 0);
        await timeSelectionPopup.moveToMonth(month, year);
        await timeSelectionPopup.dayInput(lastDayOfTwoMonthsAgo.getDate().toString().padStart(2, '0')).click();
        await timeSelectionPopup.daySelectTimeButton.click();
        await browser.pause(1000);

        await this.exportButton.click();
        await browser.pause(1000);

        await this.exportActionButton.click();
        await browser.pause(1000);

        // Wait for export success message
        await browser.waitUntil(async () => {
            return await this.exportSuccessMessage.isDisplayed();
        }, {
            timeout: 30000,
            timeoutMsg: 'Export success message not displayed after 10s'
        });
        await this.exportAlertCloseButton.click();

        await this.navigateBack();
    }
    
    /**
     * Navigate back to main page
     */
    async navigateBack(): Promise<void> {
        try {
            await browser.back();
            await browser.pause(1000);
        } catch (error) {
            console.log('Navigation back failed, continuing...');
        }
    }
}

