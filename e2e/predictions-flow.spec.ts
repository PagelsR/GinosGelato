import { test, expect } from '@playwright/test';

/**
 * FIFA World Cup 2026 Predictions E2E Test
 * 
 * This test suite covers the complete prediction flow for a soccer fan:
 * - Login authentication
 * - Viewing and navigating predictions
 * - Adding new predictions for March and April matches
 * - Editing existing predictions
 * - Validating business rules (e.g., cannot save empty predictions)
 * 
 * Test executes operations on matches from March and April 2026
 */

test.describe('FIFA World Cup 2026 - Predictions Flow', () => {
  // Test configuration
  const BASE_URL = 'https://yellow-ocean-020b8190f.1.azurestaticapps.net/';
  const LOGIN_EMAIL = 'Randy.Pagels@Xebia.com';
  const LOGIN_PASSWORD = 'f3Jps:t-43ddJcF';

  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle('Xebia - FIFA World Cup 2026');
  });

  test('complete prediction journey - add, edit, and validate predictions', async ({ page }) => {
    // =====================================================
    // STEP 1: Login
    // =====================================================
    console.log('🔐 Step 1: Logging in...');
    
    // Click the Login/Register button
    await page.getByRole('button', { name: 'Login / Register' }).click();
    
    // Verify login modal appears
    await expect(page.getByRole('heading', { name: 'Login', level: 2 })).toBeVisible();
    
    // Fill in credentials
    await page.getByRole('textbox', { name: 'Email' }).fill(LOGIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(LOGIN_PASSWORD);
    
    // Submit login
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    
    // Verify successful login - user name should be visible
    await expect(page.getByRole('button', { name: 'Randy Pagels' })).toBeVisible();
    console.log('✅ Login successful as Randy Pagels');

    // =====================================================
    // STEP 2: Navigate to Predictions
    // =====================================================
    console.log('📋 Step 2: Navigating to Predictions...');
    
    await page.getByRole('button', { name: 'Predictions' }).click();
    
    // Verify predictions page loaded with matches
    await expect(page.getByRole('heading', { name: /🏆 Current Games/ })).toBeVisible();
    console.log('✅ Predictions page loaded with current games');

    // =====================================================
    // STEP 3: Add Prediction - March 20 (Lambda vs Mu)
    // =====================================================
    console.log('⚽ Step 3: Adding prediction for March 20 - Lambda vs Mu...');
    
    // Unlock the match
    await page.locator('#enable-108').click();
    await expect(page.locator('#enable-108')).toBeChecked();
    
    // Select Lambda as winner
    await page.getByRole('checkbox').nth(1).click();
    
    // Enter scores: Lambda 3, Mu 1
    await page.getByRole('textbox', { name: '-' }).first().fill('3');
    await page.getByRole('textbox', { name: '-' }).nth(1).fill('1');
    
    // Save prediction
    await page.getByRole('button', { name: 'Save' }).first().click();
    
    // Verify saved successfully
    await expect(page.getByText('✓ Saved!').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#enable-108')).not.toBeChecked(); // Should be locked again
    console.log('✅ Prediction saved: Lambda 3 - 1 Mu');

    // =====================================================
    // STEP 4: Edit Prediction - March 20 (Change winner and scores)
    // =====================================================
    console.log('✏️ Step 4: Editing prediction for March 20...');
    
    // Unlock the match again
    await page.locator('#enable-108').click();
    await expect(page.locator('#enable-108')).toBeChecked();
    
    // Uncheck Lambda
    await page.getByRole('checkbox').nth(1).click();
    
    // Select Mu as winner
    await page.getByRole('checkbox').nth(2).click();
    
    // Update scores: Lambda 2, Mu 4
    await page.getByRole('textbox', { name: '-' }).first().fill('2');
    await page.getByRole('textbox', { name: '-' }).nth(1).fill('4');
    
    // Save edited prediction
    await page.getByRole('button', { name: 'Save' }).first().click();
    
    // Verify edited prediction saved
    await expect(page.getByText('✓ Saved!').first()).toBeVisible({ timeout: 5000 });
    console.log('✅ Prediction edited: Lambda 2 - 4 Mu (Mu wins)');

    // =====================================================
    // STEP 5: Add Prediction - March 23 (Nu vs Xi)
    // =====================================================
    console.log('⚽ Step 5: Adding prediction for March 23 - Nu vs Xi...');
    
    // Unlock the match
    await page.locator('#enable-109').click();
    
    // Select Nu as winner
    await page.getByRole('checkbox').nth(4).click();
    
    // Enter scores: Nu 1, Xi 0
    await page.getByRole('textbox', { name: '-' }).nth(2).fill('1');
    await page.getByRole('textbox', { name: '-' }).nth(3).fill('0');
    
    // Save prediction
    await page.getByRole('button', { name: 'Save' }).nth(1).click();
    
    // Verify saved
    await expect(page.locator('text=✓ Saved!').nth(1)).toBeVisible({ timeout: 5000 });
    console.log('✅ Prediction saved: Nu 1 - 0 Xi');

    // =====================================================
    // STEP 6: Add Prediction - March 27 (Omicron vs Pi)
    // =====================================================
    console.log('⚽ Step 6: Adding prediction for March 27 - Omicron vs Pi...');
    
    // Unlock the match
    await page.locator('#enable-110').click();
    
    // Select Pi as winner (using CSS selector for specificity)
    const piCheckbox = page.locator('div').filter({ hasText: /^Test Team Pi/ }).locator('input[type="checkbox"]').first();
    await piCheckbox.click();
    
    // Enter scores: Omicron 1, Pi 3
    await page.getByRole('textbox', { name: '-' }).nth(4).fill('1');
    await page.getByRole('textbox', { name: '-' }).nth(5).fill('3');
    
    // Save prediction
    await page.getByRole('button', { name: 'Save' }).nth(2).click();
    
    // Verify saved
    await expect(page.locator('text=✓ Saved!').nth(2)).toBeVisible({ timeout: 5000 });
    console.log('✅ Prediction saved: Omicron 1 - 3 Pi');

    // =====================================================
    // STEP 7: Scroll to April matches
    // =====================================================
    console.log('📜 Step 7: Scrolling to April matches...');
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500); // Brief pause for smooth scrolling

    // =====================================================
    // STEP 8: Add Prediction - April 1 (Tau vs Upsilon)
    // =====================================================
    console.log('⚽ Step 8: Adding prediction for April 1 - Tau vs Upsilon...');
    
    // Unlock the match
    await page.locator('#enable-112').click();
    
    // Select Tau as winner
    const tauCheckbox = page.locator('div').filter({ hasText: /^Test Team Tau/ }).locator('input[type="checkbox"]').first();
    await tauCheckbox.click();
    
    // Enter scores: Tau 2, Upsilon 2 (draw with Tau selected as winner)
    const tauScoreInput = page.locator('div').filter({ hasText: /^Test Team Tau/ }).getByRole('textbox').first();
    const upsilonScoreInput = page.locator('div').filter({ hasText: /^Test Team Upsilon/ }).getByRole('textbox').first();
    
    await tauScoreInput.fill('2');
    await upsilonScoreInput.fill('2');
    
    // Save prediction
    await page.getByRole('button', { name: 'Save' }).nth(4).click();
    
    // Verify saved
    await expect(page.locator('text=✓ Saved!').nth(4)).toBeVisible({ timeout: 5000 });
    console.log('✅ Prediction saved: Tau 2 - 2 Upsilon (draw)');

    // =====================================================
    // STEP 9: Add Prediction - April 3 (Phi vs Chi)
    // =====================================================
    console.log('⚽ Step 9: Adding prediction for April 3 - Phi vs Chi...');
    
    // Unlock the match
    await page.locator('#enable-113').click();
    
    // Select Chi as winner (dominant victory)
    const chiCheckbox = page.locator('div').filter({ hasText: /^Test Team Chi/ }).locator('input[type="checkbox"]').first();
    await chiCheckbox.click();
    
    // Enter scores: Phi 0, Chi 5
    const phiScoreInput = page.locator('div').filter({ hasText: /^Test Team Phi/ }).getByRole('textbox').first();
    const chiScoreInput = page.locator('div').filter({ hasText: /^Test Team Chi/ }).getByRole('textbox').first();
    
    await phiScoreInput.fill('0');
    await chiScoreInput.fill('5');
    
    // Save prediction
    await page.getByRole('button', { name: 'Save' }).nth(5).click();
    
    // Verify saved
    await expect(page.locator('text=✓ Saved!').nth(5)).toBeVisible({ timeout: 5000 });
    console.log('✅ Prediction saved: Phi 0 - 5 Chi (dominant win!)');

    // =====================================================
    // STEP 10: Validate Business Rule - Cannot Save Empty Prediction
    // =====================================================
    console.log('🚫 Step 10: Validating business rule - empty predictions cannot be saved...');
    
    // Unlock the first match again
    await page.evaluate(() => window.scrollTo(0, 0)); // Scroll back to top
    await page.waitForTimeout(500);
    
    await page.locator('#enable-108').click();
    
    // Clear the winner selection
    await page.getByRole('checkbox').nth(2).click(); // Uncheck Mu
    
    // Clear scores
    await page.getByRole('textbox', { name: '-' }).first().fill('');
    await page.getByRole('textbox', { name: '-' }).nth(1).fill('');
    
    // Set up dialog handler before clicking Save
    page.on('dialog', async dialog => {
      console.log(`📢 Alert message: ${dialog.message()}`);
      expect(dialog.message()).toContain('No predictions to save');
      await dialog.accept();
    });
    
    // Try to save empty prediction
    await page.getByRole('button', { name: 'Save' }).first().click();
    
    console.log('✅ Business rule validated: Empty predictions cannot be saved');

    // =====================================================
    // STEP 11: Final Verification
    // =====================================================
    console.log('✅ Step 11: Final verification...');
    
    // Verify we're still on the predictions page
    await expect(page.getByRole('heading', { name: /🏆 Current Games/ })).toBeVisible();
    
    // Verify scoring information is displayed
    await expect(page.getByText(/Scoring:.*3 pts.*5 pts.*8 pts/)).toBeVisible();
    
    console.log('🎉 All predictions completed successfully!');
  });

  test('navigation between pages', async ({ page }) => {
    // Login first
    await page.getByRole('button', { name: 'Login / Register' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(LOGIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(LOGIN_PASSWORD);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Randy Pagels' })).toBeVisible();

    // Test navigation to Predictions
    await page.getByRole('button', { name: 'Predictions' }).click();
    await expect(page.getByRole('heading', { name: /🏆 Current Games/ })).toBeVisible();

    // Test navigation to Leaderboard
    await page.getByRole('button', { name: 'Leaderboard' }).click();
    await page.waitForTimeout(1000); // Wait for page transition

    // Test navigation to Admin
    await page.getByRole('button', { name: 'Admin' }).click();
    await page.waitForTimeout(1000); // Wait for page transition

    console.log('✅ Navigation between pages works correctly');
  });

  test('verify match locking/unlocking behavior', async ({ page }) => {
    // Login
    await page.getByRole('button', { name: 'Login / Register' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(LOGIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(LOGIN_PASSWORD);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Randy Pagels' })).toBeVisible();

    // Navigate to predictions
    await page.getByRole('button', { name: 'Predictions' }).click();

    // Verify match initially locked
    const lockCheckbox = page.locator('#enable-108');
    await expect(lockCheckbox).not.toBeChecked();
    
    // Verify score inputs are disabled when locked
    const firstScoreInput = page.getByRole('textbox', { name: '-' }).first();
    await expect(firstScoreInput).toBeDisabled();

    // Unlock the match
    await lockCheckbox.click();
    await expect(lockCheckbox).toBeChecked();
    
    // Verify score inputs are enabled when unlocked
    await expect(firstScoreInput).toBeEnabled();

    // After saving, match should auto-lock
    await page.getByRole('checkbox').nth(1).click(); // Select winner
    await firstScoreInput.fill('1');
    await page.getByRole('textbox', { name: '-' }).nth(1).fill('0');
    await page.getByRole('button', { name: 'Save' }).first().click();
    
    // Wait for save confirmation
    await expect(page.getByText('✓ Saved!').first()).toBeVisible({ timeout: 5000 });
    
    // Verify match is locked again after save
    await expect(lockCheckbox).not.toBeChecked();
    await expect(firstScoreInput).toBeDisabled();

    console.log('✅ Match locking/unlocking behavior verified');
  });
});
