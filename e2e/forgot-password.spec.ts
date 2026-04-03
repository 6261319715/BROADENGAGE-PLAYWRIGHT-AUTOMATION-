import { test, expect } from "@playwright/test";
import { ROUTES } from "./constants/routes";
import { RESET_PASSWORD } from "./constants/selectors";
import {
  VALID_RESET_PASSWORD,
  ERROR_MESSAGES,
} from "./constants/test-data";

test.describe("Forgot Password / Reset Password Page (M4)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.RESET_PASSWORD);
  });

  test.describe("UI validation", () => {
    test("should display reset password page with heading and form", async ({
      page,
    }) => {
      await expect(
        page.getByRole("heading", { name: RESET_PASSWORD.PAGE_HEADING })
      ).toBeVisible();
      await expect(page.getByText(RESET_PASSWORD.SUBTITLE)).toBeVisible();
      await expect(
        page.getByPlaceholder(RESET_PASSWORD.EMAIL_PLACEHOLDER)
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: RESET_PASSWORD.SUBMIT_BUTTON })
      ).toBeVisible();
      await expect(
        page.getByText(RESET_PASSWORD.REMEMBER_PASSWORD)
      ).toBeVisible();
      await expect(page.getByText(RESET_PASSWORD.LOGIN_LINK)).toBeVisible();
    });
  });

  test.describe("Form validation", () => {
    test("should show error when email is empty on submit", async ({
      page,
    }) => {
      await page
        .getByRole("button", { name: RESET_PASSWORD.SUBMIT_BUTTON })
        .click();
      await expect(
        page.getByText(ERROR_MESSAGES.RESET_PASSWORD.EMAIL_REQUIRED)
      ).toBeVisible();
    });

    test("should show error for invalid email format", async ({ page }) => {
      await page
        .getByPlaceholder(RESET_PASSWORD.EMAIL_PLACEHOLDER)
        .fill("notanemail");
      await page
        .getByRole("button", { name: RESET_PASSWORD.SUBMIT_BUTTON })
        .click();
      await expect(
        page.getByText(ERROR_MESSAGES.RESET_PASSWORD.EMAIL_INVALID)
      ).toBeVisible();
    });

    test("valid email should not show client-side errors", async ({
      page,
    }) => {
      await page
        .getByPlaceholder(RESET_PASSWORD.EMAIL_PLACEHOLDER)
        .fill(VALID_RESET_PASSWORD.email);
      await page
        .getByRole("button", { name: RESET_PASSWORD.SUBMIT_BUTTON })
        .click();
      await expect(
        page.getByText(ERROR_MESSAGES.RESET_PASSWORD.EMAIL_REQUIRED)
      ).not.toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("Remember your password? Login should navigate to login page", async ({
      page,
    }) => {
      await page.getByText(RESET_PASSWORD.LOGIN_LINK).click();
      await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN));
    });

    test("reset password page stays publicly accessible", async ({ page }) => {
      await page.goto(ROUTES.RESET_PASSWORD);
      await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
      await expect(
        page.getByRole("button", { name: RESET_PASSWORD.SUBMIT_BUTTON })
      ).toBeVisible();
    });
  });

  test.describe("API scenarios", () => {
    test("API success should redirect to OTP page with flow=forgotPassword", async ({
      page,
    }) => {
      await page.route("**/api/v1/sendOtpEmail", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { otpId: "test-otp-id" },
          }),
        })
      );

      await page
        .getByPlaceholder(RESET_PASSWORD.EMAIL_PLACEHOLDER)
        .fill(VALID_RESET_PASSWORD.email);
      await page
        .getByRole("button", { name: RESET_PASSWORD.SUBMIT_BUTTON })
        .click();

      await expect(page).toHaveURL(
        new RegExp(
          `${ROUTES.REGISTER_OTP}.*otpId=.*email=.*flow=forgotPassword`
        )
      );
    });

    test("API failure should show error in snackbar", async ({ page }) => {
      await page.route("**/api/v1/sendOtpEmail", (route) =>
        route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            message: "Email not found",
          }),
        })
      );

      await page
        .getByPlaceholder(RESET_PASSWORD.EMAIL_PLACEHOLDER)
        .fill(VALID_RESET_PASSWORD.email);
      await page
        .getByRole("button", { name: RESET_PASSWORD.SUBMIT_BUTTON })
        .click();

      const snackbar = page
        .getByRole("alert")
        .filter({ hasText: "Email not found" })
        .first();
      await expect(snackbar).toBeVisible();
    });
  });
});
