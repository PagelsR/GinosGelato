import { test, expect } from '@playwright/test';

test('Quick Links pages and content', async ({ page }) => {
  await page.goto('https://zealous-sky-008ca630f.1.azurestaticapps.net/');

  const quickLinks = page.getByRole('contentinfo').getByRole('link', { name: /About Us|Our Flavors|Locations|Catering/ });
  await expect(quickLinks).toHaveCount(4);

  await page.getByRole('link', { name: 'About Us' }).click();
  await expect(page.getByRole('heading', { name: "About Gino's Gelato" })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fresh Ingredients' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Italian Tradition' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Community First' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Our Promise' })).toBeVisible();

  await page.getByRole('link', { name: 'Our Flavors' }).click();
  await expect(page.getByRole('heading', { name: 'Our Flavors' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Classics' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fruit Sorbetto' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Chef Specials' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Seasonal Drops' })).toBeVisible();
  await expect(page.getByText('Vanilla Bean')).toBeVisible();
  await expect(page.getByText('Lemon Zest')).toBeVisible();

  await page.getByRole('link', { name: 'Locations' }).click();
  await expect(page.getByRole('heading', { name: 'Locations' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Downtown Gelato Bar' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Riverside Scoop Shop' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Uptown Market Stand' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Planning a Visit?' })).toBeVisible();

  await page.getByRole('link', { name: 'Catering' }).click();
  await expect(page.getByRole('heading', { name: 'Catering' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Gelato Social' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Office Celebration' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Wedding & Events' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Request a Quote' })).toBeVisible();
});
