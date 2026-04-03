import { test, expect } from "@playwright/test";

type Method = "GET" | "POST";

async function expectMethodNotAllowed(
  request: Parameters<typeof test>[0] extends any ? any : never,
  path: string,
  method: Method,
  expectedAllow: Method[]
) {
  const res =
    method === "GET" ? await request.get(path) : await request.post(path);

  expect(res.status(), `${method} ${path} should be 405`).toBe(405);

  const allowHeader =
    res.headers()["allow"] ??
    res.headers()["Allow"] ??
    "";

  for (const allowed of expectedAllow) {
    expect(
      allowHeader,
      `Allow header for ${path} should include ${allowed}`
    ).toContain(allowed);
  }
}

test.describe("Auth API contract (M8)", () => {
  test.describe("Method guards (405 + Allow)", () => {
    test("POST-only routes should reject GET with 405", async ({ request }) => {
      await expectMethodNotAllowed(request, "/api/v1/login", "GET", ["POST"]);
      await expectMethodNotAllowed(request, "/api/v1/register", "GET", ["POST"]);
      await expectMethodNotAllowed(request, "/api/v1/sendOtp", "GET", ["POST"]);
      await expectMethodNotAllowed(request, "/api/v1/sendOtpEmail", "GET", [
        "POST",
      ]);
      await expectMethodNotAllowed(request, "/api/v1/verifyOtp", "GET", ["POST"]);
      await expectMethodNotAllowed(request, "/api/v1/resetNewPassword", "GET", [
        "POST",
      ]);
    });

    test("GET-only route should reject POST with 405", async ({ request }) => {
      await expectMethodNotAllowed(request, "/api/v1/user/me", "POST", ["GET"]);
    });
  });

  test.describe("Authentication requirements", () => {
    test("GET /api/v1/user/me without token should return 401", async ({
      request,
    }) => {
      const res = await request.get("/api/v1/user/me");
      expect(res.status()).toBe(401);

      const body = await res.json().catch(() => null);
      expect(body).not.toBeNull();
      expect(JSON.stringify(body)).toMatch(/No token provided|authenticate|token/i);
    });

    test("GET /api/v1/user/me with invalid token should be unauthorized", async ({
      request,
    }) => {
      const res = await request.get("/api/v1/user/me", {
        headers: { Authorization: "Bearer invalid-token" },
      });
      expect([401, 403]).toContain(res.status());
    });
  });
});

