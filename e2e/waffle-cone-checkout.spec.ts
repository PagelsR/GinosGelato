import { test, expect } from '@playwright/test';

const customer = {
  firstName: 'Gino',
  lastName: 'Gelato',
  email: 'gino.gelato@example.com',
  phone: '5551234567',
  cardName: 'Gino Gelato',
  cardNumber: '4111 1111 1111 1111',
  expiry: '12/26',
  cvv: '456',
};

test('Waffle cone with 2 flavors and 2 toppings – cart verification and checkout', async ({ page }) => {
  // Navigate to home via baseURL
  await page.goto('/');

  // Start building
  await page.getByRole('button', { name: '🎨 Start Creating Your Ice' }).click();

  // Select Waffle Cone container
  await page.getByRole('heading', { name: 'Waffle Cone' }).click();

  // Select 2 flavors
  await page.getByText('🍪Cookies & CreamCrushed Oreo').click();
  await page.getByText('🧈Salted CaramelSweet caramel').click();

  // Select 2 toppings
  await page.locator('div').filter({ hasText: /^☕Hot Fudge\+\$0\.75$/ }).first().click();
  await page.locator('div').filter({ hasText: /^🌈Rainbow Sprinkles\+\$0\.50$/ }).first().click();

  // Add to cart
  await page.getByRole('button', { name: '🛒 Add to Cart' }).click();
  await expect(page.getByText('Added to Cart!')).toBeVisible();

  // Navigate to cart and verify contents
  await page.getByRole('link', { name: '🛒 Cart' }).click();
  await expect(page.getByText('Waffle Cone')).toBeVisible();
  await expect(page.getByText('Cookies & Cream')).toBeVisible();
  await expect(page.getByText('Salted Caramel')).toBeVisible();
  await expect(page.getByText('Hot Fudge')).toBeVisible();
  await expect(page.getByText('Rainbow Sprinkles')).toBeVisible();

  // Proceed to checkout
  await page.getByRole('button', { name: '💳 Proceed to Checkout' }).click();

  // Step 1: Customer info
  await page.getByRole('textbox', { name: 'Enter your first name' }).fill(customer.firstName);
  await page.getByRole('textbox', { name: 'Enter your last name' }).fill(customer.lastName);
  await page.getByRole('textbox', { name: 'your@email.com' }).fill(customer.email);
  await page.getByRole('textbox', { name: '(555) 123-' }).fill(customer.phone);
  await page.getByRole('button', { name: 'Continue to Delivery →' }).click();

  // Step 2: Delivery – choose store pickup
  await page.getByText('🏪Store PickupReady in 15').click();
  await page.getByRole('button', { name: 'Continue to Payment →' }).click();

  // Step 3: Payment
  await page.getByRole('textbox', { name: 'John Doe' }).fill(customer.cardName);
  await page.getByRole('textbox', { name: '5678 9012 3456' }).fill(customer.cardNumber);
  await page.getByRole('textbox', { name: 'MM/YY' }).fill(customer.expiry);
  // Use exact: true to avoid matching the card number placeholder
  await page.getByRole('textbox', { name: '123', exact: true }).fill(customer.cvv);
  await page.getByRole('button', { name: /💳 Complete Order/ }).click();

  // Confirm order success
  await expect(page.getByRole('heading', { name: 'Order Confirmed!' })).toBeVisible();
  await expect(page.getByText(/Order #GG\d+/)).toBeVisible();
});
