import { test, expect } from '@playwright/test';

/**
 * Login page tests aligned with LoginForm source:
 * - Email + Password fields; validation (required, email format, password min 6 chars)
 * - POST /api/v1/login → success: setToken + redirect /journeys/active; error: snackbar
 * - Links: Forgot Password → /auth/resetpassword, Sign Up → /auth/register
 * - Pre-fill email from ?email= (post-OTP redirect)
 */

const LOGIN_URL = 'https://demo.broadengage.com/';
const VALID_EMAIL = 'shivam123jatav@gmail.com';
const VALID_PASSWORD = 'Shivam@123';

// Locators aligned with LoginForm source (MUI: Email ID, Password, Log In).
const emailInput = (page: import('@playwright/test').Page) =>
	page.getByRole('textbox', { name: /email id/i });
const passwordInput = (page: import('@playwright/test').Page) =>
	page.getByRole('textbox', { name: /password/i }).or(page.locator('input[type="password"]'));
const logInButton = (page: import('@playwright/test').Page) =>
	page.getByRole('button', { name: /log in/i });

test.describe('Login Page - UI & Navigation', () => {
	test('LI_UI_01 - Login page loads with all elements', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
		await expect(emailInput(page)).toBeVisible();
		await expect(passwordInput(page)).toBeVisible();
		await expect(logInButton(page)).toBeVisible();
		await expect(page.getByText('Forgot Password?')).toBeVisible();
		await expect(page.getByText('Sign Up').first()).toBeVisible();
	});

	test('LI_UI_02 - Forgot Password link navigates to reset password', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await page.getByText('Forgot Password?').click();
		await expect(page).toHaveURL(/resetpassword/);
	});

	test('LI_UI_03 - Sign Up link navigates to register', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await page.getByText('Sign Up').first().click();
		await expect(page).toHaveURL(/register/);
	});

	test('LI_UI_04 - Password visibility toggle works', async ({ page }) => {
		await page.goto(LOGIN_URL);
		const password = passwordInput(page);
		await password.fill('secret123');
		await expect(password).toHaveAttribute('type', 'password');
		const toggle = page.locator('input[type="password"]').locator('..').locator('..').getByRole('button');
		await toggle.click();
		await expect(password).toHaveAttribute('type', 'text');
	});
});

test.describe('Login Page - Validation', () => {
	test('LI_04 - Mandatory fields empty shows validation', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await logInButton(page).click();
		await expect(page.getByText('Email is required')).toBeVisible();
		await expect(page.getByText('Password is required')).toBeVisible();
	});

	test('LI_05 - Email field empty shows validation', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await passwordInput(page).fill(VALID_PASSWORD);
		await logInButton(page).click();
		await expect(page.getByText('Email is required')).toBeVisible();
	});

	test('LI_06 - Password field empty shows validation', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await emailInput(page).fill(VALID_EMAIL);
		await logInButton(page).click();
		await expect(page.getByText('Password is required')).toBeVisible();
	});

	test('LI_07 - Invalid email format shows validation', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await emailInput(page).fill('invalid-email');
		await passwordInput(page).fill(VALID_PASSWORD);
		await logInButton(page).click();
		await expect(page.getByText(/Please enter a valid email/i)).toBeVisible();
	});

	test('LI_PW_01 - Password less than 6 characters shows validation', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await emailInput(page).fill(VALID_EMAIL);
		await passwordInput(page).fill('12345');
		await logInButton(page).click();
		await expect(page.getByText(/at least 6 characters|Password must be/i)).toBeVisible();
	});

	test('Validation on blur - email', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await emailInput(page).focus();
		await passwordInput(page).click();
		await expect(page.getByText('Email is required')).toBeVisible();
	});

	test('Validation on blur - password', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await passwordInput(page).focus();
		await emailInput(page).click();
		await expect(page.getByText('Password is required')).toBeVisible();
	});
});

test.describe('Login Page - Submit & API', () => {
	test('LI_01 - Valid login redirects to journeys/active', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await emailInput(page).fill(VALID_EMAIL);
		await passwordInput(page).fill(VALID_PASSWORD);
		await logInButton(page).click();
		await expect(page).toHaveURL(/journeys\/active/, { timeout: 15000 });
	});

	test('LI_02 - Invalid password shows error message', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await emailInput(page).fill(VALID_EMAIL);
		await passwordInput(page).fill('WrongPassword123');
		await logInButton(page).click();
		await expect(page.getByRole('alert')).toContainText(/invalid|credentials|failed/i, { timeout: 10000 });
	});

	test('LI_03 - Unregistered email shows error', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await emailInput(page).fill('notregistered@example.com');
		await passwordInput(page).fill(VALID_PASSWORD);
		await logInButton(page).click();
		await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
	});

	test('Login button shows loading state while submitting', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await emailInput(page).fill(VALID_EMAIL);
		await passwordInput(page).fill(VALID_PASSWORD);
		const btn = logInButton(page);
		await btn.click();
		await expect(btn).toBeDisabled();
		await expect(page).toHaveURL(/journeys\/active/, { timeout: 15000 });
	});
});

test.describe('Login Page - Pre-fill from OTP redirect', () => {
	test('Email pre-filled when coming from registration with ?email=', async ({ page }) => {
		await page.goto(`${LOGIN_URL}?email=otpuser@example.com`);
		await expect(emailInput(page)).toHaveValue('otpuser@example.com');
	});
});
