const { test, expect } = require('@playwright/test');

test('Amazon Product Search Test', async ({ page }) => {
  // 1. Amazon pe jao
  await page.goto('https://www.amazon.in');

  // 2. Search box mein "iPhone 15" type karo
  // Yahan hum 'id' use kar rahe hain (inspect karke milti hai)
  await page.fill('#twotabsearchtextbox', 'iPhone 15');

  // 3. Search button pe click karo
  await page.click('#nav-search-submit-button');

  // 4. Check karo ki results page pe "iPhone 15" likha aa raha hai
  const searchResult = page.locator('.a-color-state.a-text-bold');
  await expect(searchResult).toContainText('iPhone 15');

  console.log("Amazon search test successfully pass ho gaya!");
});