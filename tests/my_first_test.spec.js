const { test, expect } = require('@playwright/test');

test('Google Title Check', async ({ page }) => {
  // Website pe jao
  await page.goto('https://www.google.com');

  // Check karo ki title sahi hai ya nahi
  await expect(page).toHaveTitle(/Google/);
  
  console.log("Test successfully pass ho gaya!");
});