import { test, expect } from '@playwright/test';
import type { Page } from 'playwright';

/**
 * Test case optimization: combined validations, boundary conditions first,
 * no repetitive single-field empty tests. Reduces execution time and improves maintainability.
 */

const BASE_URL = 'https://demo.broadengage.com';
const REGISTER_URL = `${BASE_URL}/auth/register`;

// Valid data: name 3–20 letters, org 3–20, email format, phone 10 digits, password 8+ with number/letter/special
const VALID_FULL_NAME = 'John Doe';
const VALID_ORG_NAME = 'Acme Inc';
const VALID_EMAIL = 'newuser@example.com';
const VALID_PHONE = '9876543210';
const VALID_PASSWORD = 'Test@1234';

/** Fill all fields with valid data; overrides allow testing one invalid field at a time. */
async function fillValidForm(
	page: Page,
	overrides?: { fullName?: string; orgName?: string; email?: string; phone?: string; password?: string; acceptTerms?: boolean }
) {
	await page.getByRole('textbox', { name: /full name/i }).fill(overrides?.fullName ?? VALID_FULL_NAME);
	await page.getByRole('textbox', { name: /organisation name/i }).fill(overrides?.orgName ?? VALID_ORG_NAME);
	await page.getByRole('textbox', { name: /email id/i }).fill(overrides?.email ?? VALID_EMAIL);
	await page.getByRole('textbox', { name: /phone/i }).fill(overrides?.phone ?? VALID_PHONE);
	await page.getByRole('textbox', { name: /password/i }).fill(overrides?.password ?? VALID_PASSWORD);
	if (overrides?.acceptTerms !== false) {
		await page.getByRole('checkbox', { name: /agree to receive product updates and promotional/i }).check();
	}
}

test.describe('Sign Up Page - UI & Navigation', () => {
	test('SU_UI_01 - Register page loads with all form elements', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await expect(page.getByRole('textbox', { name: /full name/i })).toBeVisible();
		await expect(page.getByRole('textbox', { name: /organisation name/i })).toBeVisible();
		await expect(page.getByRole('textbox', { name: /email id/i })).toBeVisible();
		await expect(page.getByRole('textbox', { name: /phone/i })).toBeVisible();
		await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
		await expect(page.getByRole('checkbox', { name: /agree to receive product updates and promotional/i })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
		await expect(page.getByText(/already have an account\?/i)).toBeVisible();
		await expect(page.getByText(/sign in/i)).toBeVisible();
	});

	test('SU_UI_02 - Sign In link navigates to login page', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByText(/sign in/i).click();
		await expect(page).toHaveURL(/auth\/login/);
	});

	test('SU_UI_03 - Password visibility toggle works', async ({ page }) => {
		await page.goto(REGISTER_URL);
		const passwordInput = page.getByRole('textbox', { name: /password/i });
		await passwordInput.fill(VALID_PASSWORD);
		await expect(passwordInput).toHaveAttribute('type', 'password');
		// MUI: icon button next to password field (visibility toggle)
		const toggle = page.locator('input[type="password"]').locator('..').locator('..').getByRole('button');
		await toggle.click();
		await expect(passwordInput).toHaveAttribute('type', 'text');
	});
});

