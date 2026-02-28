import type { Options } from '@wdio/types';

export const config = {
    // WebdriverIO will automatically find the Appium service
    runner: 'local',
    
    // Test specs
    specs: [
        './test/specs/**/*.ts'
    ],
    
    // Patterns to exclude
    exclude: [
        // 'path/to/excluded/files'
    ],
    
    // Maximum number of parallel test instances
    maxInstances: 1,
    
    // Capabilities for Android Emulator
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:automationName': 'UiAutomator2',
        'appium:noReset': false,
        'appium:fullReset': false,
        'appium:newCommandTimeout': 300,
        'appium:autoGrantPermissions': true
    }],
    
    // Test runner services
    services: [
        ['appium', {
            args: {
                // Appium server arguments
                relaxedSecurity: true,
                allowInsecure: 'adb_shell',
            },
            command: 'appium',
            logPath: './logs'
        }]
    ],
    
    // Test framework
    framework: 'mocha',
    
    // Mocha options
    mochaOpts: {
        ui: 'bdd',
        timeout: 120 * 60 * 1000, // 2 hour timeout for each test
    },
    
    // Reporters
    reporters: [
        'spec',
    ],
    
    // Hooks
    beforeSession: function (config: any, capabilities: any, specs: string[]) {
        // Setup before session starts
    },
    
    before: function (capabilities: any, specs: string[]) {
        // Setup before tests run
    },
    
    after: function (result: any, capabilities: any, specs: string[]) {
        // Cleanup after tests
    },
    
    onComplete: function(exitCode: number, config: any, capabilities: any, results: any) {
        // Called when all tests are done
    },
    
    // Logging
    logLevel: 'info',
    
    // Bail after first test failure
    bail: 0,
    
    // Base URL (not used for mobile)
    baseUrl: '',
    
    // Wait timeout
    waitforTimeout: 10000,
    
    // Connection retry timeout
    connectionRetryTimeout: 120000,
    
    // Connection retry count
    connectionRetryCount: 3
} as Options.Testrunner;

