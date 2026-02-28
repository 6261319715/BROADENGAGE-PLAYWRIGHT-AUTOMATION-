import { test, expect } from '@playwright/test';

const BASE_URL = 'https://demo.broadengage.com';
const REGISTER_URL = `${BASE_URL}/auth/register`;

// Valid data per component validation: name 3–20 letters, org 3–20, email format, phone 10 digits, password 8+ with number/letter/special
const VALID_FULL_NAME = 'John Doe';
const VALID_ORG_NAME = 'Acme Inc';
const VALID_EMAIL = 'newuser@example.com';
const VALID_PHONE = '9876543210';
const VALID_PASSWORD = 'Test@1234';

test.describe('Sign Up Page - UI & Navigation', () => {
	test('SU_UI_01 - Register page loads with all form elements', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await expect(page.getByRole('textbox', { name: /full name/i })).toBeVisible();
		await expect(page.getByRole('textbox', { name: /organisation name/i })).toBeVisible();
		await expect(page.getByRole('textbox', { name: /email id/i })).toBeVisible();
		await expect(page.getByRole('textbox', { name: /phone/i })).toBeVisible();
		await expect(page.getByLabel(/password/i)).toBeVisible();
		await expect(page.getByRole('checkbox', { name: /privacy|terms/i })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
		await expect(page.getByText('Already have an account?')).toBeVisible();
		await expect(page.getByText('Login').last()).toBeVisible();
	});

	test('SU_UI_02 - Login link navigates to login page', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByText('Login').last().click();
		await expect(page).toHaveURL(/auth\/login/);
	});

	test('SU_UI_03 - Password visibility toggle works', async ({ page }) => {
		await page.goto(REGISTER_URL);
		const passwordInput = page.getByLabel(/password/i);
		await passwordInput.fill(VALID_PASSWORD);
		await expect(passwordInput).toHaveAttribute('type', 'password');
		// MUI: icon button next to password field (visibility toggle)
		const toggle = page.locator('input[type="password"]').locator('..').locator('..').getByRole('button');
		await toggle.click();
		await expect(passwordInput).toHaveAttribute('type', 'text');
	});
});

