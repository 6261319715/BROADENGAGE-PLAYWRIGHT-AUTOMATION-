import { test, expect, type Page } from "@playwright/test";
import { ROUTES } from "./constants/routes";
import { LOGIN, DASHBOARD } from "./constants/selectors";
import { VALID_LOGIN } from "./constants/test-data";

/**
 * Audience sub-module tests (M10.3).
 * Scope: Segments and Suppression routes are accessible post-login and do not render blank screens.
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
        data: { token: "fake-jwt-token-for-audience" },
      }),
    })
  );

  await page.goto(ROUTES.LOGIN);
  await page.getByPlaceholder(LOGIN.EMAIL_PLACEHOLDER).fill(VALID_LOGIN.email);
  await page.getByPlaceholder(LOGIN.PASSWORD_PLACEHOLDER).fill(VALID_LOGIN.password);
  await page.getByRole("button", { name: LOGIN.SUBMIT_BUTTON }).click();
  await expect(page).toHaveURL(new RegExp(ROUTES.DASHBOARD_ACTIVE_JOURNEYS));
}

async function expectNotBlankAudienceSurface(page: Page) {
  const loaderOrFallback = page
    .locator(`text=${LOADING_TEXT}`)
    .or(page.locator(`text=${FALLBACK_MESSAGE}`))
    .or(page.locator(DASHBOARD.MFE_LOADING));

  await expect(loaderOrFallback.first()).toBeVisible({ timeout: 15_000 });
}

test.describe("Audience (M10.3)", () => {
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

  test("Segments route loads (or fallback) post-login", async ({ page }) => {
    await ensureLoggedIn(page);
    await page.goto("/audience/segments");
    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    await expectNotBlankAudienceSurface(page);
  });

  test("Suppression route loads (or fallback) post-login", async ({ page }) => {
    await ensureLoggedIn(page);
    await page.goto("/audience/suppression");
    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    await expectNotBlankAudienceSurface(page);
  });

  test("User can switch between segments and suppression without being kicked to login", async ({
    page,
  }) => {
    await ensureLoggedIn(page);

    await page.goto("/audience/segments");
    await expectNotBlankAudienceSurface(page);

    await page.goto("/audience/suppression");
    await expectNotBlankAudienceSurface(page);

    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
  });

  test("Unauthenticated user is redirected to login for audience route", async ({ page }) => {
    await page.goto("/audience/segments");
    await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN));
  });
});
