import { test, expect, Page } from '@playwright/test';

/**
 * Customer Journey 5 — U.S. Shipping Orders.
 *
 * Fills the coverage gap: no other journey exercises the `U.S. Shipping`
 * fulfillment path (the $9.99 shipping fee, the shipping address requirement,
 * and the `Shipping` order persisted to Azure SQL). These produce shipping
 * `OrderCompleted` / `OrderCreated` telemetry so the fulfillment mix is complete.
 *
 * Independently selectable:
 *   npx playwright test e2e/journey-5-shipping-order.spec.ts
 *
 * NOTE: one test in this file — "rejects shipping to a PO Box address" — is an
 * INTENTIONAL, DETERMINISTIC FAILURE. It asserts a business rule (no PO Box
 * shipping) that the app does not yet implement, documenting a real coverage
 * gap rather than a flaky timing issue.
 */

const shipper = {
  firstName: 'Marco',
  lastName: 'Bianchi',
  email: 'marco@ginosgelato.test',
  phone: '555-0177',
  address: '128 Lakeshore Drive',
  city: 'Chicago',
  state: 'IL',
  zip: '60601',
  card: '4111 1111 1111 1111',
  expiry: '10/29',
  cvv: '321',
};

// Build a creation and advance to the Delivery/Shipping step (step 2).
async function buildAndReachFulfillment(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /Start Creating Your Ice/ }).click();
  await page.getByRole('heading', { name: 'Waffle Cone' }).click();
  await page.getByText('Vanilla Dream', { exact: false }).click();
  await page.getByText('Chocolate Fudge', { exact: false }).click();
  await page.locator('div').filter({ hasText: /^🌈Rainbow Sprinkles\+\$0\.50$/ }).first().click();

  await page.getByRole('button', { name: /Add to Cart/ }).click();
  await expect(page.getByText('Added to Cart!')).toBeVisible();
  await page.getByRole('link', { name: /Cart/ }).click();
  await page.getByRole('button', { name: /Proceed to Checkout/ }).click();

  // Step 1: customer info
  await page.getByRole('textbox', { name: 'Enter your first name' }).fill(shipper.firstName);
  await page.getByRole('textbox', { name: 'Enter your last name' }).fill(shipper.lastName);
  await page.getByRole('textbox', { name: 'your@email.com' }).fill(shipper.email);
  await page.getByRole('textbox', { name: '(555) 123-' }).fill(shipper.phone);
  await page.getByRole('button', { name: /Continue to Delivery/ }).click();
}

// Select the U.S. Shipping card by its stable "Continental U.S." copy.
async function selectShipping(page: Page): Promise<void> {
  await page.getByText('Continental U.S.', { exact: false }).click();
}

async function fillShippingAddress(page: Page, address: string = shipper.address): Promise<void> {
  await page.getByRole('textbox', { name: '123 Main Street' }).fill(address);
  await page.getByRole('textbox', { name: 'Your city' }).fill(shipper.city);
  await page.getByRole('textbox', { name: 'MI', exact: true }).fill(shipper.state);
  await page.getByRole('textbox', { name: '12345' }).fill(shipper.zip);
}

test.describe('Journey 5 — U.S. Shipping Orders', () => {
  test('Shipping order completes end-to-end', async ({ page }) => {
    await buildAndReachFulfillment(page);

    // Step 2: U.S. Shipping fulfillment + address
    await selectShipping(page);
    await fillShippingAddress(page);
    await page.getByRole('button', { name: /Continue to Payment/ }).click();

    // Step 3: payment
    await page.getByRole('textbox', { name: 'John Doe' }).fill(`${shipper.firstName} ${shipper.lastName}`);
    await page.getByRole('textbox', { name: '5678 9012 3456' }).fill(shipper.card);
    await page.getByRole('textbox', { name: 'MM/YY' }).fill(shipper.expiry);
    await page.getByRole('textbox', { name: '123', exact: true }).fill(shipper.cvv);
    await page.getByRole('button', { name: /Complete Order/ }).click();

    // Confirmation, including the shipping-specific copy
    await expect(page.getByText('Order Confirmed!')).toBeVisible();
    await expect(page.getByText(/GG\d{6}-\d{5}/)).toBeVisible();
    await expect(page.getByText(/ship within 1 business day and arrive in 2-5 days/)).toBeVisible();
  });

  test('Shipping fee of $9.99 appears in the order summary', async ({ page }) => {
    await buildAndReachFulfillment(page);
    await selectShipping(page);
    await fillShippingAddress(page);
    await page.getByRole('button', { name: /Continue to Payment/ }).click();

    // The order summary on the payment step lists the shipping fee line.
    const summary = page.getByText('📋 Order Summary').locator('..');
    await expect(summary.getByText('Shipping:')).toBeVisible();
    await expect(summary.getByText('$9.99')).toBeVisible();
  });

  test('Shipping requires a complete address before continuing', async ({ page }) => {
    await buildAndReachFulfillment(page);
    await selectShipping(page);

    const continueButton = page.getByRole('button', { name: /Continue to Payment/ });
    // Address fields are empty -> cannot proceed.
    await expect(continueButton).toBeDisabled();

    await fillShippingAddress(page);
    // Complete address -> can proceed.
    await expect(continueButton).toBeEnabled();
  });

  test('rejects shipping to a PO Box address', async ({ page }) => {
    // INTENTIONAL, DETERMINISTIC FAILURE — documents a missing business rule.
    // The app should refuse shipping to PO Boxes, but no such validation exists,
    // so this expectation fails on purpose (fast timeout, not flaky).
    await buildAndReachFulfillment(page);
    await selectShipping(page);
    await fillShippingAddress(page, 'PO Box 1234');
    await page.getByRole('button', { name: /Continue to Payment/ }).click();

    await expect(
      page.getByText(/cannot ship to (a )?PO Box|PO Boxes are not|P\.O\. Box/i),
      'App should reject shipping to a PO Box, but no such validation exists yet.'
    ).toBeVisible({ timeout: 5000 });
  });
});
