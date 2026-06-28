import { $ } from "@wdio/globals";
import { Transaction } from "../../utils/csv";
import Gestures from "../helpers/Gestures";

/**
 * Time Selection Popup Page Object for Money Lover app
 * Contains methods to interact with the time selection popup
 */
class TimeSelectionPopup {
  get previousMonthButton() {
    return $("id=android:id/prev");
  }

  get nextMonthButton() {
    return $("id=android:id/next");
  }

  convertMonthToText(month: number): string {
    const monthText = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthText[month - 1];
  }

  async checkIsCurrentMonth(month: string, year: string): Promise<boolean> {
    let monthText = this.convertMonthToText(parseInt(month));
    let dayText = $$(
      `//android.view.View[contains(@content-desc, "15 ${monthText} ${year}")]`,
    );
    console.log(
      `Checking if ${monthText} ${year} is current month: ${(await dayText).length}`,
    );
    return (await dayText).length > 0;
  }

  async getCurrentMonth(year: string): Promise<number> {
    for (let i = 1; i <= 12; i++) {
      let monthText = this.convertMonthToText(i);
      let dayText = $$(
        `//android.view.View[contains(@content-desc, "15 ${monthText} ${year}")]`,
      );
      console.log(
        `Checking if ${monthText} ${year} is current month: ${(await dayText).length}`,
      );
      if ((await dayText).length > 0) {
        return i;
      }
    }
    return 0;
  }

  async moveToMonth(month: string, year: string): Promise<void> {
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

  dayInput(day: string) {
    let dayText = day;
    // if day is less than 9, remove the 0 from the beginning if it exists
    if (dayText.length > 1 && dayText[0] === "0") {
      dayText = dayText.slice(1);
    }
    return $(`//android.view.View[contains(@text, "${dayText}")]`);
  }

  get daySelectTimeButton() {
    return $("id=android:id/button1");
  }
}

export default new TimeSelectionPopup();
