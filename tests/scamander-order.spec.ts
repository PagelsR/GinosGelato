import { test, expect } from '@playwright/test';

test('complete magical wand order', async ({ page }) => {
  await page.goto('https://renevanosnabrugge.github.io/scamander-magic-wand/');

  await page.getByTestId('find-your-wand-button').click();
  await page.getByTestId('add-to-cart-explorer').click();
  await page.getByTestId('cart-button').click();
  await page.getByTestId('checkout-button').click();

  await page.getByRole('textbox', { name: 'Full Name' }).fill('Avery Moonspell');
  await page.getByRole('textbox', { name: 'Email' }).fill('avery.moonspell@example.com');
  await page.getByRole('textbox', { name: 'Address' }).fill('7 Wandmaker Way');
  await page.getByRole('textbox', { name: 'City' }).fill('Enchanted City');
  await page.getByRole('textbox', { name: 'ZIP Code' }).fill('12345');
  await page.getByRole('textbox', { name: 'Card Number' }).fill('4242 4242 4242 4242');
  await page.getByRole('textbox', { name: 'Expiry Date' }).fill('12/30');
  await page.getByRole('textbox', { name: 'CVV' }).fill('123');

  const completeOrderButton = page.getByTestId('complete-order-button');
  await expect(completeOrderButton).toBeEnabled();
  await completeOrderButton.click();

  await expect(
    page.getByText('Your magical wands are on their way', { exact: false }).first()
  ).toBeVisible();
});
