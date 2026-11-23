import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    retries: process.env.CI ? 1 : 0,
    use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
        { name: 'phone', use: { ...devices['Pixel 7'] } },
        { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1180 } } },
    ],
    webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4173', port: 4173, reuseExistingServer: !process.env.CI },
});
