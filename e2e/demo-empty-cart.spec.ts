import { test, expect } from '@playwright/test';

test.describe('Demo — Empty Cart', () => {
  test('shows the empty-cart state when opening the cart directly', async ({ page }) => {
    await page.goto('/cart');

    await expect(page.getByRole('heading', { name: 'Your cart is empty!' })).toBeVisible();
  });
});
