import { test, expect } from '@playwright/test';

/**
 * Customer Journey 4 — Fault Demo Journey.
 *
 * Drives the feature-flagged, deterministic demo faults so failed-dependency
 * and exception telemetry appear in Application Insights on demand. Each fault
 * is exercised through the `/fault` console via its `?fault=` selector.
 *
 * Faults are disabled by default; these tests opt in explicitly. Each fault is
 * an independently selectable test:
 *   npx playwright test e2e/journey-4-fault-demo.spec.ts -g "slow SQL"
 *   npx playwright test e2e/journey-4-fault-demo.spec.ts -g "API failure"
 *   npx playwright test e2e/journey-4-fault-demo.spec.ts -g "browser exception"
 */

test.describe('Journey 4 — Fault Demo Journey', () => {
  // Extended timeout: this test runs against the live deployed app and must
  // survive Azure App Service cold starts plus the deliberate ~3s SQL delay.
  test.setTimeout(90_000);

  test('slow SQL dependency fault emits telemetry', async ({ page }) => {
    await page.goto('/fault?fault=slow-sql');

    const status = page.getByTestId('fault-status');
    await expect(status).toHaveAttribute('data-fault', 'slow-sql');
    // The deliberate SQL delay is ~3s; allow generous headroom for the deployed API.
    await expect(status).toHaveAttribute('data-state', 'completed', { timeout: 20000 });
    await expect(status).toContainText(/slow-sql .* completed/);
  });

  test('API failure fault emits failed-request telemetry', async ({ page }) => {
    await page.goto('/fault?fault=api-failure');

    const status = page.getByTestId('fault-status');
    await expect(status).toHaveAttribute('data-fault', 'api-failure');
    await expect(status).toHaveAttribute('data-state', 'failed', { timeout: 20000 });
    await expect(status).toContainText(/api-failure .* failed as expected/);
  });

  test('SQL failure fault emits failed-dependency telemetry', async ({ page }) => {
    await page.goto('/fault?fault=sql-failure');

    const status = page.getByTestId('fault-status');
    await expect(status).toHaveAttribute('data-fault', 'sql-failure');
    await expect(status).toHaveAttribute('data-state', 'failed', { timeout: 20000 });
    await expect(status).toContainText(/sql-failure .* failed as expected/);
  });

  test('browser exception fault emits exception telemetry', async ({ page }) => {
    // The page deliberately raises an unhandled browser exception; capture it so
    // it does not fail the test while still being auto-collected by App Insights.
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await page.goto('/fault?fault=browser-exception');

    const status = page.getByTestId('fault-status');
    await expect(status).toHaveAttribute('data-fault', 'browser-exception');
    await expect(status).toContainText(/browser-exception .* thrown/);

    await expect
      .poll(() => pageErrors.some((e) => e.name === 'DemoBrowserException'), { timeout: 10000 })
      .toBe(true);
  });
});
