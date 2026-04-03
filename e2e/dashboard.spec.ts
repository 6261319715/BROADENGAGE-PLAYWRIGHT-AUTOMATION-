import { test, expect } from "@playwright/test";
import { ROUTES } from "./constants/routes";
import { LOGIN } from "./constants/selectors";
import { VALID_LOGIN } from "./constants/test-data";

test.describe("Dashboard", () => {
  test.describe("Authentication and navigation", () => {
    test("unauthenticated user visiting dashboard is redirected to login", async ({
      page,
    }) => {
      await page.goto(ROUTES.DASHBOARD);
      await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN));
    });

    test("after login user lands on dashboard URL", async ({ page }) => {
      await page.route("**/api/v1/login", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { token: "fake-jwt-token" },
          }),
        })
      );
      await page.goto(ROUTES.LOGIN);
      await page.getByPlaceholder(LOGIN.EMAIL_PLACEHOLDER).fill(VALID_LOGIN.email);
      await page.getByPlaceholder(LOGIN.PASSWORD_PLACEHOLDER).fill(VALID_LOGIN.password);
      await page.getByRole("button", { name: LOGIN.SUBMIT_BUTTON }).click();
      await expect(page).toHaveURL(new RegExp(ROUTES.DASHBOARD_ACTIVE_JOURNEYS));
    });

    test("dashboard URL is accessible after successful login", async ({
      page,
    }) => {
      await page.route("**/api/v1/login", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { token: "fake-jwt-token" },
          }),
        })
      );
      await page.goto(ROUTES.LOGIN);
      await page.getByPlaceholder(LOGIN.EMAIL_PLACEHOLDER).fill(VALID_LOGIN.email);
      await page.getByPlaceholder(LOGIN.PASSWORD_PLACEHOLDER).fill(VALID_LOGIN.password);
      await page.getByRole("button", { name: LOGIN.SUBMIT_BUTTON }).click();
      await expect(page).toHaveURL(new RegExp(ROUTES.DASHBOARD_ACTIVE_JOURNEYS));
      await page.goto(ROUTES.DASHBOARD);
      await expect(page).toHaveURL(new RegExp(ROUTES.DASHBOARD));
    });
  });

  test.describe("UI - post-login", () => {
    test.use({
      storageState: undefined,
    });

    test("dashboard page loads without showing login form", async ({
      page,
      context,
    }) => {
      await page.route("**/api/v1/login", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { token: "fake-jwt-token" },
          }),
        })
      );
      await page.goto(ROUTES.LOGIN);
      await page.getByPlaceholder(LOGIN.EMAIL_PLACEHOLDER).fill(VALID_LOGIN.email);
      await page.getByPlaceholder(LOGIN.PASSWORD_PLACEHOLDER).fill(VALID_LOGIN.password);
      await page.getByRole("button", { name: LOGIN.SUBMIT_BUTTON }).click();
      await expect(page).toHaveURL(new RegExp(ROUTES.DASHBOARD_ACTIVE_JOURNEYS));
      await expect(
        page.getByRole("heading", { name: LOGIN.PAGE_HEADING })
      ).not.toBeVisible();
    });

    test("refresh keeps user on protected area", async ({ page }) => {
      await page.route("**/api/v1/login", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { token: "fake-jwt-token" },
          }),
        })
      );
      await page.goto(ROUTES.LOGIN);
      await page.getByPlaceholder(LOGIN.EMAIL_PLACEHOLDER).fill(VALID_LOGIN.email);
      await page.getByPlaceholder(LOGIN.PASSWORD_PLACEHOLDER).fill(VALID_LOGIN.password);
      await page.getByRole("button", { name: LOGIN.SUBMIT_BUTTON }).click();
      await expect(page).toHaveURL(new RegExp(ROUTES.DASHBOARD_ACTIVE_JOURNEYS));
      await page.reload();
      await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    });
  });
});
