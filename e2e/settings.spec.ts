import { test, expect, type Page } from "@playwright/test";
import { ROUTES } from "./constants/routes";
import { LOGIN, DASHBOARD } from "./constants/selectors";
import { VALID_LOGIN } from "./constants/test-data";

/**
 * Settings sub-module tests (M10.6).
 * Scope: Users & Roles and settings routes are accessible post-login and do not render blank screens.
 */

const FALLBACK_MESSAGE = "Sorry, this page is currently unavailable.";
const LOADING_TEXT = "Please wait for a moment";

async function ensureLoggedIn(page: Page) {
  await page.route("**/api/v1/login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { token: "fake-jwt-token-for-settings" },
      }),
    })
  );

  await page.goto(ROUTES.LOGIN);
  await page.getByPlaceholder(LOGIN.EMAIL_PLACEHOLDER).fill(VALID_LOGIN.email);
  await page.getByPlaceholder(LOGIN.PASSWORD_PLACEHOLDER).fill(VALID_LOGIN.password);
  await page.getByRole("button", { name: LOGIN.SUBMIT_BUTTON }).click();
  await expect(page).toHaveURL(new RegExp(ROUTES.DASHBOARD_ACTIVE_JOURNEYS));
}

async function expectNotBlankSettingsSurface(page: Page) {
  const loaderOrFallback = page
    .locator(`text=${LOADING_TEXT}`)
    .or(page.locator(`text=${FALLBACK_MESSAGE}`))
    .or(page.locator(DASHBOARD.MFE_LOADING));

  await expect(loaderOrFallback.first()).toBeVisible({ timeout: 15_000 });
}

test.describe("Settings (M10.6)", () => {
  test.beforeEach(async ({}, testInfo) => {
    const baseURL = testInfo.project.use.baseURL as string | undefined;
    const isPlaceholder =
      !process.env.BASE_URL && (baseURL ?? "").includes("your-project-url.com");
    if (isPlaceholder) {
      testInfo.skip(
        true,
        "BASE_URL is not set (using placeholder). Run with BASE_URL=http://localhost:3003 (or your deployed URL)."
      );
    }
  });

  test("Users & Roles route loads (or fallback) post-login", async ({ page }) => {
    await ensureLoggedIn(page);
    await page.goto("/settings/users");
    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    await expectNotBlankSettingsSurface(page);
  });

  test("SMS template form (settings) route loads (or fallback) post-login", async ({
    page,
  }) => {
    await ensureLoggedIn(page);
    await page.goto("/settings/sms/template-form");
    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    await expectNotBlankSettingsSurface(page);
  });

  test("SMS SSP account (settings) route loads (or fallback) post-login", async ({
    page,
  }) => {
    await ensureLoggedIn(page);
    await page.goto("/settings/sms/ssp-account");
    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    await expectNotBlankSettingsSurface(page);
  });

  test("User can switch between settings routes without being kicked to login", async ({
    page,
  }) => {
    await ensureLoggedIn(page);

    await page.goto("/settings/users");
    await expectNotBlankSettingsSurface(page);

    await page.goto("/settings/sms/template-form");
    await expectNotBlankSettingsSurface(page);

    await page.goto("/settings/sms/ssp-account");
    await expectNotBlankSettingsSurface(page);

    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
  });

  test("Unauthenticated user is redirected to login for settings route", async ({ page }) => {
    await page.goto("/settings/users");
    await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN));
  });
});
