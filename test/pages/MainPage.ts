import { $ } from '@wdio/globals';
import { Transaction } from '../../utils/csv';
import Gestures from '../helpers/Gestures';

/**
 * Main Page Object for Money Lover app
 * Contains methods to interact with the main/home screen
 */
export class MainPage {
    
    /**
     * Locators for main page elements
     */
    private get addTransactionButton() {
        // Common locators for "Add Transaction" button
        // Adjust these based on actual app UI
        return $('id=com.bookmark.money:id/add_button');
    }

    private get incomeTab() {
        return $('//android.widget.TextView[contains(@text, "Income")]');
    }

    private get expenseTab() {
        return $('//android.widget.TextView[contains(@text, "Expense")]');
    }

    private get ammountButton() {
        return $('id=com.bookmark.money:id/amount_text');
    }

    private amountInput(digit: string) {
        if (digit === '0') {
            return $('id=com.bookmark.money:id/button14');
        }
        return $(`id=com.bookmark.money:id/button${digit}`);
    }

    private get amountInputEnter() {
        return $('id=com.bookmark.money:id/button19');
    }
    
    private get categoryButton() {
        return $('id=com.bookmark.money:id/category');
    }

    // SHOW MORE…
    private get showMoreButton() {
        return $('//android.widget.TextView[contains(@text, "SHOW MORE…")]');
    }

    // Category locators based on get_category mapping
    private get foodAndBeverageText() {
        return $('//android.widget.TextView[contains(@text, "Food & Beverage")]');
    }

    private get shoppingText() {
        return $('//android.widget.TextView[contains(@text, "Shopping")]');
    }

    private get internetBillText() {
        return $('//android.widget.TextView[contains(@text, "Internet Bill")]');
    }

    private get phoneBillText() {
        return $('//android.widget.TextView[contains(@text, "Phone Bill")]');
    }

    private get transportationText() {
        return $('//android.widget.TextView[contains(@text, "Transportation")]');
    }

    private get investmentText() {
        return $('//android.widget.TextView[contains(@text, "Investment")]');
    }

    private get travelText() {
        return $('//android.widget.TextView[contains(@text, "Travel")]');
    }

    private get electricityBillText() {
        return $('//android.widget.TextView[contains(@text, "Electricity Bill")]');
    }

    private get gamesText() {
        return $('//android.widget.TextView[contains(@text, "Games")]');
    }

    private get noteButton() {
        return $('id=com.bookmark.money:id/note');
    }

    private get noteInput() {
        return $('id=com.bookmark.money:id/edtNote');
    }

    private get noteSaveButton() {
        return $('id=com.bookmark.money:id/actionSave');
    }

    private get dateButton() {
        return $('id=com.bookmark.money:id/date');
    }

    private get previousMonthButton() {
        return $('id=android:id/prev');
    }

    private get nextMonthButton() {
        return $('id=android:id/next');
    }


    private convertMonthToText(month: number): string {
        const monthText = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthText[month - 1];
    }

    private async checkIsCurrentMonth(month: string, year: string): Promise<boolean> {
        let monthText = this.convertMonthToText(parseInt(month));
        let dayText = $$(`//android.view.View[contains(@content-desc, "15 ${monthText} ${year}")]`);
        console.log(`Checking if ${monthText} ${year} is current month: ${(await dayText).length}`);
        return (await dayText).length > 0;
    }

    private async getCurrentMonth(year: string): Promise<number> {
        for (let i = 1; i <= 12; i++) {
            let monthText = this.convertMonthToText(i);
            let dayText = $$(`//android.view.View[contains(@content-desc, "15 ${monthText} ${year}")]`);
            console.log(`Checking if ${monthText} ${year} is current month: ${(await dayText).length}`);
            if ((await dayText).length > 0) {
                return i;
            }
        }
        return 0;
    }

    private async moveToMonth(month: string, year: string): Promise<void> {
        while (!(await this.checkIsCurrentMonth(month, year))) {
            let currentMonth = await this.getCurrentMonth(year);
            console.log(`Current month: ${currentMonth}`);
            if (currentMonth === 0) {
                return;
            }
            if (currentMonth < parseInt(month)) {
                await this.nextMonthButton.click();
            } else {
                await this.previousMonthButton.click();
            }
        }
    }

    private dayInput(day: string) {
        let dayText = day;
        // if day is less than 9, remove the 0 from the beginning if it exists
        if (dayText.length > 1 && dayText[0] === '0') {
            dayText = dayText.slice(1);
        }
        return $(`//android.view.View[contains(@text, "${dayText}")]`);
    }

    private get daySelectTimeButton() {
        return $('id=android:id/button1');
    }

    private get saveButton() {
        return $('id=com.bookmark.money:id/btn_save');
    }
    
    /**
     * Wait for main page to load
     */
    async waitForPageLoad(): Promise<void> {
        try {
            // Wait for any main page element to be visible
            await this.addTransactionButton.waitForDisplayed({
                timeout: 10000,
                timeoutMsg: 'Main page did not load'
            });
        } catch (error) {
            console.log('Main page elements not found, trying alternative locators...');
            // App might already be on main screen
            await browser.pause(2000);
        }
    }
    
