import { expect, test } from "@playwright/test";

test("complete gelato order without waffle cone", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "🎨 Start Creating Your Ice Cream" }).click();

  await page.getByText("Bowl Cup", { exact: true }).click();

  await page.getByText("Vanilla Dream", { exact: true }).click();
  await page.getByText("Strawberry Bliss", { exact: true }).click();
  await page.getByText("Pistachio", { exact: true }).click();

  await page.getByText("Rainbow Sprinkles", { exact: true }).click();
  await page.getByText("Hot Fudge", { exact: true }).click();

  await page.getByRole("button", { name: "🛒 Add to Cart" }).click();
  await page.getByRole("button", { name: "View Cart" }).click();

  await page.getByRole("button", { name: "💳 Proceed to Checkout" }).click();

  await page.getByPlaceholder("Enter your first name").fill("Randy");
  await page.getByPlaceholder("Enter your last name").fill("Pagels");
  await page.getByPlaceholder("your@email.com").fill("randy.pagels@example.com");
  await page.getByPlaceholder("(555) 123-4567").fill("555-123-4567");

  await page.getByRole("button", { name: "Continue to Delivery →" }).click();
  await page.getByText("Store Pickup", { exact: true }).click();
  await page.getByRole("button", { name: "Continue to Payment →" }).click();

  await page.getByPlaceholder("John Doe").fill("Randy Pagels");
  await page.getByPlaceholder("1234 5678 9012 3456").fill("4242 4242 4242 4242");
  await page.getByPlaceholder("MM/YY").fill("12/30");
  await page.getByPlaceholder("123").fill("123");

  await page.getByRole("button", { name: /Complete Order/ }).click();

  await expect(page.getByRole("heading", { name: "Order Confirmed!" })).toBeVisible();
});
