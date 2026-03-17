// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  timeout: 60 * 1000, // 60s per test (E2E with network/reCAPTCHA often needs more than default 30s)
  workers: process.env.CI ? 1 : undefined,

  /* Reporter settings */
  reporter: [
    ['html', { open: 'always' }],
    ['allure-playwright'],
    ['./failed-test-summary-reporter.js', { outputFile: 'test-results/test-execution-summary.md' }],
  ],

  use: {
   
    trace: 'on', 
    
  
    screenshot: 'on',
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Baaki browsers ko aap zaroorat ke hisaab se rehne de sakte hain ya comment kar sakte hain
  ],
});