    /**
     * Tap on "Add Transaction" button
     */
    async addTransaction(transaction: Transaction): Promise<void> {
        try {
            await this.waitForPageLoad();

            if (await this.saveButton.isDisplayed()) {
                await this.saveButton.click();
            }
            
            // Try multiple locator strategies
            const locators = [
                'id=com.bookmark.money:id/add_button',
            ];
            
            let clicked = false;
            for (const locator of locators) {
                try {
                    const element = await $(locator);
                    if (await element.isDisplayed()) {
                        await element.click();
                        clicked = true;
                        console.log(`✅ Clicked Add Transaction using locator: ${locator}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!clicked) {
                throw new Error('Could not find Add Transaction button');
            }

            if (transaction.type === 'income') {
                await this.incomeTab.click();
            } else {
                await this.expenseTab.click();
            }

            await this.ammountButton.click();

            // Enter the amount 
            // from string of transaction.amount then click button 5, button 0, button enter 0
            const amount = transaction.amount.split('');
            for (const digit of amount) {
                await this.amountInput(digit).click();
            }

            await this.amountInputEnter.click();

            await this.noteButton.click();
            await browser.pause(1000);
            await this.noteInput.setValue(transaction.note);
            await this.noteSaveButton.click();
            await browser.pause(1000);

            await this.categoryButton.click();

            // Click category based on get_category mapping logic
            await this.selectCategory(transaction.category);

            await this.dateButton.click();
            await browser.pause(1000);
            await this.moveToMonth(transaction.date.split('-')[1], transaction.date.split('-')[0]);
            await browser.pause(1000);
            await this.dayInput(transaction.date.split('-')[2]).click();
            await browser.pause(1000);
            await this.daySelectTimeButton.click();
            await browser.pause(1000);

            await this.saveButton.click();

            // Wait a bit for the add transaction screen to appear
            await browser.pause(2000);
            
        } catch (error) {
            throw new Error(`Failed to tap Add Transaction: ${error}`);
        }
    }
    
    /**
     * Scroll down to find category element
     * @param categoryElement - The element to find
     * @param maxScrolls - Maximum number of scroll attempts (default: 10)
     * @returns true if element found, false otherwise
     */
    private async scrollToFindElement(categoryElement: any, maxScrolls: number = 15): Promise<boolean> {
        for (let i = 0; i < maxScrolls; i++) {
            try {
                if (await this.showMoreButton.isDisplayed()) {
                    await this.showMoreButton.click();
                    await browser.pause(1000);
                }
                // Check if element is displayed
                if (await categoryElement.isDisplayed()) {
                    return true;
                }
            } catch (e) {
                // Element not found, continue scrolling
            }
            
            await Gestures.swipeUp(0.9);
            
            await browser.pause(500);
            
            // Check again after scroll
            try {
                if (await categoryElement.isDisplayed()) {
                    return true;
                }
            } catch (e) {
                // Continue scrolling
            }
        }
        
        return false;
    }

    /**
     * Select category based on category name
     * Maps categories from get_category function logic
     */
    private async selectCategory(category: string): Promise<void> {
        try {
            let categoryElement;
            
            switch (category) {
                case 'Internet Bill':
                    categoryElement = this.internetBillText;
                    break;
                case 'Phone Bill':
                    categoryElement = this.phoneBillText;
                    break;
                case 'Shopping':
                    categoryElement = this.shoppingText;
                    break;
                case 'Transportation':
                    categoryElement = this.transportationText;
                    break;
                case 'Investment':
                    categoryElement = this.investmentText;
                    break;
                case 'Travel':
                    categoryElement = this.travelText;
                    break;
                case 'Electricity Bill':
                    categoryElement = this.electricityBillText;
                    break;
                case 'Games':
                    categoryElement = this.gamesText;
                    break;
                case 'Food & Beverage':
                default:
                    categoryElement = this.foodAndBeverageText;
                    break;
            }
            
            // Try to click the category element with scrolling
            try {
                // First check if element is already visible
                let isVisible = false;
                try {
                    isVisible = await categoryElement.isDisplayed();
                } catch (e) {
                    // Element not visible, will scroll
                }
                
                // If not visible, scroll to find it
                if (!isVisible) {
                    console.log(`📜 Scrolling to find category: ${category}`);
                    isVisible = await this.scrollToFindElement(categoryElement);
                }
                
                if (isVisible) {
                    await categoryElement.click();
                    console.log(`✅ Selected category: ${category}`);
                } else {
                    throw new Error(`Category "${category}" not found after scrolling`);
                }
            } catch (error) {
                // Fallback: try to find by text directly with scrolling
                console.log(`⚠️  Primary locator failed, trying fallback for: ${category}`);
                const fallbackElement = $(`//android.widget.TextView[@text="${category}"]`);
                
                let isVisible = false;
                try {
                    isVisible = await fallbackElement.isDisplayed();
                } catch (e) {
                    // Not visible, scroll to find it
                }
                
                if (!isVisible) {
                    isVisible = await this.scrollToFindElement(fallbackElement);
                }
                
                if (isVisible) {
                    await fallbackElement.click();
                    console.log(`✅ Selected category (fallback): ${category}`);
                } else {
                    // Last resort: use Food & Beverage as default
                    console.log(`⚠️  Category "${category}" not found, using Food & Beverage as default`);
                    await this.foodAndBeverageText.click();
                }
            }
            
            await browser.pause(500);
            
        } catch (error) {
            console.log(`⚠️  Failed to select category "${category}": ${error}`);
            // Fallback to Food & Beverage
            try {
                await this.foodAndBeverageText.click();
            } catch (e) {
                console.log('Failed to select default category');
            }
        }
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

