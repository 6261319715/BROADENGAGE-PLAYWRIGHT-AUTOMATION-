# How Allure Report Is Connected to Your Tests

## 1. Connection (already done)

Allure is connected in **playwright.config.js** via the reporter:

```js
reporter: [
  ['html', { open: 'always' }],
  ['allure-playwright'],   // ← writes results to allure-results/
  // ...
],
```

When you run **any** Playwright test, this reporter automatically:
- Writes results to the **`allure-results/`** folder
- Captures test name, status (pass/fail), duration
- Attaches screenshots, traces, and videos on failure (from your `use` options)

No extra code is required in your tests for basic Allure reporting.

---

## 2. Run tests and open the report

**Step 1 – Run tests (this fills `allure-results/`):**
```bash
npm run test
# or
npx playwright test
```

**Step 2 – Generate and open the Allure report:**
```bash
npm run allure:generate
npm run allure:open
```

**Or do both in one go:**
```bash
npm run test:allure
```
(Runs tests, then generates and opens the report.)

---

## 3. Optional: add steps in tests (nicer Allure report)

Use Playwright’s **`test.step()`** inside your tests. Allure will show these as steps in the report:

```ts
import { test, expect } from '@playwright/test';

test('example with steps', async ({ page }) => {
  await test.step('Open register page', async () => {
    await page.goto('https://demo.broadengage.com/auth/register');
  });
  await test.step('Fill and submit form', async () => {
    await page.getByRole('textbox', { name: /full name/i }).fill('John');
    await page.getByRole('button', { name: 'Sign Up' }).click();
  });
  await test.step('Verify validation', async () => {
    await expect(page.getByText('Email is required')).toBeVisible();
  });
});
```

---

## Summary

| What                    | How it’s connected                         |
|-------------------------|--------------------------------------------|
| Test results → Allure   | `reporter: ['allure-playwright']` in config |
| Results folder          | `allure-results/` (created when tests run)  |
| View report             | `npm run allure:generate` then `npm run allure:open` |
| Richer report           | Use `test.step('...', async () => { ... })` in tests |

Requirement: **Java 8+** for the Allure CLI (used by `allure:generate` and `allure:open`).
