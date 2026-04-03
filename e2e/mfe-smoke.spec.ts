import { test, expect, type Page } from "@playwright/test";
import { ROUTES } from "./constants/routes";
import { LOGIN, DASHBOARD } from "./constants/selectors";
import { VALID_LOGIN } from "./constants/test-data";

const FALLBACK_MESSAGE = "Sorry, this page is currently unavailable.";
const LOADING_TEXT = "Please wait for a moment";

const MFE_ROUTES: Array<{ name: string; path: string }> = [
  { name: "Active Journeys (alljourneys)", path: "/journeys/active" },
  { name: "Draft Journeys (alljourneys)", path: "/journeys/drafts" },
  { name: "Create Journey (journeybuilder)", path: "/journeys/create" },
  { name: "Email Campaigns (emailcampaigns)", path: "/campaigns/email" },
  { name: "SMS Campaigns (emailcampaigns)", path: "/campaigns/sms" },
  { name: "Segments (segment)", path: "/audience/segments" },
  { name: "Suppression (suppression)", path: "/audience/suppression" },
  { name: "Connect Data (connectdataset)", path: "/data/connect-data" },
  { name: "Pool (pool)", path: "/data-and-sources/pool" },
  { name: "Offers (offerform)", path: "/assets/offers" },
  { name: "Email Templates (emailtemplateform)", path: "/channels/email/templates" },
  { name: "SMS Templates (smstemplateform)", path: "/channels/sms/templates" },
  { name: "SMS SSP Account (smssspaccount)", path: "/channels/sms/sspaccount" },
  { name: "ESP Connections (esptemplate)", path: "/channels/email/connections" },
  { name: "Users & Roles (usersandroles)", path: "/settings/users" },
];

async function ensureLoggedIn(page: Page) {
  await page.route("**/api/v1/login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { token: "fake-jwt-token-for-m10" },
      }),
    })
  );

  await page.goto(ROUTES.LOGIN);
  await page.getByPlaceholder(LOGIN.EMAIL_PLACEHOLDER).fill(VALID_LOGIN.email);
  await page.getByPlaceholder(LOGIN.PASSWORD_PLACEHOLDER).fill(VALID_LOGIN.password);
  await page.getByRole("button", { name: LOGIN.SUBMIT_BUTTON }).click();
  await expect(page).toHaveURL(new RegExp(ROUTES.DASHBOARD_ACTIVE_JOURNEYS));
}

async function expectNotBlankAppSurface(page: Page) {
  // The shell provides a loader and/or fallback when a remote is slow/offline.
  // This ensures we don't silently land on a blank page.
  const loaderOrFallback = page
    .locator(`text=${LOADING_TEXT}`)
    .or(page.locator(`text=${FALLBACK_MESSAGE}`))
    .or(page.locator(DASHBOARD.MFE_LOADING));

  await expect(loaderOrFallback.first()).toBeVisible({ timeout: 15_000 });
}

test.describe("Remote MFEs smoke (M10)", () => {
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

  test("all key MFE routes should render (or fallback) without redirecting to login", async ({
    page,
  }) => {
    await ensureLoggedIn(page);

    for (const r of MFE_ROUTES) {
      await test.step(r.name, async () => {
        await page.goto(r.path);
        await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
        await expectNotBlankAppSurface(page);
        await expect(
          page.getByRole("heading", { name: LOGIN.PAGE_HEADING })
        ).not.toBeVisible();
      });
    }
  });

  test("unknown app route should not show blank page", async ({ page }) => {
    await ensureLoggedIn(page);
    await page.goto("/mfe-non-existing-route");
    await expect(page).not.toHaveURL(new RegExp(ROUTES.LOGIN));
    await expectNotBlankAppSurface(page);
  });
});

