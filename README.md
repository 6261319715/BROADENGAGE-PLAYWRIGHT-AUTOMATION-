# Playwright Automation

This project now generates two reports after every test run:

- HTML report on `http://localhost:9323` (Playwright default report UI)
- Developer-friendly full execution file: `test-results/test-execution-summary.md`

## Full Test Execution Summary

The file `test-results/test-execution-summary.md` is generated automatically by a custom reporter.

It includes, for each test case (passed and failed):

- Final status (`passed`, `failed`, `flaky`, `skipped/other`)
- Project/browser name
- File path with line and column
- Attempt details (retry number + duration for each attempt)
- Error message and stack trace (when present)
- Trace files with ready-to-run command (`npx playwright show-trace "<trace.zip>"`)
- Screenshots and videos
- Other attached artifacts
- Captured `stdout` / `stderr` (if available)

The report also includes a top summary with total count of passed, failed, flaky, and skipped test cases.

## How to Run

Run all tests:

```bash
npx playwright test
```

After the run:

- Open HTML report:

```bash
npx playwright show-report
```

- Open full execution summary file:

```bash
test-results/test-execution-summary.md
```

## Reporter Configuration

Configured in `playwright.config.js`:

- `html` reporter for visual report
- `./failed-test-summary-reporter.js` for full markdown execution summary
