---
name: ginos-gelato-playwright
description: Write Playwright end-to-end tests for the Gino's Gelato app. USE FOR authoring, editing, or fixing Playwright specs in the e2e/ folder. DO NOT USE FOR non-test code, backend/API changes, or infrastructure.
---

# Gino's Gelato — Playwright Tests

Author reliable, stable Playwright E2E tests for the ordering web app.

## Where Tests Live
- Specs go in `e2e/` as `*.spec.ts` (config `testDir: './e2e'`).
- Config: `playwright.config.ts` — Chromium only, `fullyParallel`, `baseURL` from `BASE_URL` env (falls back to the deployed Static Web App).

## Conventions
- Start each spec with `import { test, expect } from '@playwright/test';`.
- Group related tests with `test.describe(...)`.
- Navigate with relative paths: `await page.goto('/')` — never hardcode the host.
- Prefer **role-based, web-first (auto-waiting) locators**:
  `getByRole('button', { name: /Add to Cart/ })`, `getByRole('heading', { name: 'Waffle Cone' })`.
- Assert with web-first assertions: `await expect(locator).toBeVisible()`.
- Use catalog values that exist in the seeded data (e.g. flavors `Vanilla Dream`, `Chocolate Fudge`) so the API accepts orders.

## Stability Rules (avoid flakiness)
- No fixed waits (`waitForTimeout`), no random timing — rely on auto-waiting locators.
- For the CVV field, use `getByRole('textbox', { name: '123', exact: true })` — NOT `getByPlaceholder('123')`, which also matches the card-number field.
- Keep tests independent and idempotent; do not depend on other specs' state.

## Run
- All tests: `npx playwright test`
- One file: `npx playwright test e2e/happy-path.spec.ts`
- Set `PLAYWRIGHT_HTML_OPEN=never` locally so a failed run does not hang serving the HTML report.

## Validate Before Done
Run the target spec(s) and confirm they pass before declaring work complete.
