import { test, expect } from "@playwright/test";
import { ROUTES } from "./constants/routes";
import { SIGNUP } from "./constants/selectors";
import {
  VALID_SIGNUP,
  INVALID_SIGNUP,
  ERROR_MESSAGES,
} from "./constants/test-data";

test.describe("Signup Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.REGISTER);
  });

  test.describe("UI validation", () => {
    test("should display signup form with all fields", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: SIGNUP.PAGE_HEADING })
      ).toBeVisible();
      await expect(page.getByLabel(SIGNUP.FULL_NAME_LABEL)).toBeVisible();
      await expect(
        page.getByLabel(SIGNUP.ORGANISATION_NAME_LABEL)
      ).toBeVisible();
      await expect(page.getByLabel(SIGNUP.EMAIL_LABEL)).toBeVisible();
      await expect(page.getByLabel(SIGNUP.PHONE_LABEL)).toBeVisible();
      await expect(page.getByLabel(SIGNUP.PASSWORD_LABEL)).toBeVisible();
      await expect(
        page.getByRole("checkbox", { name: SIGNUP.TERMS_CHECKBOX_LABEL })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: SIGNUP.SUBMIT_BUTTON })
      ).toBeVisible();
    });

    test("should show Login link for existing users", async ({ page }) => {
      await expect(page.getByText(SIGNUP.LOGIN_LINK).first()).toBeVisible();
    });
  });

  test.describe("Form validation - invalid", () => {
    test("should show error when Full Name is too short", async ({ page }) => {
      await page.getByLabel(SIGNUP.FULL_NAME_LABEL).fill(INVALID_SIGNUP.fullNameTooShort);
      await page.getByLabel(SIGNUP.ORGANISATION_NAME_LABEL).fill(VALID_SIGNUP.organisationName);
      await page.getByLabel(SIGNUP.EMAIL_LABEL).fill(VALID_SIGNUP.email);
      await page.getByLabel(SIGNUP.PHONE_LABEL).fill(VALID_SIGNUP.phone);
      await page.getByLabel(SIGNUP.PASSWORD_LABEL).fill(VALID_SIGNUP.password);
      await page.getByRole("button", { name: SIGNUP.SUBMIT_BUTTON }).click();
      await expect(
        page.getByText(ERROR_MESSAGES.SIGNUP.NAME_MIN)
      ).toBeVisible();
    });

    test("should show error for invalid email", async ({ page }) => {
      await page.getByLabel(SIGNUP.FULL_NAME_LABEL).fill(VALID_SIGNUP.fullName);
      await page.getByLabel(SIGNUP.ORGANISATION_NAME_LABEL).fill(VALID_SIGNUP.organisationName);
      await page.getByLabel(SIGNUP.EMAIL_LABEL).fill(INVALID_SIGNUP.emailInvalid);
      await page.getByLabel(SIGNUP.PHONE_LABEL).fill(VALID_SIGNUP.phone);
      await page.getByLabel(SIGNUP.PASSWORD_LABEL).fill(VALID_SIGNUP.password);
      await page.getByRole("button", { name: SIGNUP.SUBMIT_BUTTON }).click();
      await expect(
        page.getByText(ERROR_MESSAGES.SIGNUP.EMAIL_INVALID)
      ).toBeVisible();
    });

    test("should show error when phone is not 10 digits", async ({ page }) => {
      await page.getByLabel(SIGNUP.FULL_NAME_LABEL).fill(VALID_SIGNUP.fullName);
      await page.getByLabel(SIGNUP.ORGANISATION_NAME_LABEL).fill(VALID_SIGNUP.organisationName);
      await page.getByLabel(SIGNUP.EMAIL_LABEL).fill(VALID_SIGNUP.email);
      await page.getByLabel(SIGNUP.PHONE_LABEL).fill(INVALID_SIGNUP.phoneWrongLength);
      await page.getByLabel(SIGNUP.PASSWORD_LABEL).fill(VALID_SIGNUP.password);
      await page.getByRole("button", { name: SIGNUP.SUBMIT_BUTTON }).click();
      await expect(
        page.getByText(ERROR_MESSAGES.SIGNUP.PHONE_LENGTH)
      ).toBeVisible();
    });

    test("should show error when password does not meet rules", async ({
      page,
    }) => {
      await page.getByLabel(SIGNUP.FULL_NAME_LABEL).fill(VALID_SIGNUP.fullName);
      await page.getByLabel(SIGNUP.ORGANISATION_NAME_LABEL).fill(VALID_SIGNUP.organisationName);
      await page.getByLabel(SIGNUP.EMAIL_LABEL).fill(VALID_SIGNUP.email);
      await page.getByLabel(SIGNUP.PHONE_LABEL).fill(VALID_SIGNUP.phone);
      await page.getByLabel(SIGNUP.PASSWORD_LABEL).fill(INVALID_SIGNUP.passwordWeak);
      await page.getByRole("button", { name: SIGNUP.SUBMIT_BUTTON }).click();
      await expect(
        page.getByText(ERROR_MESSAGES.SIGNUP.PASSWORD_RULES)
      ).toBeVisible();
    });

    test("should show error when terms are not accepted", async ({ page }) => {
      await page.getByLabel(SIGNUP.FULL_NAME_LABEL).fill(VALID_SIGNUP.fullName);
      await page.getByLabel(SIGNUP.ORGANISATION_NAME_LABEL).fill(VALID_SIGNUP.organisationName);
      await page.getByLabel(SIGNUP.EMAIL_LABEL).fill(VALID_SIGNUP.email);
      await page.getByLabel(SIGNUP.PHONE_LABEL).fill(VALID_SIGNUP.phone);
      await page.getByLabel(SIGNUP.PASSWORD_LABEL).fill(VALID_SIGNUP.password);
      await page.getByRole("button", { name: SIGNUP.SUBMIT_BUTTON }).click();
      await expect(
        page.getByText(ERROR_MESSAGES.SIGNUP.TERMS_REQUIRED)
      ).toBeVisible();
    });
  });

  test.describe("Form validation - valid", () => {
    test("valid data in all fields should not show client-side errors", async ({
      page,
    }) => {
      await page.getByLabel(SIGNUP.FULL_NAME_LABEL).fill(VALID_SIGNUP.fullName);
      await page.getByLabel(SIGNUP.ORGANISATION_NAME_LABEL).fill(VALID_SIGNUP.organisationName);
      await page.getByLabel(SIGNUP.EMAIL_LABEL).fill(VALID_SIGNUP.email);
      await page.getByLabel(SIGNUP.PHONE_LABEL).fill(VALID_SIGNUP.phone);
      await page.getByLabel(SIGNUP.PASSWORD_LABEL).fill(VALID_SIGNUP.password);
      await page.getByRole("checkbox", { name: SIGNUP.TERMS_CHECKBOX_LABEL }).check();
      await page.getByRole("button", { name: SIGNUP.SUBMIT_BUTTON }).click();
      await expect(
        page.getByText(ERROR_MESSAGES.SIGNUP.NAME_REQUIRED)
      ).not.toBeVisible();
      await expect(
        page.getByText(ERROR_MESSAGES.SIGNUP.EMAIL_REQUIRED)
      ).not.toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("Login link should navigate to login page", async ({ page }) => {
      await page.getByText(SIGNUP.LOGIN_LINK).first().click();
      await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN));
    });

    test("register URL should not redirect back to login automatically", async ({
      page,
    }) => {
      await page.goto(ROUTES.REGISTER);
      await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
      await expect(
        page.getByRole("button", { name: SIGNUP.SUBMIT_BUTTON })
      ).toBeVisible();
    });
  });

  test.describe("API scenarios", () => {
    test("API failure should show error in snackbar", async ({ page }) => {
      await page.route("**/api/v1/register", (route) =>
        route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            message: "Email already registered",
          }),
        })
      );
      await page.getByLabel(SIGNUP.FULL_NAME_LABEL).fill(VALID_SIGNUP.fullName);
      await page.getByLabel(SIGNUP.ORGANISATION_NAME_LABEL).fill(VALID_SIGNUP.organisationName);
      await page.getByLabel(SIGNUP.EMAIL_LABEL).fill(VALID_SIGNUP.email);
      await page.getByLabel(SIGNUP.PHONE_LABEL).fill(VALID_SIGNUP.phone);
      await page.getByLabel(SIGNUP.PASSWORD_LABEL).fill(VALID_SIGNUP.password);
      await page.getByRole("checkbox", { name: SIGNUP.TERMS_CHECKBOX_LABEL }).check();
      await page.getByRole("button", { name: SIGNUP.SUBMIT_BUTTON }).click();
      const snackbarAlert = page
        .getByRole("alert")
        .filter({ hasText: "Email already registered" })
        .first();
      await expect(snackbarAlert).toBeVisible();
    });

    test("API success should redirect to register OTP page", async ({
      page,
    }) => {
      await page.route("**/api/v1/register", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { otpId: "test-otp-id" },
          }),
        })
      );
      await page.getByLabel(SIGNUP.FULL_NAME_LABEL).fill(VALID_SIGNUP.fullName);
      await page.getByLabel(SIGNUP.ORGANISATION_NAME_LABEL).fill(VALID_SIGNUP.organisationName);
      await page.getByLabel(SIGNUP.EMAIL_LABEL).fill(VALID_SIGNUP.email);
      await page.getByLabel(SIGNUP.PHONE_LABEL).fill(VALID_SIGNUP.phone);
      await page.getByLabel(SIGNUP.PASSWORD_LABEL).fill(VALID_SIGNUP.password);
      await page.getByRole("checkbox", { name: SIGNUP.TERMS_CHECKBOX_LABEL }).check();
      await page.getByRole("button", { name: SIGNUP.SUBMIT_BUTTON }).click();
      await expect(page).toHaveURL(new RegExp(ROUTES.REGISTER_OTP));
    });
  });
});
