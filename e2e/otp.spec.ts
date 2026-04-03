import { test, expect } from "@playwright/test";
import { ROUTES } from "./constants/routes";
import { OTP } from "./constants/selectors";
import { ERROR_MESSAGES } from "./constants/test-data";

const VALID_OTP_ID = "1";
const TEST_EMAIL = "otp-test@example.com";

test.describe("OTP Verification Page (M3)", () => {
  test.describe("UI validation", () => {
    test("should display OTP page with heading and 6 digit inputs when otpId and email are present", async ({
      page,
    }) => {
      await page.goto(
        `${ROUTES.REGISTER_OTP}?otpId=${VALID_OTP_ID}&email=${encodeURIComponent(TEST_EMAIL)}`
      );
      await expect(
        page.getByRole("heading", { name: OTP.PAGE_HEADING })
      ).toBeVisible();
      await expect(page.getByText(OTP.CODE_SENT_TO)).toBeVisible();
      await expect(page.getByText(TEST_EMAIL)).toBeVisible();

      for (let i = 0; i < 6; i++) {
        await expect(page.locator(`#otp-${i}`)).toBeVisible();
      }

      await expect(
        page.getByRole("button", { name: OTP.VERIFY_BUTTON })
      ).toBeVisible();
      await expect(page.getByText(OTP.BACK_TO_LOGIN)).toBeVisible();
    });

    test("Verify button should be disabled when OTP is incomplete", async ({
      page,
    }) => {
      await page.goto(
        `${ROUTES.REGISTER_OTP}?otpId=${VALID_OTP_ID}&email=${encodeURIComponent(TEST_EMAIL)}`
      );
      const verifyBtn = page.getByRole("button", { name: OTP.VERIFY_BUTTON });
      await expect(verifyBtn).toBeDisabled();

      await page.locator("#otp-0").fill("1");
      await expect(verifyBtn).toBeDisabled();

      for (let i = 0; i < 6; i++) {
        await page.locator(`#otp-${i}`).fill(String((i + 1) % 10));
      }
      await expect(verifyBtn).toBeEnabled();
    });
  });

  test.describe("Navigation", () => {
    test("Back to Login should navigate to login page", async ({ page }) => {
      await page.goto(
        `${ROUTES.REGISTER_OTP}?otpId=${VALID_OTP_ID}&email=${encodeURIComponent(TEST_EMAIL)}`
      );
      await page.getByRole("button", { name: OTP.BACK_TO_LOGIN }).click();
      await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN));
    });

    test("Back button should navigate to register page", async ({ page }) => {
      await page.goto(
        `${ROUTES.REGISTER_OTP}?otpId=${VALID_OTP_ID}&email=${encodeURIComponent(TEST_EMAIL)}`
      );
      await page.getByRole("button", { name: OTP.BACK_BUTTON }).click();
      await expect(page).toHaveURL(new RegExp(ROUTES.REGISTER));
    });
  });

  test.describe("Missing URL params - redirect", () => {
    test("missing otpId should redirect to register when flow is not forgotPassword", async ({
      page,
    }) => {
      await page.goto(`${ROUTES.REGISTER_OTP}?email=${encodeURIComponent(TEST_EMAIL)}`);
      await expect(page).toHaveURL(new RegExp(ROUTES.REGISTER));
    });

    test("missing otpId with flow=forgotPassword should redirect to reset password", async ({
      page,
    }) => {
      await page.goto(
        `${ROUTES.REGISTER_OTP}?email=${encodeURIComponent(TEST_EMAIL)}&flow=forgotPassword`
      );
      await expect(page).toHaveURL(new RegExp(ROUTES.RESET_PASSWORD));
    });
  });

  test.describe("API scenarios", () => {
    test("invalid OTP should show error message", async ({ page }) => {
      await page.route("**/api/v1/verifyOtp", (route) =>
        route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            message: "Invalid OTP",
          }),
        })
      );

      await page.goto(
        `${ROUTES.REGISTER_OTP}?otpId=${VALID_OTP_ID}&email=${encodeURIComponent(TEST_EMAIL)}`
      );
      for (let i = 0; i < 6; i++) {
        await page.locator(`#otp-${i}`).fill("0");
      }
      await page.getByRole("button", { name: OTP.VERIFY_BUTTON }).click();

      await expect(page.getByText("Invalid OTP")).toBeVisible();
    });

    test("valid OTP (registration flow) should redirect to login with email", async ({
      page,
    }) => {
      await page.route("**/api/v1/verifyOtp", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: {} }),
        })
      );

      await page.goto(
        `${ROUTES.REGISTER_OTP}?otpId=${VALID_OTP_ID}&email=${encodeURIComponent(TEST_EMAIL)}`
      );
      for (let i = 0; i < 6; i++) {
        await page.locator(`#otp-${i}`).fill("1");
      }
      await page.getByRole("button", { name: OTP.VERIFY_BUTTON }).click();

      await expect(page).toHaveURL(
        new RegExp(`${ROUTES.LOGIN}.*email=${encodeURIComponent(TEST_EMAIL)}`)
      );
    });

    test("valid OTP (forgot password flow) should redirect to add new password with token", async ({
      page,
    }) => {
      const passwordToken = "test-reset-token-123";
      await page.route("**/api/v1/verifyOtp", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { passwordToken },
          }),
        })
      );

      await page.goto(
        `${ROUTES.REGISTER_OTP}?otpId=${VALID_OTP_ID}&email=${encodeURIComponent(TEST_EMAIL)}&flow=forgotPassword`
      );
      for (let i = 0; i < 6; i++) {
        await page.locator(`#otp-${i}`).fill("1");
      }
      await page.getByRole("button", { name: OTP.VERIFY_BUTTON }).click();

      await expect(page).toHaveURL(
        new RegExp(
          `${ROUTES.ADD_NEW_PASSWORD}.*email=.*token=${passwordToken}`
        )
      );
    });

    test("resend OTP calls API and keeps user on OTP page", async ({ page }) => {
      await page.route("**/api/v1/sendOtp", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        })
      );
      await page.goto(
        `${ROUTES.REGISTER_OTP}?otpId=${VALID_OTP_ID}&email=${encodeURIComponent(TEST_EMAIL)}`
      );
      await page.getByRole("button", { name: OTP.RESEND_BUTTON }).click();
      await expect(page).toHaveURL(new RegExp(ROUTES.REGISTER_OTP));
    });
  });
});
