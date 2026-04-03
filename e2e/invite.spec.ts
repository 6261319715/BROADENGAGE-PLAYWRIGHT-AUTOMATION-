import { test, expect } from "@playwright/test";
import { ROUTES } from "./constants/routes";
import { INVITE } from "./constants/selectors";
import { LOGIN } from "./constants/selectors";

const VALID_INVITE_TOKEN = "test-invite-token-abc123";
const INVALID_INVITE_TOKEN = "invalid-or-expired-token";

test.describe("Invite Page (M7)", () => {
  test.describe("Access and routing", () => {
    test("invite page loads without requiring login", async ({ page }) => {
      await page.goto(`${ROUTES.INVITE}/${VALID_INVITE_TOKEN}`);
      await expect(page).toHaveURL(new RegExp(`${ROUTES.INVITE}/${VALID_INVITE_TOKEN}`));
      await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    });

    test("invite URL with token is accessible and does not redirect to login", async ({
      page,
    }) => {
      await page.goto(`${ROUTES.INVITE}/${VALID_INVITE_TOKEN}`);
      await expect(page).toHaveURL(new RegExp(`${ROUTES.INVITE}/`));
      await expect(page).not.toHaveURL(ROUTES.LOGIN);
    });

    test("invite page does not show login form (shell renders invite, not auth)", async ({
      page,
    }) => {
      await page.goto(`${ROUTES.INVITE}/${VALID_INVITE_TOKEN}`);
      await expect(
        page.getByRole("heading", { name: LOGIN.PAGE_HEADING })
      ).not.toBeVisible();
    });
  });

  test.describe("Different token values", () => {
    test("page loads with invalid token (remote may show error; shell still serves invite route)", async ({
      page,
    }) => {
      await page.goto(`${ROUTES.INVITE}/${INVALID_INVITE_TOKEN}`);
      await expect(page).toHaveURL(new RegExp(`${ROUTES.INVITE}/${INVALID_INVITE_TOKEN}`));
      await expect(page).not.toHaveURL(ROUTES.LOGIN);
    });

    test("invite route with token segment is under /invite/", async ({
      page,
    }) => {
      await page.goto(`${ROUTES.INVITE}/any-token-123`);
      expect(page.url()).toContain(INVITE.PATH_PREFIX);
    });

    test("invite route supports query params without auth redirect", async ({
      page,
    }) => {
      await page.goto(`${ROUTES.INVITE}/${VALID_INVITE_TOKEN}?source=email`);
      await expect(page).toHaveURL(/source=email/);
      await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    });
  });
});
