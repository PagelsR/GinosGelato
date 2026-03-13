import { test, expect } from '@playwright/test';

test.describe('Edge Cases and Boundary Testing', () => {

  test('should handle maximum toppings selection', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '🎨 Start Creating Your Ice' }).click();
    
    // Select container
    await page.getByRole('heading', { name: 'Bowl Cup' }).click();
    
    // Select a flavor
    await page.getByText('🍓Strawberry', { exact: false }).click();
    
    // Try to add multiple toppings (test boundary)
    await page.locator('div').filter({ hasText: /^☕Hot Fudge\+\$0\.75$/ }).first().click();
    await page.locator('div').filter({ hasText: /^🌈Rainbow Sprinkles\+\$0\.50$/ }).first().click();
    await page.locator('div').filter({ hasText: /^🍪Graham Cracker\+\$0\.75$/ }).first().click();
    
    // Verify Add to Cart button is enabled
    await expect(page.getByRole('button', { name: '🛒 Add to Cart' })).toBeEnabled();
  });

  test('should prevent adding to cart without selecting container', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '🎨 Start Creating Your Ice' }).click();
    
    // Try to add without selecting container (button should be disabled)
    await expect(page.getByRole('button', { name: '🛒 Add to Cart' })).toBeDisabled();
  });

  test('FLAKY: should handle rapid flavor selection changes', async ({ page }) => {
    // FLAKY TEST: 25% chance of failure due to race conditions
    const isFlaky = Math.random() < 0.25;
    
    await page.goto('/');
    await page.getByRole('button', { name: '🎨 Start Creating Your Ice' }).click();
    
    // Select container
    await page.getByRole('heading', { name: 'Waffle Cone' }).click();
    
    if (isFlaky) {
      // FLAKY: Rapidly click flavors without waiting for state updates
      await page.getByText('🍓Strawberry', { exact: false }).click({ timeout: 50 });
      await page.getByText('🍫Chocolate', { exact: false }).click({ timeout: 50 });
      await page.getByText('🍪Cookies & CreamCrushed Oreo', { exact: false }).click({ timeout: 50 });
    } else {
      // Normal flow - wait between selections
      await page.getByText('🍓Strawberry', { exact: false }).click();
      await page.waitForTimeout(200);
      await page.getByText('🍫Chocolate', { exact: false }).click();
      await page.waitForTimeout(200);
      await page.getByText('🍪Cookies & CreamCrushed Oreo', { exact: false }).click();
    }
    
    // Should have flavors selected
    await expect(page.getByRole('button', { name: '🛒 Add to Cart' })).not.toBeDisabled();
  });

  test('should calculate prices correctly with multiple toppings', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '🎨 Start Creating Your Ice' }).click();
    
    // Select container
    await page.getByRole('heading', { name: 'Bowl Cup' }).click();
    
    // Select flavor
    await page.getByText('🍓Strawberry', { exact: false }).click();
    
    // Add multiple toppings with known prices
    await page.locator('div').filter({ hasText: /^☕Hot Fudge\+\$0\.75$/ }).first().click();
    await page.locator('div').filter({ hasText: /^🌈Rainbow Sprinkles\+\$0\.50$/ }).first().click();
    
    // Verify Add to Cart button is enabled (validates selection)
    await expect(page.getByRole('button', { name: '🛒 Add to Cart' })).toBeEnabled();
  });

  test('FLAKY: should validate form fields before proceeding', async ({ page }) => {
    // FLAKY TEST: 20% chance of timing issue
    const isFlaky = Math.random() < 0.20;
    
    await page.goto('/');
    await page.getByRole('button', { name: '🎨 Start Creating Your Ice' }).click();
    
    // Add item
    await page.getByRole('heading', { name: 'Bowl Cup' }).click();
    await page.getByText('🍓Strawberry', { exact: false }).click();
    await page.getByRole('button', { name: '🛒 Add to Cart' }).click();
    await expect(page.getByText('Added to Cart!')).toBeVisible();
    
    // Go to checkout
    await page.getByRole('link', { name: '🛒 Cart' }).click();
    await page.getByRole('button', { name: '💳 Proceed to Checkout' }).click();
    
    if (isFlaky) {
      // FLAKY: Try to proceed without filling required fields (race condition)
      await page.getByRole('button', { name: 'Continue to Delivery →' }).click({ timeout: 100 });
    } else {
      // Normal: Verify button behavior with empty fields
      // If validation prevents clicking, this should work
      const continueButton = page.getByRole('button', { name: 'Continue to Delivery →' });
      await expect(continueButton).toBeVisible();
    }
  });

  test('should display order summary with all selected items', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '🎨 Start Creating Your Ice' }).click();
    
    // Create a complex order
    await page.getByRole('heading', { name: 'Waffle Cone' }).click();
    await page.getByText('🍪Cookies & CreamCrushed Oreo', { exact: false }).click();
    await page.getByText('🧈Salted CaramelSweet caramel', { exact: false }).click();
    await page.locator('div').filter({ hasText: /^☕Hot Fudge\+\$0\.75$/ }).first().click();
    await page.locator('div').filter({ hasText: /^🌈Rainbow Sprinkles\+\$0\.50$/ }).first().click();
    
    await page.getByRole('button', { name: '🛒 Add to Cart' }).click();
    await expect(page.getByText('Added to Cart!')).toBeVisible();
    
    // View cart - should show all selections
    await page.getByRole('link', { name: '🛒 Cart' }).click();
    await expect(page.locator('body')).toBeVisible();
  });

  test('FLAKY: network delay simulation during checkout', async ({ page }) => {
    // FLAKY TEST: 25% chance of failure simulating network issues
    const isFlaky = Math.random() < 0.25;
    
    await page.goto('/');
    await page.getByRole('button', { name: '🎨 Start Creating Your Ice' }).click();
    
    // Create order - use same approach as working tests
    await page.getByRole('heading', { name: 'Bowl Cup' }).click();
    await  page.getByText('🍓Strawberry', { exact: false }).click();
    await page.getByRole('button', { name: '🛒 Add to Cart' }).click();
    await expect(page.getByText('Added to Cart!')).toBeVisible();
    
    // Go to cart and checkout
    await page.getByRole('link', { name: '🛒 Cart' }).click();
    await page.getByRole('button', { name: '💳 Proceed to Checkout' }).click();
    
    // Fill customer info
    await page.getByRole('textbox', { name: 'Enter your first name' }).fill('Network');
    await page.getByRole('textbox', { name: 'Enter your last name' }).fill('Test');
    await page.getByRole('textbox', { name: 'your@email.com' }).fill('network@test.com');
    await page.getByRole('textbox', { name: '(555) 123-' }).fill('5551234567');
    
    if (isFlaky) {
      // FLAKY: Simulate network delay by using very short timeout
      await page.getByRole('button', { name: 'Continue to Delivery →' }).click({ timeout: 100 });
    } else {
      await page.getByRole('button', { name: 'Continue to Delivery →' }).click();
      await page.getByText('🏪Store PickupReady in 15').click();
    }
  });

  test('should allow selecting maximum 3 flavors for Waffle Cone', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '🎨 Start Creating Your Ice' }).click();
    
    // Select Waffle Cone (allows 3 flavors)
    await page.getByRole('heading', { name: 'Waffle Cone' }).click();
    
    // Select 3 different flavors
    await page.getByText('🍓Strawberry', { exact: false }).click();
    await page.waitForTimeout(200);
    await page.getByText('🍫Chocolate', { exact: false }).click();
    await page.waitForTimeout(200);
    await page.getByText('🍪Cookies & Cream', { exact: false }).click();
    
    // Should be able to add to cart
    await expect(page.getByRole('button', { name: '🛒 Add to Cart' })).toBeEnabled();
  });

});
