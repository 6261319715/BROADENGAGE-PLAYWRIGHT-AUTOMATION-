import { test, expect, type Page } from "@playwright/test";
import { ROUTES } from "./constants/routes";
import { LOGIN, DASHBOARD } from "./constants/selectors";
import { VALID_LOGIN } from "./constants/test-data";

/**
 * Data & Sources sub-module tests (M10.4).
 * Scope: Connect Data and Pool routes are accessible post-login and do not render blank screens.
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
        data: { token: "fake-jwt-token-for-data-sources" },
      }),
    })
  );

  await page.goto(ROUTES.LOGIN);
  await page.getByPlaceholder(LOGIN.EMAIL_PLACEHOLDER).fill(VALID_LOGIN.email);
  await page.getByPlaceholder(LOGIN.PASSWORD_PLACEHOLDER).fill(VALID_LOGIN.password);
  await page.getByRole("button", { name: LOGIN.SUBMIT_BUTTON }).click();
  await expect(page).toHaveURL(new RegExp(ROUTES.DASHBOARD_ACTIVE_JOURNEYS));
}

async function expectNotBlankDataSurface(page: Page) {
  const loaderOrFallback = page
    .locator(`text=${LOADING_TEXT}`)
    .or(page.locator(`text=${FALLBACK_MESSAGE}`))
    .or(page.locator(DASHBOARD.MFE_LOADING));

  await expect(loaderOrFallback.first()).toBeVisible({ timeout: 15_000 });
}

test.describe("Data & Sources (M10.4)", () => {
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

  test("Connect Data route loads (or fallback) post-login", async ({ page }) => {
    await ensureLoggedIn(page);
    await page.goto("/data/connect-data");
    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    await expectNotBlankDataSurface(page);
  });

  test("Datasets route loads (or fallback) post-login", async ({ page }) => {
    await ensureLoggedIn(page);
    await page.goto("/data/datasets");
    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    await expectNotBlankDataSurface(page);
  });

  test("Pool route loads (or fallback) post-login", async ({ page }) => {
    await ensureLoggedIn(page);
    await page.goto("/data-and-sources/pool");
    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    await expectNotBlankDataSurface(page);
  });

  test("User can switch between connect-data and pool without being kicked to login", async ({
    page,
  }) => {
    await ensureLoggedIn(page);

    await page.goto("/data/connect-data");
    await expectNotBlankDataSurface(page);

    await page.goto("/data-and-sources/pool");
    await expectNotBlankDataSurface(page);

    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
  });

  test("Unauthenticated user is redirected to login for data routes", async ({ page }) => {
    await page.goto("/data/connect-data");
    await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN));
  });
});
