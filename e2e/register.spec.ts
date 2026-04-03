import { expect, test } from "@playwright/test";

test.describe("M2 - Sign Up", () => {
	test("shows required validations on empty submit", async ({ page }) => {
		await page.goto("/auth/register");

		await page.getByRole("button", { name: "Sign Up" }).click();

		await expect(page.getByText("Name is required", { exact: true })).toBeVisible();
		await expect(page.getByText("Organisation name is required", { exact: true })).toBeVisible();
		await expect(page.getByText("Email is required", { exact: true })).toBeVisible();
		await expect(page.getByText("Password is required", { exact: true })).toBeVisible();
		await expect(page.getByText("Phone number is required", { exact: true })).toBeVisible();
		await expect(page.getByText("You must accept the terms and conditions", { exact: true })).toBeVisible();
	});

	test("shows validation errors for invalid data", async ({ page }) => {
		await page.goto("/auth/register");

		await page.getByLabel("Full Name").fill("1");
		await page.getByLabel("Organisation Name").fill("AB");
		await page.getByLabel("Email ID").fill("invalid-email");
		await page.getByLabel("Phone").fill("abc");
		await page.getByLabel("Password").fill("weakpass");
		await page.getByRole("button", { name: "Sign Up" }).click();

		await expect(page.getByText("Please enter a valid name")).toBeVisible();
		await expect(page.getByText("Name must be at least 3 characters")).toBeVisible();
		await expect(page.getByText("Please enter a valid email")).toBeVisible();
		await expect(page.getByText("Phone number must contain only digits")).toBeVisible();
		await expect(
			page.getByText(
				"Password must contain at least one number, one letter, one special character, and be at least 8 characters long",
			),
		).toBeVisible();
	});

	test("requires captcha for otherwise valid form", async ({ page }) => {
		await page.goto("/auth/register");

		await page.getByLabel("Full Name").fill("Test User");
		await page.getByLabel("Organisation Name").fill("Test Org");
		await page.getByLabel("Email ID").fill("test.user@example.com");
		await page.getByLabel("Phone").fill("9876543210");
		await page.getByLabel("Password").fill("Test@123");
		await page.getByRole("checkbox").check();
		await page.getByRole("button", { name: "Sign Up" }).click();

		await expect(page.getByText("Please complete the captcha to continue.")).toBeVisible();
	});

	test("navigates back to login from register page", async ({ page }) => {
		await page.goto("/auth/register");

		await page.locator("span", { hasText: "Login" }).click();

		await expect(page).toHaveURL(/\/auth\/login/);
	});

	test("keeps user on register page when validation fails", async ({ page }) => {
		await page.goto("/auth/register");
		await page.getByRole("button", { name: "Sign Up" }).click();
		await expect(page).toHaveURL(/\/auth\/register/);
		await expect(page.getByText("Name is required", { exact: true })).toBeVisible();
	});
});