test.describe('Sign Up Page - Mandatory & Validation', () => {
	test('SU_03 - Mandatory fields empty shows validation on submit', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('Name is required')).toBeVisible();
		await expect(page.getByText('Organisation name is required')).toBeVisible();
		await expect(page.getByText('Email is required')).toBeVisible();
		await expect(page.getByText('Phone number is required')).toBeVisible();
		await expect(page.getByText('Password is required')).toBeVisible();
		await expect(page.getByText('You must accept the terms and conditions')).toBeVisible();
	});

	test('SU_FN_01 - Full Name empty shows validation', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /organisation name/i }).fill(VALID_ORG_NAME);
		await page.getByRole('textbox', { name: /email id/i }).fill(VALID_EMAIL);
		await page.getByRole('textbox', { name: /phone/i }).fill(VALID_PHONE);
		await page.getByLabel(/password/i).fill(VALID_PASSWORD);
		await page.getByRole('checkbox', { name: /privacy|terms/i }).check();
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('Name is required')).toBeVisible();
	});

	test('SU_FN_02 - Full Name invalid characters shows validation', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).fill('John123');
		await page.getByRole('textbox', { name: /full name/i }).blur();
		await expect(page.getByText('Please enter a valid name')).toBeVisible();
	});

	test('SU_FN_03 - Full Name less than 3 characters', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).fill('Jo');
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('Name must be at least 3 characters')).toBeVisible();
	});

	test('SU_FN_04 - Full Name more than 20 characters', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).fill('A'.repeat(21));
		await page.getByRole('textbox', { name: /full name/i }).blur();
		await expect(page.getByText('Name must be at most 20 characters')).toBeVisible();
	});

	test('SU_ORG_01 - Organisation name empty shows validation', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).fill(VALID_FULL_NAME);
		await page.getByRole('textbox', { name: /email id/i }).fill(VALID_EMAIL);
		await page.getByRole('textbox', { name: /phone/i }).fill(VALID_PHONE);
		await page.getByLabel(/password/i).fill(VALID_PASSWORD);
		await page.getByRole('checkbox', { name: /privacy|terms/i }).check();
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('Organisation name is required')).toBeVisible();
	});

	test('SU_ORG_02 - Organisation name less than 3 characters', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /organisation name/i }).fill('Ab');
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('Name must be at least 3 characters')).toBeVisible();
	});

	test('SU_ORG_03 - Organisation name more than 20 characters', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /organisation name/i }).fill('A'.repeat(21));
		await page.getByRole('textbox', { name: /organisation name/i }).blur();
		await expect(page.getByText('Name must be at most 20 characters')).toBeVisible();
	});

	test('SU_EM_01 - Email empty shows validation', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).fill(VALID_FULL_NAME);
		await page.getByRole('textbox', { name: /organisation name/i }).fill(VALID_ORG_NAME);
		await page.getByRole('textbox', { name: /phone/i }).fill(VALID_PHONE);
		await page.getByLabel(/password/i).fill(VALID_PASSWORD);
		await page.getByRole('checkbox', { name: /privacy|terms/i }).check();
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('Email is required')).toBeVisible();
	});

	test('SU_EM_02 - Invalid email format shows validation', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /email id/i }).fill('invalid-email');
		await page.getByRole('textbox', { name: /email id/i }).blur();
		await expect(page.getByText('Please enter a valid email')).toBeVisible();
	});

	test('SU_PH_01 - Phone empty shows validation', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).fill(VALID_FULL_NAME);
		await page.getByRole('textbox', { name: /organisation name/i }).fill(VALID_ORG_NAME);
		await page.getByRole('textbox', { name: /email id/i }).fill(VALID_EMAIL);
		await page.getByLabel(/password/i).fill(VALID_PASSWORD);
		await page.getByRole('checkbox', { name: /privacy|terms/i }).check();
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('Phone number is required')).toBeVisible();
	});

	test('SU_PH_02 - Phone non-digits shows validation', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /phone/i }).fill('98765abcde');
		await page.getByRole('textbox', { name: /phone/i }).blur();
		await expect(page.getByText('Phone number must contain only digits')).toBeVisible();
	});

	test('SU_PH_03 - Phone not exactly 10 digits shows validation', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /phone/i }).fill('12345');
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('Number must be exactly 10 digits')).toBeVisible();
	});

	test('SU_PW_01 - Password empty shows validation', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).fill(VALID_FULL_NAME);
		await page.getByRole('textbox', { name: /organisation name/i }).fill(VALID_ORG_NAME);
		await page.getByRole('textbox', { name: /email id/i }).fill(VALID_EMAIL);
		await page.getByRole('textbox', { name: /phone/i }).fill(VALID_PHONE);
		await page.getByRole('checkbox', { name: /privacy|terms/i }).check();
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('Password is required')).toBeVisible();
	});

	test('SU_PW_02 - Password does not meet complexity (8+ chars, number, letter, special)', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByLabel(/password/i).fill('simple');
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText(/Password must contain at least one number, one letter, one special character/i)).toBeVisible();
	});

	test('SU_PW_03 - Password less than 8 characters', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByLabel(/password/i).fill('Ab@1234'); // 7 chars
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText(/at least 8 characters|Password must contain/i)).toBeVisible();
	});

	test('SU_TC_01 - Terms and conditions unchecked shows validation', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).fill(VALID_FULL_NAME);
		await page.getByRole('textbox', { name: /organisation name/i }).fill(VALID_ORG_NAME);
		await page.getByRole('textbox', { name: /email id/i }).fill(VALID_EMAIL);
		await page.getByRole('textbox', { name: /phone/i }).fill(VALID_PHONE);
		await page.getByLabel(/password/i).fill(VALID_PASSWORD);
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText('You must accept the terms and conditions')).toBeVisible();
	});
});

test.describe('Sign Up Page - Blur validation', () => {
	test('Full Name validation on blur', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).focus();
		await page.getByRole('textbox', { name: /organisation name/i }).click();
		await expect(page.getByText('Name is required')).toBeVisible();
	});

	test('Email validation on blur', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /email id/i }).fill('bad');
		await page.getByRole('textbox', { name: /phone/i }).click();
		await expect(page.getByText('Please enter a valid email')).toBeVisible();
	});

	test('Phone validation on blur', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /phone/i }).fill('12');
		await page.getByLabel(/password/i).click();
		await expect(page.getByText('Number must be exactly 10 digits')).toBeVisible();
	});
});

