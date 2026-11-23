import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './tests/e2e',
    use: { baseURL: 'http://127.0.0.1:4185', launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } },
    projects: [{ name: 'web', use: { ...devices['Desktop Chrome'] } }],
    webServer: { command: 'node tests/serve-web.cjs', port: 4185, reuseExistingServer: false },
});
