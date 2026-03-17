import { test, expect } from '@playwright/test';

const LOGIN_URL = 'https://demo.broadengage.com/';
const VALID_EMAIL = 'shivam123jatav@gmail.com';
const VALID_PASSWORD = 'Shivam@123';

test.describe('Login Page - UI & Navigation', () => {
	test('LI_UI_01 - Login page loads with all elements', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Email ID' })).toBeVisible();
		await expect(page.getByPlaceholder('Password')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
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
		const passwordInput = page.getByPlaceholder('Password');
		await passwordInput.fill('secret123');
		await expect(passwordInput).toHaveAttribute('type', 'password');
		await page.getByRole('button', { name: /show password|visibility/i }).click();
		await expect(passwordInput).toHaveAttribute('type', 'text');
	});
});

test.describe('Login Page - Validation', () => {
	test('LI_04 - Mandatory fields empty shows validation', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page.getByText('Email is required')).toBeVisible();
		await expect(page.getByText('Password is required')).toBeVisible();
	});

	test('LI_05 - Email field empty shows validation', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await page.getByPlaceholder('Password').fill(VALID_PASSWORD);
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page.getByText('Email is required')).toBeVisible();
	});

	test('LI_06 - Password field empty shows validation', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await page.getByRole('textbox', { name: 'Email ID' }).fill(VALID_EMAIL);
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page.getByText('Password is required')).toBeVisible();
	});

	test('LI_07 - Invalid email format shows validation', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await page.getByRole('textbox', { name: 'Email ID' }).fill('invalid-email');
		await page.getByPlaceholder('Password').fill(VALID_PASSWORD);
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page.getByText(/valid email|enter a valid email/i)).toBeVisible();
	});

	test('LI_PW_01 - Password less than 6 characters shows validation', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await page.getByRole('textbox', { name: 'Email ID' }).fill(VALID_EMAIL);
		await page.getByPlaceholder('Password').fill('12345');
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page.getByText(/at least 6 characters|Password must be/i)).toBeVisible();
	});

	test('Validation on blur - email', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await page.getByRole('textbox', { name: 'Email ID' }).focus();
		await page.getByPlaceholder('Password').click();
		await expect(page.getByText('Email is required')).toBeVisible();
	});

	test('Validation on blur - password', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await page.getByPlaceholder('Password').focus();
		await page.getByRole('textbox', { name: 'Email ID' }).click();
		await expect(page.getByText('Password is required')).toBeVisible();
	});
});

test.describe('Login Page - Submit & API', () => {
	test('LI_01 - Valid login redirects to journeys/active', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await page.getByRole('textbox', { name: 'Email ID' }).fill(VALID_EMAIL);
		await page.getByPlaceholder('Password').fill(VALID_PASSWORD);
		await page.getByRole('button', { name: 'Log In' }).click();
		await expect(page).toHaveURL(/journeys\/active/, { timeout: 15000 });
	});

	test('LI_02 - Invalid password shows error message', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await page.getByRole('textbox', { name: 'Email ID' }).fill(VALID_EMAIL);
		await page.getByPlaceholder('Password').fill('WrongPassword123');
		await page.getByRole('button', { name: 'Log In' }).click();
		const errorAlert = page.getByRole('alert').filter({ hasText: /invalid|credentials|failed|password/i });
		await expect(errorAlert).toBeVisible({ timeout: 10000 });
	});

	test('LI_03 - Unregistered email shows error', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await page.getByRole('textbox', { name: 'Email ID' }).fill('notregistered@example.com');
		await page.getByPlaceholder('Password').fill(VALID_PASSWORD);
		await page.getByRole('button', { name: 'Log In' }).click();
		// Exclude Next.js route announcer (empty role="alert"); target the MUI error alert
		const errorAlert = page.getByRole('alert').filter({ hasText: /.+/ });
		await expect(errorAlert).toBeVisible({ timeout: 10000 });
	});

	test('Login button shows loading state while submitting', async ({ page }) => {
		await page.goto(LOGIN_URL);
		await page.getByRole('textbox', { name: 'Email ID' }).fill(VALID_EMAIL);
		await page.getByPlaceholder('Password').fill(VALID_PASSWORD);
		const loginBtn = page.getByRole('button', { name: 'Log In' });
		await loginBtn.click();
		await expect(loginBtn).toBeDisabled();
		await expect(page).toHaveURL(/journeys\/active/, { timeout: 15000 });
	});
});

test.describe('Login Page - Pre-fill from OTP redirect', () => {
	test('Email pre-filled when coming from registration with ?email=', async ({ page }) => {
		await page.goto(`${LOGIN_URL}?email=otpuser@example.com`);
		await expect(page.getByRole('textbox', { name: 'Email ID' })).toHaveValue('otpuser@example.com');
	});
});
