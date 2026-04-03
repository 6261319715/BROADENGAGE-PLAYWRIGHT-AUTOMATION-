import { test, expect } from "@playwright/test";
import { ROUTES } from "./constants/routes";
import { LOGIN, DASHBOARD } from "./constants/selectors";
import { VALID_LOGIN } from "./constants/test-data";

const FALLBACK_MESSAGE = "Sorry, this page is currently unavailable.";
const LOADING_TEXT = "Please wait for a moment";

async function expectLayoutContentOrFallback(page: any) {
  // For app routes the shell shows either:
  // - loading spinner text (during Suspense / SSR)
  // - or error/fallback message (when remote is offline or unknown route)
  await expect(
    page.locator("text=" + LOADING_TEXT).or(page.locator(`text=${FALLBACK_MESSAGE}`))
  ).toBeVisible({ timeout: 15_000 });
}

test.describe("App Shell & Layout smoke (M9)", () => {
  test.describe("Auth routes render without Layout", () => {
    test("login page should render without MFE loading spinner", async ({
      page,
    }) => {
      await page.goto(ROUTES.LOGIN);
      await expect(
        page.getByRole("heading", { name: LOGIN.PAGE_HEADING })
      ).toBeVisible();
      await expect(page.locator(DASHBOARD.MFE_LOADING)).toHaveCount(0);
    });
  });

  test.describe("App routes render Layout (post-login)", () => {
    test.beforeEach(async ({ page }) => {
      // Mock login to make routes accessible without real backend.
      await page.route("**/api/v1/login", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { token: "fake-jwt-token-for-m9" },
          }),
        })
      );

      await page.goto(ROUTES.LOGIN);
      await page.getByPlaceholder(LOGIN.EMAIL_PLACEHOLDER).fill(VALID_LOGIN.email);
      await page.getByPlaceholder(LOGIN.PASSWORD_PLACEHOLDER).fill(VALID_LOGIN.password);
      await page.getByRole("button",{ name: LOGIN.SUBMIT_BUTTON }).click();
      await expect(page).toHaveURL(new RegExp(ROUTES.DASHBOARD_ACTIVE_JOURNEYS));
    });

    test("journeys active route renders Layout loading or fallback", async ({
      page,
    }) => {
      await page.goto("/journeys/active");
      await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
      await expectLayoutContentOrFallback(page);
      await expect(
        page.getByRole("heading", { name: LOGIN.PAGE_HEADING })
      ).not.toBeVisible();
    });

    test("campaigns email route renders Layout loading or fallback", async ({
      page,
    }) => {
      await page.goto("/campaigns/email");
      await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
      await expectLayoutContentOrFallback(page);
    });

    test("audience segments route renders Layout loading or fallback", async ({
      page,
    }) => {
      await page.goto("/audience/segments");
      await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
      await expectLayoutContentOrFallback(page);
    });

    test("settings users route renders Layout loading or fallback", async ({
      page,
    }) => {
      await page.goto("/settings/users");
      await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
      await expectLayoutContentOrFallback(page);
    });

    test("unknown route renders fallback UI (not blank)", async ({ page }) => {
      await page.goto("/__unknown_path__");
      await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
      await expect(page.getByText(FALLBACK_MESSAGE)).toBeVisible({
        timeout: 15_000,
      });
    });

    test("dashboard route keeps user in app shell after login", async ({ page }) => {
      await page.goto(ROUTES.DASHBOARD);
      await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
      await expectLayoutContentOrFallback(page);
    });
  });
});

