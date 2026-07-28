import { test, expect } from '@playwright/test';

/**
 * Customer Journey 1 — Happy Path Pickup Order.
 *
 * Home -> Builder (container + flavors + toppings) -> Cart -> Checkout (pickup)
 * -> order confirmation. Produces clean success telemetry: page views, route
 * changes, the `IceCreamCreated` / `CheckoutStarted` / `OrderCompleted` custom
 * events, the API `POST /api/orders` dependency, and the server `OrderCreated`
 * business event — all correlated by operation id.
 *
 * Independently selectable: `npx playwright test e2e/journey-1-happy-path-pickup.spec.ts`
 */

const customer = {
  firstName: 'Gino',
  lastName: 'Gelato',
  email: 'gino@ginosgelato.test',
  phone: '555-0100',
  card: '4111 1111 1111 1111',
  expiry: '12/30',
  cvv: '123',
};

test.describe('Journey 1 — Happy Path Pickup Order', () => {
  // Extended timeout: this test runs against the live deployed app and must
  // survive Azure App Service cold starts, which can take 30–60 seconds.
  test.setTimeout(90_000);

  test('Pickup order completes end-to-end', async ({ page }) => {
    await page.goto('/');

    // Home -> Builder
    await page.getByRole('button', { name: /Start Creating Your Ice/ }).click();

    // Builder: container + two catalog flavors + a topping
    await page.getByRole('heading', { name: 'Waffle Cone' }).click();
    await page.getByText('Vanilla Dream', { exact: false }).click();
    await page.getByText('Chocolate Fudge', { exact: false }).click();
    await page.locator('div').filter({ hasText: /^🌈Rainbow Sprinkles\+\$0\.50$/ }).first().click();

    // Add to cart -> Cart -> Checkout
    await page.getByRole('button', { name: /Add to Cart/ }).click();
    await expect(page.getByText('Added to Cart!')).toBeVisible();
    await page.getByRole('link', { name: /Cart/ }).click();
    await page.getByRole('button', { name: /Proceed to Checkout/ }).click();

    // Step 1: customer info
    await page.getByRole('textbox', { name: 'Enter your first name' }).fill(customer.firstName);
    await page.getByRole('textbox', { name: 'Enter your last name' }).fill(customer.lastName);
    await page.getByRole('textbox', { name: 'your@email.com' }).fill(customer.email);
    await page.getByRole('textbox', { name: '(555) 123-' }).fill(customer.phone);
    await page.getByRole('button', { name: /Continue to Delivery/ }).click();

    // Step 2: pickup fulfillment
    await page.getByText('Store Pickup', { exact: false }).click();
    await page.getByRole('button', { name: /Continue to Payment/ }).click();

    // Step 3: payment
    await page.getByRole('textbox', { name: 'John Doe' }).fill(`${customer.firstName} ${customer.lastName}`);
    await page.getByRole('textbox', { name: '5678 9012 3456' }).fill(customer.card);
    await page.getByRole('textbox', { name: 'MM/YY' }).fill(customer.expiry);
    await page.getByRole('textbox', { name: '123', exact: true }).fill(customer.cvv);
    await page.getByRole('button', { name: /Complete Order/ }).click();

    // Confirmation: persisted order returns a GGyyMMdd-##### confirmation number
    await expect(page.getByText('Order Confirmed!')).toBeVisible();
    await expect(page.getByText(/GG\d{6}-\d{5}/)).toBeVisible();
  });
});
