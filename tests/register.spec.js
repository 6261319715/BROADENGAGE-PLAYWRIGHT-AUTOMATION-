import { test, expect } from '@playwright/test';

test.describe('Registration/Sign Up Page Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Replace with your actual local or dev URL
    await page.goto('https://demo.broadengage.com/auth/register'); 
  });

  test('should display validation errors for empty fields on submit', async ({ page }) => {
    await page.click('button:has-text("Sign Up")');

    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Organisation name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Phone number is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page.getByText('You must accept the terms and conditions')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    const emailInput = page.getByLabel('Email ID');
    await emailInput.fill('invalid-email');
    await emailInput.blur(); // Trigger validation
    await expect(page.getByText('Please enter a valid email')).toBeVisible();
  });

  test('should validate password complexity requirements', async ({ page }) => {
    const passwordInput = page.getByLabel('Password');
    
    // Test simple password
    await passwordInput.fill('12345');
    await passwordInput.blur();
    await expect(page.getByText('Password must contain at least one number, one letter, one special character, and be at least 8 characters long')).toBeVisible();
    
    // Test valid password
    await passwordInput.fill('Test@1234');
    await passwordInput.blur();
    await expect(page.getByText('Password must contain at least one number, one letter, one special character, and be at least 8 characters long')).not.toBeVisible();
  });

  test('should validate phone number length and type', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone');
    
    // Test letters in phone
    await phoneInput.fill('abcdefghij');
    await phoneInput.blur();
    await expect(page.getByText('Phone number must contain only digits')).toBeVisible();

    // Test short number
    await phoneInput.fill('12345');
    await phoneInput.blur();
    await expect(page.getByText('Number must be exactly 10 digits')).toBeVisible();
  });

  test('should toggle password visibility when eye icon is clicked', async ({ page }) => {
    const passwordInput = page.getByLabel('Password');
    await passwordInput.fill('Secret123!');
    
    // Initially should be type="password"
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click the toggle button (IconButton in your MUI code)
    await page.locator('button >> .lucide-eye, button >> .MuiSvgIcon-root').first().click();
    
    // Should change to type="text"
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should prevent submission if CAPTCHA is not completed', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Shivam Jatav');
    await page.getByLabel('Organisation Name').fill('Bansal Institute');
    await page.getByLabel('Email ID').fill('shivam@example.com');
    await page.getByLabel('Phone').fill('9876543210');
    await page.getByLabel('Password').fill('Secure@123');
    await page.getByRole('checkbox').check();

    await page.click('button:has-text("Sign Up")');

    // Check for the custom captcha error message in your code
    await expect(page.getByText('Please complete the captcha to continue.')).toBeVisible();
  });

  test('should navigate to login page when Login link is clicked', async ({ page }) => {
    await page.getByText('Login', { exact: true }).click();
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

});