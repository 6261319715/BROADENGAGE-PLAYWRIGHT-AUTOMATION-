import { test, expect } from "@playwright/test";
import { ROUTES } from "./constants/routes";
import { SET_NEW_PASSWORD } from "./constants/selectors";
import {
  VALID_SET_NEW_PASSWORD,
  INVALID_SET_NEW_PASSWORD,
  ERROR_MESSAGES,
} from "./constants/test-data";

const TEST_EMAIL = "setpassword@example.com";
const TEST_TOKEN = "valid-reset-token-456";

function addNewPasswordUrl(email: string, token: string) {
  return `${ROUTES.ADD_NEW_PASSWORD}?email=${encodeURIComponent(email)}&token=${token}`;
}

test.describe("Set New Password Page (M5)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(addNewPasswordUrl(TEST_EMAIL, TEST_TOKEN));
  });

  test("missing token in URL should not allow reset flow", async ({ page }) => {
    await page.goto(`${ROUTES.ADD_NEW_PASSWORD}?email=${encodeURIComponent(TEST_EMAIL)}`);
    await expect(page).not.toHaveURL(new RegExp(`${ROUTES.ADD_NEW_PASSWORD}.*token=`));
  });

  test.describe("UI validation", () => {
    test("should display set new password page with heading and form", async ({
      page,
    }) => {
      await expect(
        page.getByRole("heading", { name: SET_NEW_PASSWORD.PAGE_HEADING })
      ).toBeVisible();
      await expect(page.getByText(SET_NEW_PASSWORD.SUBTITLE)).toBeVisible();
      await expect(
        page.getByLabel(SET_NEW_PASSWORD.NEW_PASSWORD_LABEL)
      ).toBeVisible();
      await expect(
        page.getByLabel(SET_NEW_PASSWORD.CONFIRM_PASSWORD_LABEL)
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: SET_NEW_PASSWORD.RESET_BUTTON })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: SET_NEW_PASSWORD.BACK_TO_LOGIN })
      ).toBeVisible();
    });
  });

  test.describe("Form validation", () => {
    test("should show error when password is empty", async ({ page }) => {
      await page
        .getByRole("button", { name: SET_NEW_PASSWORD.RESET_BUTTON })
        .click();
      await expect(
        page.getByText(ERROR_MESSAGES.SET_NEW_PASSWORD.ALL_FIELDS_REQUIRED)
      ).toBeVisible();
    });

    test("should show error when password is less than 8 characters", async ({
      page,
    }) => {
      await page.getByLabel(SET_NEW_PASSWORD.NEW_PASSWORD_LABEL).fill("Short1!");
      await page
        .getByLabel(SET_NEW_PASSWORD.CONFIRM_PASSWORD_LABEL)
        .fill("Short1!");
      await page
        .getByRole("button", { name: SET_NEW_PASSWORD.RESET_BUTTON })
        .click();
      await expect(
        page.getByText(ERROR_MESSAGES.SET_NEW_PASSWORD.PASSWORD_MIN)
      ).toBeVisible();
    });

    test("should show error when passwords do not match", async ({
      page,
    }) => {
      await page
        .getByLabel(SET_NEW_PASSWORD.NEW_PASSWORD_LABEL)
        .fill(VALID_SET_NEW_PASSWORD.password);
      await page
        .getByLabel(SET_NEW_PASSWORD.CONFIRM_PASSWORD_LABEL)
        .fill(INVALID_SET_NEW_PASSWORD.passwordMismatch);
      await page
        .getByRole("button", { name: SET_NEW_PASSWORD.RESET_BUTTON })
        .click();
      await expect(
        page.getByText(ERROR_MESSAGES.SET_NEW_PASSWORD.PASSWORDS_MISMATCH)
      ).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("Back to Login should navigate to login page", async ({ page }) => {
      await page
        .getByRole("button", { name: SET_NEW_PASSWORD.BACK_TO_LOGIN })
        .click();
      await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN));
    });
  });

  test.describe("API scenarios", () => {
    test("API success should show success message and redirect to login", async ({
      page,
    }) => {
      await page.route("**/api/v1/resetNewPassword", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "Password reset successfully!",
          }),
        })
      );

      await page
        .getByLabel(SET_NEW_PASSWORD.NEW_PASSWORD_LABEL)
        .fill(VALID_SET_NEW_PASSWORD.password);
      await page
        .getByLabel(SET_NEW_PASSWORD.CONFIRM_PASSWORD_LABEL)
        .fill(VALID_SET_NEW_PASSWORD.confirmPassword);
      await page
        .getByRole("button", { name: SET_NEW_PASSWORD.RESET_BUTTON })
        .click();

      await expect(
        page.getByRole("alert").filter({ hasText: "Password reset successfully!" })
      ).toBeVisible();

      await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN), {
        timeout: 10000,
      });
    });

    test("API failure (invalid token) should show error", async ({
      page,
    }) => {
      await page.route("**/api/v1/resetNewPassword", (route) =>
        route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            message: "Invalid or expired reset link",
          }),
        })
      );

      await page
        .getByLabel(SET_NEW_PASSWORD.NEW_PASSWORD_LABEL)
        .fill(VALID_SET_NEW_PASSWORD.password);
      await page
        .getByLabel(SET_NEW_PASSWORD.CONFIRM_PASSWORD_LABEL)
        .fill(VALID_SET_NEW_PASSWORD.confirmPassword);
      await page
        .getByRole("button", { name: SET_NEW_PASSWORD.RESET_BUTTON })
        .click();

      await expect(
        page.getByText("Invalid or expired reset link")
      ).toBeVisible();
    });
  });
});
