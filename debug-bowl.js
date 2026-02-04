const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  await page.getByRole('button', { name: '🎨 Start Creating Your Ice' }).click();
  await page.getByRole('heading', { name: 'Bowl Cup' }).click();
  
  // Wait a moment for the page to load
  await page.waitForTimeout(2000);
  
  // Get all text content
  const flavors = await page.locator('[data-testid*="flavor"], .flavor, text*="flavor"').allTextContents();
  console.log('Flavors found:', flavors);
  
  // Get all available text options
  const allText = await page.locator('text=/🍓|🍫|Strawberry|Chocolate/').allTextContents();
  console.log('All strawberry/chocolate text:', allText);
  
  // Take a screenshot
  await page.screenshot({ path: 'bowl-cup-debug.png' });
  
  await browser.close();
})();