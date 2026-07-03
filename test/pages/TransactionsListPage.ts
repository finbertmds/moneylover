import { $ } from "@wdio/globals";
import Gestures from "../helpers/Gestures";

/**
 * Transaction List Page Object for Money Lover app
 * Contains methods to interact with the transaction list screen
 */
export class TransactionListPage {
  private get transactionsItem() {
    return $("id=com.bookmark.money:id/item");
  }

  private get editTransactionButton() {
    return $("~Edit");
  }

  private get excludeReportCheckbox() {
    return $("id=com.bookmark.money:id/exclude_report");
  }

  private get saveButton() {
    return $("id=com.bookmark.money:id/btn_save");
  }

  /**
   * Scroll down to find category element
   * @param categoryElement - The element to find
   * @param maxScrolls - Maximum number of scroll attempts (default: 10)
   * @returns true if element found, false otherwise
   */
  private async scrollToFindElement(
    element: any,
    maxScrolls: number = 15,
  ): Promise<boolean> {
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

  async switchExcludeReportTransaction(): Promise<void> {
    while (true) {
      let item = await this.transactionsItem;
      if (await item.isDisplayed()) {
        console.log("Transaction found.");
        await item.click();
        await browser.pause(500);
        await this.editTransactionButton.click();
        await browser.pause(500);
        await Gestures.swipeUp(0.5);
        await this.excludeReportCheckbox.click();
        await this.saveButton.click();
        await browser.pause(500);
        await this.navigateBack();
      } else {
        console.log("No transactions found.");
        return;
      }
    }
  }

  /**
   * Navigate back to main page
   */
  async navigateBack(): Promise<void> {
    try {
      await browser.back();
      await browser.pause(500);
    } catch (error) {
      console.log("Navigation back failed, continuing...");
    }
  }
}
