import { expect, test } from "@playwright/test";

test.describe("M1 - Login", () => {
	test("shows validation errors for empty submit", async ({ page }) => {
		await page.goto("/auth/login");

		await page.getByRole("button", { name: "Log In" }).click();

		await expect(page.getByText("Email is required")).toBeVisible();
		await expect(page.getByText("Password is required")).toBeVisible();
	});

	test("shows invalid email validation", async ({ page }) => {
		await page.goto("/auth/login");

		await page.getByPlaceholder("Email ID").fill("invalid-email");
		await page.getByPlaceholder("Password").fill("secret12");
		await page.getByRole("button", { name: "Log In" }).click();

		await expect(page.getByText("Please enter a valid email")).toBeVisible();
	});

	test("navigates to forgot password and sign up", async ({ page }) => {
		await page.goto("/auth/login");

		await page.locator("p", { hasText: "Forgot Password?" }).click();
		await expect(page).toHaveURL(/\/auth\/resetpassword/);

		await page.goto("/auth/login");
		await page.locator("span", { hasText: "Sign Up" }).click();
		await expect(page).toHaveURL(/\/auth\/register/);
	});

	test("prefills email from query param", async ({ page }) => {
		await page.goto("/auth/login?email=tester%40example.com");

		await expect(page.getByPlaceholder("Email ID")).toHaveValue("tester@example.com");
	});

	test("logs in successfully and stores token", async ({ page }) => {
		await page.route("**/api/v1/login", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					success: true,
					data: { token: "fake-jwt-token" },
				}),
			});
		});

		await page.goto("/auth/login");
		await page.getByPlaceholder("Email ID").fill("qa@example.com");
		await page.getByPlaceholder("Password").fill("Secret@123");
		await page.getByRole("button", { name: "Log In" }).click();

		await expect
			.poll(async () => {
				return page.evaluate(() => localStorage.getItem("token"));
			})
			.toBe("fake-jwt-token");
	});

	test("shows API error for invalid credentials", async ({ page }) => {
		await page.route("**/api/v1/login", async (route) => {
			await route.fulfill({
				status: 401,
				contentType: "application/json",
				body: JSON.stringify({
					success: false,
					message: "Invalid credentials",
				}),
			});
		});

		await page.goto("/auth/login");
		await page.getByPlaceholder("Email ID").fill("qa@example.com");
		await page.getByPlaceholder("Password").fill("wrongpass");
		await page.getByRole("button", { name: "Log In" }).click();

		await expect(page.getByText("Invalid credentials")).toBeVisible();
		await expect(page).toHaveURL(/\/auth\/login/);
	});

	test("failed login should not persist auth token", async ({ page }) => {
		await page.route("**/api/v1/login", async (route) => {
			await route.fulfill({
				status: 401,
				contentType: "application/json",
				body: JSON.stringify({
					success: false,
					message: "Invalid credentials",
				}),
			});
		});

		await page.goto("/auth/login");
		await page.getByPlaceholder("Email ID").fill("qa@example.com");
		await page.getByPlaceholder("Password").fill("wrongpass");
		await page.getByRole("button", { name: "Log In" }).click();

		await expect
			.poll(async () => page.evaluate(() => localStorage.getItem("token")))
			.toBeNull();
	});
});
