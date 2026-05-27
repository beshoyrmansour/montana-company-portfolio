import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    // Add 'webkit' + 'firefox' once CI cycle has budget
  ],
  // No webServer config. Run two terminals:
  //
  //   Terminal 1:  npm run build && npm start
  //   Terminal 2:  npm run test:e2e
  //
  // CI handles this via .github/workflows/ci.yml — build + start + test in sequence.
});
