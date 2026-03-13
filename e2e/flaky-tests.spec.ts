import { test, expect } from '@playwright/test';

test.describe('Flaky Test Examples', () => {
  
  test('Random 50/50 Test - Simulates Network Instability', async ({ page }) => {
    // This test randomly fails 30% of the time
    const shouldPass = Math.random() > 0.3;
    
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
    // Fails 15% of the time based on timing
    const currentSecond = new Date().getSeconds();
    const shouldPass = Math.random() > 0.15;
    
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
    const shouldFail = delay > 75;
    
    console.log(`Delay: ${delay}ms, Test will ${shouldFail ? 'FAIL' : 'PASS'}`);
    
    await page.goto('https://zealous-sky-008ca630f.1.azurestaticapps.net/');
    
    // Simulate waiting for an element with inconsistent timing
    await page.waitForTimeout(delay);
    
    if (shouldFail) {
      throw new Error(`Race condition detected! Delay was ${delay}ms (threshold: 50ms)`);
    }
    
    await expect(page).toHaveTitle(/Gino's Gelato/);
  });

  test('API Timeout Simulation - 20% Failure Rate', async ({ page }) => {
    // Simulates intermittent API timeouts (fails 20% of the time)
    const shouldFail = Math.random() > 0.8;
    
    console.log(`API timeout test will ${shouldFail ? 'FAIL' : 'PASS'} this time`);
    
    await page.goto('https://zealous-sky-008ca630f.1.azurestaticapps.net/');
    
    // Navigate to builder page where API calls happen
    await page.click('text=Build Your Gelato');
    
    if (shouldFail) {
      throw new Error('Simulated API timeout - Request took too long to respond');
    }
    
    // If we get here, verify the page loaded correctly
    await expect(page.locator('h1')).toContainText('Build Your');
  });

  test('Memory Leak Simulation - 25% Failure Rate', async ({ page }) => {
    // Simulates memory pressure causing test failures (fails 25% of the time)
    const memoryPressure = Math.random();
    const shouldFail = memoryPressure > 0.75;
    
    console.log(`Memory pressure: ${(memoryPressure * 100).toFixed(1)}%, Test will ${shouldFail ? 'FAIL' : 'PASS'}`);
    
    await page.goto('https://zealous-sky-008ca630f.1.azurestaticapps.net/');
    
    // Simulate some memory-intensive operation
    await page.click('text=Our Flavors');
    await page.waitForTimeout(100);
    
    if (shouldFail) {
      expect(shouldFail, `Memory leak detected! Pressure at ${(memoryPressure * 100).toFixed(1)}%`).toBeFalsy();
    }
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Browser Cache Inconsistency - 20% Failure Rate', async ({ page }) => {
    // Simulates stale cache causing inconsistent behavior (fails 20% of the time)
    const cacheState = Math.floor(Math.random() * 5); // 0, 1, 2, 3, or 4
    const shouldFail = cacheState === 0; // 20% chance
    
    console.log(`Cache state: ${cacheState}, Test will ${shouldFail ? 'FAIL' : 'PASS'}`);
    
    await page.goto('https://zealous-sky-008ca630f.1.azurestaticapps.net/');
    
    // Navigate to a page that might have caching issues
    await page.click('text=About Us');
    
    if (shouldFail) {
      throw new Error(`Stale cache detected (state: ${cacheState}) - Expected fresh content`);
    }
    
    await expect(page.locator('body')).toContainText('About');
  });

  test('Database Connection Pool Exhaustion - 15% Failure Rate', async ({ page }) => {
    // Simulates database connection issues (fails 15% of the time)
    const connectionPoolLoad = Math.random() * 100;
    const shouldFail = connectionPoolLoad > 85;
    
    console.log(`Connection pool load: ${connectionPoolLoad.toFixed(1)}%, Test will ${shouldFail ? 'FAIL' : 'PASS'}`);
    
    await page.goto('https://zealous-sky-008ca630f.1.azurestaticapps.net/');
    
    // Simulate action that requires database access
    await page.click('text=Build Your Gelato');
    await page.waitForTimeout(50);
    
    if (shouldFail) {
      expect(false, `Database connection pool exhausted at ${connectionPoolLoad.toFixed(1)}% load`).toBeTruthy();
    }
    
    await expect(page).toHaveURL(/.*build/);
  });

  test('Payment Gateway Timeout - 20% Failure Rate', async ({ page }) => {
    // Occasionally fails (20% failure)
    const shouldFail = Math.random() > 0.8;
    
    console.log(`Payment gateway test will ${shouldFail ? 'FAIL' : 'PASS'} this time`);
    
    await page.goto('https://zealous-sky-008ca630f.1.azurestaticapps.net/');
    await page.click('text=Build Your Gelato');
    
    if (shouldFail) {
      throw new Error('Payment gateway connection timeout - Service unavailable');
    }
    
    await expect(page).toHaveURL(/.*build/);
  });

  test('Image CDN Loading Failure - 15% Failure Rate', async ({ page }) => {
    // Fails 15% of the time - simulates CDN issues
    const cdnHealth = Math.random() * 100;
    const shouldFail = cdnHealth > 85;
    
    console.log(`CDN health: ${cdnHealth.toFixed(1)}%, Test will ${shouldFail ? 'FAIL' : 'PASS'}`);
    
    await page.goto('https://zealous-sky-008ca630f.1.azurestaticapps.net/');
    
    if (shouldFail) {
      expect(false, `CDN failed to load images - Health at ${cdnHealth.toFixed(1)}%`).toBeTruthy();
    }
    
    await expect(page).toHaveTitle(/Gino's Gelato/);
  });

  test('Session Storage Corruption - 15% Failure Rate', async ({ page }) => {
    // Fails 15% of the time - simulates persistent storage issues
    const storageIntegrity = Math.random();
    const shouldFail = storageIntegrity > 0.85;
    
    console.log(`Storage integrity: ${(storageIntegrity * 100).toFixed(1)}%, Test will ${shouldFail ? 'FAIL' : 'PASS'}`);
    
    await page.goto('https://zealous-sky-008ca630f.1.azurestaticapps.net/');
    await page.click('text=Our Flavors');
    
    if (shouldFail) {
      throw new Error(`Session storage corrupted - Integrity check failed at ${(storageIntegrity * 100).toFixed(1)}%`);
    }
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Third-Party Script Blocker - 15% Failure Rate', async ({ page }) => {
    // Fails 15% of the time - simulates ad blockers or script failures
    const scriptLoaded = Math.random();
    const shouldFail = scriptLoaded > 0.85;
    
    console.log(`Script load probability: ${(scriptLoaded * 100).toFixed(1)}%, Test will ${shouldFail ? 'FAIL' : 'PASS'}`);
    
    await page.goto('https://zealous-sky-008ca630f.1.azurestaticapps.net/');
    
    if (shouldFail) {
      expect(false, `Third-party script blocked or failed to load (${(scriptLoaded * 100).toFixed(1)}%)`).toBeTruthy();
    }
    
    await expect(page).toHaveTitle(/Gino's Gelato/);
  });
});
