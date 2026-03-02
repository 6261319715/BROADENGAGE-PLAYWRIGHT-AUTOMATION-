import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://demo.broadengage.com/');
  await page.getByRole('textbox', { name: 'Email ID' }).click();
  await page.getByRole('textbox', { name: 'Email ID' }).fill('shivam123jatav@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Shivam@123');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.getByRole('button', { name: 'User', exact: true }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
});