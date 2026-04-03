import { test, expect, type Page } from "@playwright/test";
import { ROUTES } from "./constants/routes";
import { LOGIN, DASHBOARD } from "./constants/selectors";
import { VALID_LOGIN } from "./constants/test-data";

/**
 * Journeys sub-module tests (M10.1).
 * Scope: ensure Journeys routes are accessible post-login and do not render blank screens.
 *
 * Notes:
 * - This repo is the shell. Most UI comes from remote MFEs, so assertions are intentionally shell-stable:
 *   loader OR controlled fallback must appear (instead of blank).
 * - When you share stable UI anchors from the Journeys MFE (e.g. headings/buttons),
 *   we can extend these into true functional tests (create/edit/search journeys).
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
        data: { token: "fake-jwt-token-for-journeys" },
      }),
    })
  );

  await page.goto(ROUTES.LOGIN);
  await page.getByPlaceholder(LOGIN.EMAIL_PLACEHOLDER).fill(VALID_LOGIN.email);
  await page.getByPlaceholder(LOGIN.PASSWORD_PLACEHOLDER).fill(VALID_LOGIN.password);
  await page.getByRole("button", { name: LOGIN.SUBMIT_BUTTON }).click();
  await expect(page).toHaveURL(new RegExp(ROUTES.DASHBOARD_ACTIVE_JOURNEYS));
}

async function expectNotBlankJourneysSurface(page: Page) {
  const loaderOrFallback = page
    .locator(`text=${LOADING_TEXT}`)
    .or(page.locator(`text=${FALLBACK_MESSAGE}`))
    .or(page.locator(DASHBOARD.MFE_LOADING));

  await expect(loaderOrFallback.first()).toBeVisible({ timeout: 15_000 });
}

test.describe("Journeys (M10.1)", () => {
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

  test("Active journeys route loads (or fallback) post-login", async ({ page }) => {
    await ensureLoggedIn(page);
    await page.goto("/journeys/active");
    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    await expectNotBlankJourneysSurface(page);
    await expect(page.getByRole("heading", { name: LOGIN.PAGE_HEADING })).not.toBeVisible();
  });

  test("Draft journeys route loads (or fallback) post-login", async ({ page }) => {
    await ensureLoggedIn(page);
    await page.goto("/journeys/drafts");
    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    await expectNotBlankJourneysSurface(page);
  });

  test("Create journey route loads (or fallback) post-login", async ({ page }) => {
    await ensureLoggedIn(page);
    await page.goto("/journeys/create");
    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    await expectNotBlankJourneysSurface(page);
  });

  test("User can navigate between journeys routes via direct URL changes without being kicked to login", async ({
    page,
  }) => {
    await ensureLoggedIn(page);

    await page.goto("/journeys/active");
    await expectNotBlankJourneysSurface(page);

    await page.goto("/journeys/drafts");
    await expectNotBlankJourneysSurface(page);

    await page.goto("/journeys/create");
    await expectNotBlankJourneysSurface(page);

    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
  });

  test("Unauthenticated user is redirected to login for journeys route", async ({ page }) => {
    await page.goto("/journeys/active");
    await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN));
  });
});

