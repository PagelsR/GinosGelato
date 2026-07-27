import { test, expect } from '@playwright/test';

/**
 * Customer Journey 2 — Delivery Order Browse-to-Buy.
 *
 * Our Flavors -> Builder -> Cart -> Checkout (local delivery) -> order
 * confirmation. Adds page-view breadth (the marketing Flavors page) and a
 * second checkout path (delivery), producing route-change telemetry plus the
 * delivery `OrderCompleted` custom event and a `Delivery` server `OrderCreated`.
 *
 * Independently selectable: `npx playwright test e2e/journey-2-delivery-browse-to-buy.spec.ts`
 */

const customer = {
  firstName: 'Bella',
  lastName: 'Rossi',
  email: 'bella@ginosgelato.test',
  phone: '555-0142',
  address: '742 Evergreen Terrace',
  city: 'Springfield',
  state: 'IL',
  zip: '62704',
  card: '4242 4242 4242 4242',
  expiry: '11/29',
  cvv: '456',
};

test.describe('Journey 2 — Delivery Order Browse-to-Buy', () => {
  test('Delivery order completes end-to-end', async ({ page }) => {
    await page.goto('/');

    // Browse the marketing Flavors page first (route-change + page-view breadth)
    await page.getByRole('link', { name: 'Our Flavors' }).click();
    await expect(page.getByRole('heading', { name: 'Our Flavors' })).toBeVisible();

    // Head to the Builder and craft a creation
    await page.getByRole('link', { name: /Build Ice Cream/ }).click();
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

    // Step 2: local delivery fulfillment + address. Select the delivery card by
    // its stable "30-45 minutes" copy (robust to the card's display name).
    await page.getByText('30-45 minutes').click();
    await page.getByRole('textbox', { name: '123 Main Street' }).fill(customer.address);
    await page.getByRole('textbox', { name: 'Your city' }).fill(customer.city);
    await page.getByRole('textbox', { name: 'MI', exact: true }).fill(customer.state);
    await page.getByRole('textbox', { name: '12345' }).fill(customer.zip);
    await page.getByRole('button', { name: /Continue to Payment/ }).click();

    // Step 3: payment
    await page.getByRole('textbox', { name: 'John Doe' }).fill(`${customer.firstName} ${customer.lastName}`);
    await page.getByRole('textbox', { name: '5678 9012 3456' }).fill(customer.card);
    await page.getByRole('textbox', { name: 'MM/YY' }).fill(customer.expiry);
    await page.getByRole('textbox', { name: '123', exact: true }).fill(customer.cvv);
    await page.getByRole('button', { name: /Complete Order/ }).click();

    // Confirmation
    await expect(page.getByText('Order Confirmed!')).toBeVisible();
    await expect(page.getByText(/GG\d{6}-\d{5}/)).toBeVisible();
  });
});