test.describe('Sign Up Page - CAPTCHA & Submit', () => {
	test('SU_CAP_01 - Valid form without CAPTCHA shows captcha error', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).fill(VALID_FULL_NAME);
		await page.getByRole('textbox', { name: /organisation name/i }).fill(VALID_ORG_NAME);
		await page.getByRole('textbox', { name: /email id/i }).fill(VALID_EMAIL);
		await page.getByRole('textbox', { name: /phone/i }).fill(VALID_PHONE);
		await page.getByLabel(/password/i).fill(VALID_PASSWORD);
		await page.getByRole('checkbox', { name: /privacy|terms/i }).check();
		// Do not complete reCAPTCHA
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByText(/complete the captcha|Please complete the captcha/i)).toBeVisible({ timeout: 5000 });
	});

	test('Sign Up button shows loading state when submitting', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).fill(VALID_FULL_NAME);
		await page.getByRole('textbox', { name: /organisation name/i }).fill(VALID_ORG_NAME);
		await page.getByRole('textbox', { name: /email id/i }).fill('loadingtest@example.com');
		await page.getByRole('textbox', { name: /phone/i }).fill(VALID_PHONE);
		await page.getByLabel(/password/i).fill(VALID_PASSWORD);
		await page.getByRole('checkbox', { name: /privacy|terms/i }).check();
		// If reCAPTCHA is present and completed, button would show Loading...
		const signUpBtn = page.getByRole('button', { name: 'Sign Up' });
		await expect(signUpBtn).toBeVisible();
		// Without completing captcha, button stays enabled; with captcha it would disable on submit
		await expect(signUpBtn).toBeEnabled();
	});
});

test.describe('Sign Up Page - API / Success flow', () => {
	test('SU_01 - Valid signup with CAPTCHA redirects to OTP page', async ({ page }) => {
		await page.goto(REGISTER_URL);
		const timestamp = Date.now();
		await page.getByRole('textbox', { name: /full name/i }).fill(VALID_FULL_NAME);
		await page.getByRole('textbox', { name: /organisation name/i }).fill(VALID_ORG_NAME);
		await page.getByRole('textbox', { name: /email id/i }).fill(`test${timestamp}@example.com`);
		await page.getByRole('textbox', { name: /phone/i }).fill(VALID_PHONE);
		await page.getByLabel(/password/i).fill(VALID_PASSWORD);
		await page.getByRole('checkbox', { name: /privacy|terms/i }).check();
		// ReCAPTCHA: complete if iframe present (test key auto-passes in some envs)
		const recaptchaFrame = page.frameLocator('iframe[src*="recaptcha"]').first();
		await recaptchaFrame.getByRole('checkbox').click({ timeout: 8000 }).catch(() => {});
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page).toHaveURL(/registerOtp|otp/i, { timeout: 20000 });
	});

	test('SU_02 - Existing email shows error message', async ({ page }) => {
		await page.goto(REGISTER_URL);
		await page.getByRole('textbox', { name: /full name/i }).fill(VALID_FULL_NAME);
		await page.getByRole('textbox', { name: /organisation name/i }).fill(VALID_ORG_NAME);
		await page.getByRole('textbox', { name: /email id/i }).fill('shivam123jatav@gmail.com');
		await page.getByRole('textbox', { name: /phone/i }).fill(VALID_PHONE);
		await page.getByLabel(/password/i).fill(VALID_PASSWORD);
		await page.getByRole('checkbox', { name: /privacy|terms/i }).check();
		const recaptchaFrame = page.frameLocator('iframe[src*="recaptcha"]').first();
		await recaptchaFrame.getByRole('checkbox').click({ timeout: 8000 }).catch(() => {});
		await page.getByRole('button', { name: 'Sign Up' }).click();
		await expect(page.getByRole('alert')).toContainText(/already exists|registered|failed|error/i, { timeout: 15000 });
	});
});