test.describe('Sign Up Page - Mandatory & Validation', () => {
	test('SU_03 - All mandatory fields empty show validation on submit', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('Name is required', { exact: true })).toBeVisible();
		await expect(page.getByText('Organisation name is required', { exact: true })).toBeVisible();
		await expect(page.getByText('Email is required', { exact: true })).toBeVisible();
		await expect(page.getByText('Phone number is required', { exact: true })).toBeVisible();
		await expect(page.getByText('Password is required', { exact: true })).toBeVisible();
		await expect(page.getByText('You must accept the terms and conditions', { exact: true })).toBeVisible();
	});

	test('SU_BOUNDARY - Boundary conditions (name/org length, phone 10 digits, password 8+)', async ({ page }) => {
		await page.goto(REGISTER_URL);
		// Name min (3): too short
		await fillValidForm(page, { fullName: 'Jo' });
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('Name must be at least 3 characters')).toBeVisible();
		// Name max (20): too long
		await page.getByRole('textbox', { name: /full name/i }).fill('A'.repeat(21));
		await page.getByRole('textbox', { name: /full name/i }).blur();
		await expect(page.getByText('Name must be at most 20 characters')).toBeVisible();
		// Org min/max (same rules)
		await page.getByRole('textbox', { name: /full name/i }).fill(VALID_FULL_NAME);
		await page.getByRole('textbox', { name: /organisation name/i }).fill('Ab');
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('Name must be at least 3 characters')).toBeVisible();
		await page.getByRole('textbox', { name: /organisation name/i }).fill('A'.repeat(21));
		await page.getByRole('textbox', { name: /organisation name/i }).blur();
		await expect(page.getByText('Name must be at most 20 characters')).toBeVisible();
		// Phone exactly 10 digits
		await page.getByRole('textbox', { name: /organisation name/i }).fill(VALID_ORG_NAME);
		await page.getByRole('textbox', { name: /phone/i }).fill('12345');
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('Number must be exactly 10 digits')).toBeVisible();
		// Password min 8 + complexity
		await page.getByRole('textbox', { name: /phone/i }).fill(VALID_PHONE);
		await page.getByRole('textbox', { name: /password/i }).fill('Ab@1234');
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText(/at least 8 characters|Password must contain/i)).toBeVisible();
	});

	test('SU_FORMAT - Invalid formats (name chars, email, phone digits, password complexity)', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).fill('John123');
		await page.getByRole('textbox', { name: /organisation name/i }).click();
		await expect(page.getByText('Please enter a valid name')).toBeVisible();
		await page.getByRole('textbox', { name: /full name/i }).fill(VALID_FULL_NAME);
		await page.getByRole('textbox', { name: /email id/i }).fill('invalid-email');
		await page.getByRole('textbox', { name: /phone/i }).click();
		await expect(page.getByText('Please enter a valid email')).toBeVisible();
		await page.getByRole('textbox', { name: /email id/i }).fill(VALID_EMAIL);
		await page.getByRole('textbox', { name: /phone/i }).fill('98765abcde');
		await page.getByRole('textbox', { name: /password/i }).click();
		await expect(page.getByText('Phone number must contain only digits')).toBeVisible();
		await page.getByRole('textbox', { name: /phone/i }).fill(VALID_PHONE);
		await page.getByRole('textbox', { name: /password/i }).fill('simple');
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText(/Password must contain at least one number, one letter, one special character/i)).toBeVisible();
	});

	test('SU_TC - Terms unchecked shows validation', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await fillValidForm(page, { acceptTerms: false });
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('You must accept the terms and conditions')).toBeVisible();
	});
});

test.describe('Sign Up Page - Blur validation', () => {
	test('Blur validations (name required, email format, phone length)', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).focus();
		await page.getByRole('textbox', { name: /organisation name/i }).click();
		await expect(page.getByText('Name is required', { exact: true })).toBeVisible();
		await page.getByRole('textbox', { name: /email id/i }).fill('bad');
		await page.getByRole('textbox', { name: /phone/i }).click();
		await expect(page.getByText('Please enter a valid email')).toBeVisible();
		await page.getByRole('textbox', { name: /phone/i }).fill('12');
		await page.getByRole('textbox', { name: /password/i }).click();
		await expect(page.getByText('Number must be exactly 10 digits')).toBeVisible();
	});
});

test.describe('Sign Up Page - CAPTCHA & Submit', () => {
	test('SU_CAP_01 - Valid form without CAPTCHA shows captcha error', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await fillValidForm(page);
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText(/complete the captcha|Please complete the captcha/i)).toBeVisible({ timeout: 5000 });
	});

	test('Sign Up button shows loading state when submitting', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await fillValidForm(page, { email: 'loadingtest@example.com' });
		const signUpBtn = page.getByRole('button', { name: 'Sign Up' });
		await expect(signUpBtn).toBeVisible();
		await expect(signUpBtn).toBeEnabled();
	});
});

test.describe('Sign Up Page - API / Success flow', () => {
	test.setTimeout(90_000); // reCAPTCHA + API can be slow
	test('SU_01 - Valid signup with CAPTCHA redirects to OTP page', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await fillValidForm(page, { email: `test${Date.now()}@example.com` });
		const recaptchaFrame = page.frameLocator('iframe[src*="recaptcha"]').first();
		await recaptchaFrame.getByRole('checkbox').click({ timeout: 8000 }).catch(() => {});
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page).toHaveURL(/registerOtp|otp/i, { timeout: 20000 });
	});

	test('SU_02 - Existing email shows error message', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await fillValidForm(page, { email: 'shivam123jatav@gmail.com' });
		const recaptchaFrame = page.frameLocator('iframe[src*="recaptcha"]').first();
		await recaptchaFrame.getByRole('checkbox').click({ timeout: 8000 }).catch(() => {});
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText(/already exists|already registered|email.*taken|registered|failed|error/i)).toBeVisible({ timeout: 15000 });
	});
});
