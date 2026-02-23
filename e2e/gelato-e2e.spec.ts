import { test, expect } from '@playwright/test';

// Disney-themed test data
const disneyCustomers = [
  {
    firstName: 'Mickey',
    lastName: 'Mouse',
    email: 'mickey.mouse@disney.com',
    phone: '555-1930',
    card: '4111 1111 1111 1111',
    address: '1 Disney Lane',
    city: 'Orlando',
    state: 'FL',
    zip: '32830',
  },
  {
    firstName: 'Elsa',
    lastName: 'Arendelle',
    email: 'elsa@disney.com',
    phone: '555-2013',
    card: '4242 4242 4242 4242',
    address: '2 Ice Castle',
    city: 'Arendelle',
    state: 'CO',
    zip: '80000',
  }
];

test('Waffle Cone order with checkout', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '🎨 Start Creating Your Ice' }).click();
  await page.getByRole('heading', { name: 'Waffle Cone' }).click();
  await page.getByText('🍪Cookies & CreamCrushed Oreo').click();
  await page.getByText('🧈Salted CaramelSweet caramel').click();
  await page.locator('div').filter({ hasText: /^☕Hot Fudge\+\$0\.75$/ }).first().click();
  await page.locator('div').filter({ hasText: /^🌈Rainbow Sprinkles\+\$0\.50$/ }).first().click();
  await page.locator('div').filter({ hasText: /^🍪Graham Cracker\+\$0\.75$/ }).first().click();
  // Add to cart
  await page.getByRole('button', { name: '🛒 Add to Cart' }).click();
  // Wait for item to be added and navigate to cart
  await expect(page.getByText('Added to Cart!')).toBeVisible();
  await page.getByRole('link', { name: '🛒 Cart' }).click();
  // Proceed to checkout
  await page.getByRole('button', { name: '💳 Proceed to Checkout' }).click();
  // Fill customer info
  await page.getByRole('textbox', { name: 'Enter your first name' }).fill(disneyCustomers[0].firstName);
  await page.getByRole('textbox', { name: 'Enter your last name' }).fill(disneyCustomers[0].lastName);
  await page.getByRole('textbox', { name: 'your@email.com' }).fill(disneyCustomers[0].email);
  await page.getByRole('textbox', { name: '(555) 123-' }).fill(disneyCustomers[0].phone);
  
  // Continue to next step
  await page.getByRole('button', { name: 'Continue to Delivery →' }).click();
  
  // Select pickup method
  await page.getByText('🏪Store PickupReady in 15').click();
  
  // Continue to payment
  await page.getByRole('button', { name: 'Continue to Payment →' }).click();
  
  // Fill payment info
  await page.getByRole('textbox', { name: 'John Doe' }).fill(`${disneyCustomers[0].firstName} ${disneyCustomers[0].lastName}`);
  await page.getByRole('textbox', { name: '5678 9012 3456' }).fill(disneyCustomers[0].card);
  await page.getByRole('textbox', { name: 'MM/YY' }).fill('12/25');
  await page.getByRole('textbox', { name: '123', exact: true }).fill('456');
  await page.getByRole('button', { name: /💳 Complete Order/ }).click();
  // Confirm order
  await expect(page.getByText('Order Confirmed!')).toBeVisible();
  await expect(page.getByText(/Order #GG\d+/)).toBeVisible(); // Order number pattern
});

test('Bowl Cup order with checkout', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '🎨 Start Creating Your Ice' }).click();
  
  // Select Bowl Cup container
  await page.getByRole('heading', { name: 'Bowl Cup' }).click();
  
  // Select 2 flavors - use simpler text matching
  await page.getByText('🍓Strawberry', { exact: false }).click();
  await page.getByText('🍫Chocolate', { exact: false }).click();
  
  // Add 4 toppings (any)
  await page.locator('div').filter({ hasText: /^☕Hot Fudge\+\$0\.75$/ }).first().click();
  await page.locator('div').filter({ hasText: /^🌈Rainbow Sprinkles\+\$0\.50$/ }).first().click();
  await page.locator('div').filter({ hasText: /^🍪Graham Cracker\+\$0\.75$/ }).first().click();
  
  // Add to cart
  await page.getByRole('button', { name: '🛒 Add to Cart' }).click();
  
  // Wait for item to be added and navigate to cart
  await expect(page.getByText('Added to Cart!')).toBeVisible();
  await page.getByRole('link', { name: '🛒 Cart' }).click();
  
  // Proceed to checkout
  await page.getByRole('button', { name: '💳 Proceed to Checkout' }).click();
  
  // Fill customer info (Step 1)
  await page.getByRole('textbox', { name: 'Enter your first name' }).fill(disneyCustomers[1].firstName);
  await page.getByRole('textbox', { name: 'Enter your last name' }).fill(disneyCustomers[1].lastName);
  await page.getByRole('textbox', { name: 'your@email.com' }).fill(disneyCustomers[1].email);
  await page.getByRole('textbox', { name: '(555) 123-' }).fill(disneyCustomers[1].phone);
  
  // Continue to next step
  await page.getByRole('button', { name: 'Continue to Delivery →' }).click();
  
  // Select pickup method (Step 2)
  await page.getByText('🏪Store PickupReady in 15').click();
  
  // Continue to payment
  await page.getByRole('button', { name: 'Continue to Payment →' }).click();
  
  // Fill payment info (Step 3)
  await page.getByRole('textbox', { name: 'John Doe' }).fill(`${disneyCustomers[1].firstName} ${disneyCustomers[1].lastName}`);
  await page.getByRole('textbox', { name: '5678 9012 3456' }).fill(disneyCustomers[1].card);
  await page.getByRole('textbox', { name: 'MM/YY' }).fill('12/25');
  await page.getByRole('textbox', { name: '123', exact: true }).fill('789');
  
  await page.getByRole('button', { name: /💳 Complete Order/ }).click();
  await expect(page.locator('h2')).toContainText('Order Confirmed!');
  await page.getByRole('button', { name: '🏠 Back to Home' }).click();
});
