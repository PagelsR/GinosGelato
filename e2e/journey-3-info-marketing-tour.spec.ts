import { test, expect } from '@playwright/test';

/**
 * Customer Journey 3 — Info / Marketing Tour.
 *
 * About -> Flavors -> Locations -> Catering. Generates route-change and
 * page-view telemetry across the informational pages without placing an order.
 *
 * Independently selectable: `npx playwright test e2e/journey-3-info-marketing-tour.spec.ts`
 */

test.describe('Journey 3 — Info / Marketing Tour', () => {
  test('Visitor tours the informational pages', async ({ page }) => {
    await page.goto('/');

    // About
    await page.getByRole('link', { name: 'About Us' }).click();
    await expect(page.getByRole('heading', { name: "About Gino's Gelato" })).toBeVisible();

    // Flavors
    await page.getByRole('link', { name: 'Our Flavors' }).click();
    await expect(page.getByRole('heading', { name: 'Our Flavors' })).toBeVisible();

    // Locations
    await page.getByRole('link', { name: 'Locations' }).click();
    await expect(page.getByRole('heading', { name: 'Locations' })).toBeVisible();

    // Catering
    await page.getByRole('link', { name: 'Catering' }).click();
    await expect(page.getByRole('heading', { name: 'Catering' })).toBeVisible();
  });
});
