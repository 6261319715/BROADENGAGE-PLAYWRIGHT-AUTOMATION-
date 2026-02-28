// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  workers: process.env.CI ? 1 : undefined,

  /* Reporter settings */
  reporter: [['html', { open: 'always' }]], // Isse test khatam hote hi report khud khul jayegi

  use: {
    /* 1. Yahan badlav kiya gaya hai: 'on' karne se pass ho ya fail, hamesha trace banega */
    trace: 'on', 
    
    /* Screenshot aur Video bhi add kar sakte hain (optional) */
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