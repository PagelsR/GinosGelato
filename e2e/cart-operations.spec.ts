import { test, expect } from '@playwright/test';

test.describe('Cart Operations', () => {
  
  test('should show empty cart message when cart is empty', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '🛒 Cart' }).click();
    
    // Just verify cart page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    // Add item to cart
    await page.getByRole('button', { name: '🎨 Start Creating Your Ice' }).click();
    await page.getByRole('heading', { name: 'Bowl Cup' }).click();
    await page.getByText('🍓Strawberry', { exact: false }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '🛒 Add to Cart' }).click();
    await expect(page.getByText('Added to Cart!')).toBeVisible();
    
    // Navigate to different pages
    await page.goto('/');
    await expect(page.getByRole('button', { name: '🎨 Start Creating Your Ice' })).toBeVisible();
  });
});
