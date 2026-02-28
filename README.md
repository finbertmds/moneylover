# Money Lover Android Automation

A WebdriverIO + Appium automation project for automating transaction entry in the Money Lover Android app.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Java JDK** (v8 or higher)
   - Required for Android SDK and Appium
   - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use OpenJDK

3. **Android Studio** (with Android SDK)
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK Platform Tools
   - Set `ANDROID_HOME` environment variable

4. **Appium**
   - Install via npm: `npm install -g appium`
   - Install UiAutomator2 driver: `appium driver install uiautomator2`

5. **Android Emulator** or Physical Device
   - Create an Android emulator via Android Studio
   - Or connect a physical Android device via USB with USB debugging enabled

## 🚀 Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd moneylover-automation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify Appium installation**
   ```bash
   appium --version
   ```

4. **Verify Android SDK setup**
   ```bash
   # Check if adb is available
   adb version
   
   # List connected devices/emulators
   adb devices
   ```

## 📱 Setup Android Emulator

1. **Start Android Studio**
2. **Open AVD Manager** (Tools → Device Manager)
3. **Create a new Virtual Device** (if you don't have one)
   - Choose a device (e.g., Pixel 5)
   - Select a system image (API 30 or higher recommended)
   - Finish the setup
4. **Start the emulator**
   - Click the play button next to your emulator
   - Wait for it to fully boot

5. **Verify emulator is running**
   ```bash
   adb devices
   # Should show: emulator-5554    device
   ```

## 📦 Install Money Lover App

1. **Download Money Lover APK** or install from Google Play Store on the emulator
2. **Or install via ADB:**
   ```bash
   adb install path/to/moneylover.apk
   ```

3. **Verify app is installed**
   ```bash
   adb shell pm list packages | grep bookmark.money
   # Should show: com.bookmark.money
   ```

## ⚙️ Configuration

### Update `wdio.conf.ts` if needed:

- **Device Name**: Change `deviceName: 'emulator-5554'` if using a different device
- **App Package**: Verify `appPackage: 'com.bookmark.money'` matches your app
- **App Activity**: Update `appActivity` if needed (current: `.ui.splash.SplashActivity`)

### Update CSV file:

Edit `data/transactions.csv` with your transaction data:

```csv
date,amount,type,note
2025-01-15,50000,income,Salary January
2025-01-16,1500,expense,Grocery shopping
```

**CSV Format:**
- `date`: Date in YYYY-MM-DD format (will be converted to DD/MM/YYYY)
- `amount`: Transaction amount as number
- `type`: Either "income" or "expense" (case-insensitive)
- `note`: Transaction description/note

## 🏃 Running Tests

### 1. Start Appium Server

Open a terminal and run:

```bash
appium
```

You should see:
```
[Appium] Welcome to Appium v2.x.x
[Appium] Appium REST http interface listener started on 0.0.0.0:4723
```

**Keep this terminal open** while running tests.

### 2. Start Android Emulator

Make sure your Android emulator is running:
```bash
adb devices
```

### 3. Run Tests

In a **new terminal**, run:

```bash
npm test
```

Or:

```bash
npm run wdio
```

### 4. Run Specific Test

```bash
npm run test:spec -- test/specs/transactions.spec.ts
```

## 📁 Project Structure

```
.
├── data/
│   └── transactions.csv          # CSV file with transaction data
├── test/
│   ├── pages/
│   │   ├── MainPage.ts          # Main page object
│   │   └── AddTransactionPage.ts # Add transaction page object
│   └── specs/
│       └── transactions.spec.ts # Test specifications
├── utils/
│   └── csv.ts                    # CSV parsing utility
├── wdio.conf.ts                  # WebdriverIO configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Project dependencies
└── README.md                     # This file
```

## 🔧 Troubleshooting

### Issue: "Appium not found"
```bash
npm install -g appium
appium driver install uiautomator2
```

### Issue: "No devices found"
```bash
# Check if emulator is running
adb devices

# If no devices, start emulator from Android Studio
# Or connect physical device with USB debugging enabled
```

### Issue: "App not installed"
```bash
# Install app manually on emulator from Play Store
# Or install APK:
adb install path/to/app.apk
```

### Issue: "Element not found"
- The app UI might have changed
- Update locators in Page Object files (`test/pages/`)
- Use Appium Inspector to find correct element locators:
  ```bash
  appium inspector
  ```

### Issue: "Tests timeout"
- Increase timeout in `wdio.conf.ts`:
  ```typescript
  mochaOpts: {
      timeout: 600000  // 10 minutes
  }
  ```

### Issue: "Date picker not working"
- Date setting might vary by app version
- Check if app uses a different date picker format
- Update `setDate()` method in `AddTransactionPage.ts`

## 📝 Customization

### Adding More Fields

To add more transaction fields (e.g., category, wallet):

1. Update CSV format:
   ```csv
   date,amount,type,note,category,wallet
   ```

2. Update `Transaction` interface in `utils/csv.ts`

3. Add methods in `AddTransactionPage.ts` to handle new fields

4. Update test spec to use new fields

### Changing Locators

If app UI changes, update locators in Page Object files:

- `test/pages/MainPage.ts` - Main screen elements
- `test/pages/AddTransactionPage.ts` - Add transaction screen elements

Use Appium Inspector to find correct locators:
```bash
appium inspector
```

## 🐛 Debugging

### Enable Verbose Logging

In `wdio.conf.ts`, change:
```typescript
logLevel: 'debug',  // or 'verbose'
```

### Take Screenshots on Failure

Add to `wdio.conf.ts`:
```typescript
afterTest: async function(test, context, { error, result, duration, passed }) {
    if (!passed) {
        await browser.saveScreenshot(`./screenshots/${test.title}.png`);
    }
}
```

### Use Appium Inspector

1. Start Appium: `appium`
2. Start Inspector: `appium inspector`
3. Connect to your session to inspect elements

## 📚 Resources

- [WebdriverIO Documentation](https://webdriver.io/)
- [Appium Documentation](https://appium.io/docs/en/latest/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📄 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

