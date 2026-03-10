import { test, expect } from '@playwright/test';

test.describe('Flaky Test Examples', () => {
  
  test('Random 50/50 Test - Simulates Network Instability', async ({ page }) => {
    // This test randomly fails 50% of the time
    const shouldPass = Math.random() > 0.5;
    
    console.log(`Test will ${shouldPass ? 'PASS' : 'FAIL'} this time`);
    
    await page.goto('https://zealous-sky-008ca630f.1.azurestaticapps.net/');
    
    // Simulate an unstable condition
    if (!shouldPass) {
      // Simulate a failure (e.g., element not found, timeout, etc.)
      expect(shouldPass, 'Simulated random failure - network instability').toBeTruthy();
    }
    
    // If we get here, the test passes
    await expect(page).toHaveTitle(/Gino's Gelato/);
  });

  test('Time-based Flaky Test - Fails on Odd Seconds', async ({ page }) => {
    // Fails when the current second is odd
    const currentSecond = new Date().getSeconds();
    const shouldPass = currentSecond % 2 === 0;
    
    console.log(`Current second: ${currentSecond}, Test will ${shouldPass ? 'PASS' : 'FAIL'}`);
    
    await page.goto('https://zealous-sky-008ca630f.1.azurestaticapps.net/');
    
    if (!shouldPass) {
      expect(shouldPass, `Simulated time-based failure (second: ${currentSecond})`).toBeTruthy();
    }
    
    await expect(page).toHaveTitle(/Gino's Gelato/);
  });

  test('Race Condition Simulation', async ({ page }) => {
    // Simulates a race condition with random timing
    const delay = Math.floor(Math.random() * 100);
    const shouldFail = delay > 50;
    
    console.log(`Delay: ${delay}ms, Test will ${shouldFail ? 'FAIL' : 'PASS'}`);
    
    await page.goto('https://zealous-sky-008ca630f.1.azurestaticapps.net/');
    
    // Simulate waiting for an element with inconsistent timing
    await page.waitForTimeout(delay);
    
    if (shouldFail) {
      throw new Error(`Race condition detected! Delay was ${delay}ms (threshold: 50ms)`);
    }
    
    await expect(page).toHaveTitle(/Gino's Gelato/);
  });
});
