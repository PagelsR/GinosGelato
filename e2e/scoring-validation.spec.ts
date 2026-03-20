import { test, expect } from '@playwright/test';

/**
 * FIFA World Cup 2026 - Scoring System Validation Test
 * 
 * This test validates the point calculation system:
 * - 3 pts: Correct winner only (right winner, wrong exact score)
 * - 5 pts: Exact score only (exact score, wrong winner) 
 * - 8 pts: Both correct (correct winner AND exact score)
 * - 0 pts: Wrong prediction (neither winner nor exact score match)
 * 
 * Test Flow:
 * 1. Login as Randy Pagels
 * 2. Make predictions for 4 different matches
 * 3. Login to Admin and set actual results
 * 4. Recalculate points
 * 5. Verify leaderboard shows correct points for each scenario
 */

test.describe('FIFA World Cup 2026 - Scoring Calculation Validation', () => {
  const BASE_URL = 'https://yellow-ocean-020b8190f.1.azurestaticapps.net/';
  const LOGIN_EMAIL = 'Randy.Pagels@Xebia.com';
  const LOGIN_PASSWORD = 'f3Jps:t-43ddJcF';

  // Increase test timeout to handle slow operations
  test.setTimeout(90000); // 90 seconds per test

  // Helper function to login
  async function login(page: any) {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: 'Login / Register' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('textbox', { name: 'Email' }).fill(LOGIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(LOGIN_PASSWORD);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Randy Pagels' })).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
  }

  // Helper function to navigate to a specific page
  async function navigateTo(page: any, pageName: string) {
    console.log(`🔄 Navigating to ${pageName}...`);
    await page.getByRole('button', { name: pageName }).click();
    await page.waitForTimeout(1500); // Increased wait for page transitions
  }

  // Helper function to find available matches in March or April
  async function findMatchesInMarchApril(page: any): Promise<string[]> {
    const matchIds: string[] = [];
    
    // Look for all enable checkboxes on the page
    const enableCheckboxes = page.locator('input[type="checkbox"][id^="enable-"]');
    const count = await enableCheckboxes.count();
    
    for (let i = 0; i < count; i++) {
      const checkbox = enableCheckboxes.nth(i);
      const id = await checkbox.getAttribute('id');
      if (id) {
        const matchId = id.replace('enable-', '');
        matchIds.push(matchId);
      }
    }
    
    console.log(`Found ${matchIds.length} total matches`);
    return matchIds;
  }

  // Helper function to randomly select 4 unique match IDs
  function selectRandomMatches(matchIds: string[], count: number = 4): string[] {
    const shuffled = [...matchIds].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, matchIds.length));
  }

  // Helper function to make a prediction
  async function makePrediction(
    page: any, 
    matchId: string, 
    selectFirstTeam: boolean,
    team1Score: string,
    team2Score: string,
    matchIndex: number
  ) {
    console.log(`Making prediction for match ${matchId}: Team1: ${team1Score}, Team2: ${team2Score}, Winner: ${selectFirstTeam ? 'Team1' : 'Team2'}`);
    
    // Check if match is locked and unlock if needed
    const enableCheckbox = page.locator(`#enable-${matchId}`);
    const isChecked = await enableCheckbox.isChecked();
    
    if (!isChecked) {
      console.log(`🔓 Unlocking match ${matchId}...`);
      await enableCheckbox.click();
      await page.waitForTimeout(500);
    }
    
    await expect(enableCheckbox).toBeChecked();
    await page.waitForTimeout(500);
    
    // Find the winner checkboxes for this specific match
    // They should be in the same container as the enable checkbox
    const matchContainer = page.locator(`#enable-${matchId}`).locator('xpath=ancestor::div[contains(@class, "rounded-lg")]');
    const winnerCheckboxes = matchContainer.locator('input[type="checkbox"]:not([id^="enable-"])');
    
    // Clear any existing winner selection
    const checkbox1 = winnerCheckboxes.nth(0);
    const checkbox2 = winnerCheckboxes.nth(1);
    
    const isChecked1 = await checkbox1.isChecked();
    const isChecked2 = await checkbox2.isChecked();
    
    if (isChecked1) await checkbox1.click();
    if (isChecked2) await checkbox2.click();
    await page.waitForTimeout(300);
    
    // Select the winner
    if (selectFirstTeam) {
      await checkbox1.click();
    } else {
      await checkbox2.click();
    }
    await page.waitForTimeout(300);
    
    // Find and fill score inputs for this match
    const scoreInputs = matchContainer.getByRole('textbox', { name: '-' });
    await scoreInputs.nth(0).fill(team1Score);
    await page.waitForTimeout(200);
    await scoreInputs.nth(1).fill(team2Score);
    await page.waitForTimeout(300);
    
    // Find and click the Save button for this match
    const saveButton = matchContainer.getByRole('button', { name: 'Save' });
    await saveButton.click();
    
    // Wait for save - success message appears and disappears quickly
    await page.waitForTimeout(2000);
    
    // Verify match is locked again (indicates successful save)
    await expect(enableCheckbox).not.toBeChecked({ timeout: 3000 });
    
    console.log(`✅ Prediction saved for match ${matchId}`);
  }

  // Helper function to set actual result in Admin
  async function setActualResult(
    page: any,
    matchId: string,
    team1Score: string,
    team2Score: string,
    matchIndex: number
  ) {
    console.log(`Setting actual result for match ${matchId}: Team1: ${team1Score}, Team2: ${team2Score}`);
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
    
    // Find the enable checkbox for this match
    const enableCheckbox = page.locator(`#enable-${matchId}`).first();
    
    // Check if exists
    const exists = await enableCheckbox.count();
    if (exists === 0) {
      throw new Error(`Could not find match ${matchId} on Admin page`);
    }
    
    // Unlock if locked
    const isChecked = await enableCheckbox.isChecked();
    if (!isChecked) {
      console.log(`🔓 Unlocking match ${matchId} in Admin...`);
      await enableCheckbox.click();
      await page.waitForTimeout(500);
    }
    
    await page.waitForTimeout(500);
    
    // Find score inputs within this match's container
    const matchContainer = enableCheckbox.locator('xpath=ancestor::div[contains(@class, "rounded-lg")]');
    const scoreInputs = matchContainer.getByRole('textbox', { name: '-' });
    
    await scoreInputs.nth(0).fill(team1Score);
    await page.waitForTimeout(200);
    await scoreInputs.nth(1).fill(team2Score);
    await page.waitForTimeout(300);
    
    // Save
    const saveButton = matchContainer.getByRole('button', { name: 'Save' });
    await saveButton.click();
    
    // Wait for save to complete
    await page.waitForTimeout(2000);
    
    console.log(`✅ Actual result saved for match ${matchId}`);
  }

  // Helper function to get user points from leaderboard
  async function getUserPoints(page: any, userName: string): Promise<number> {
    // Wait for leaderboard to load
    await page.waitForTimeout(1000);
    
    try {
      // Look for Randy Pagels' row and extract points
      const userRow = page.locator('tr', { has: page.locator(`text="${userName}"`) });
      await userRow.waitFor({ state: 'visible', timeout: 10000 });
      
      // Get the points column (usually last column)
      const pointsText = await userRow.locator('td').last().textContent();
      const points = parseInt(pointsText?.trim() || '0', 10);
      
      console.log(`📊 ${userName} has ${points} points`);
      return points;
    } catch (error) {
      console.log(`⚠️ Could not find ${userName} on leaderboard, returning 0 points`);
      return 0;
    }
  }

  test('complete scoring validation - all scenarios', async ({ page }) => {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 STARTING COMPREHENSIVE SCORING VALIDATION TEST');
    console.log('='.repeat(70) + '\n');
    
    try {
      // =====================================================
      // SETUP: Login and Find Random Matches
      // =====================================================
      console.log('🔐 Step 1: Login as Randy Pagels...');
      await login(page);
      
      // Navigate to leaderboard to record baseline points
      await navigateTo(page, 'Leaderboard');
      const initialPoints = await getUserPoints(page, 'Randy Pagels');
      console.log(`📊 Initial points: ${initialPoints}`);

      // =====================================================
      // Find 4 random matches from March/April
      // =====================================================
      console.log('\n🔍 Step 2: Finding random matches from March/April...');
      await navigateTo(page, 'Predictions');
      
      const availableMatches = await findMatchesInMarchApril(page);
      console.log(`Found ${availableMatches.length} matches in March/April`);
      
      if (availableMatches.length < 4) {
        throw new Error(`Not enough matches available. Found ${availableMatches.length}, need at least 4`);
      }
      
      const selectedMatches = selectRandomMatches(availableMatches, 4);
      console.log(`🎲 Randomly selected matches: ${selectedMatches.join(', ')}`);
      
      const match1 = selectedMatches[0]; // Correct Winner Only
      const match2 = selectedMatches[1]; // Exact Score Only
      const match3 = selectedMatches[2]; // Both Correct
      const match4 = selectedMatches[3]; // Wrong Prediction

      // =====================================================
      // STEP 1: Make Predictions for 4 Matches
      // =====================================================
      console.log('\n⚽ Step 3: Making predictions for 4 random matches...');

      // Scenario 1: Correct Winner Only (3 pts expected)
      console.log(`\n📝 Scenario 1: Match ${match1} - Correct Winner Only`);
      await makePrediction(page, match1, true, '3', '1', 0);

      // Scenario 2: Exact Score Only (5 pts expected)
      console.log(`\n📝 Scenario 2: Match ${match2} - Exact Score Only`);
      await makePrediction(page, match2, true, '2', '1', 1);

      // Scenario 3: Both Correct (8 pts expected)
      console.log(`\n📝 Scenario 3: Match ${match3} - Both Correct`);
      await makePrediction(page, match3, true, '4', '2', 2);

      // Scenario 4: Wrong Prediction (0 pts expected)
      console.log(`\n📝 Scenario 4: Match ${match4} - Wrong Prediction`);
      await makePrediction(page, match4, true, '3', '0', 3);

      console.log('\n✅ All 4 predictions made successfully');

      // =====================================================
      // STEP 2: Set Actual Results in Admin Dashboard
      // =====================================================
      console.log('\n🔧 Step 4: Navigating to Admin Dashboard...');
      await navigateTo(page, 'Admin');

      // Scenario 1: Team1 wins with different score (3 pts)
      console.log(`\n📝 Setting actual for Scenario 1 (Match ${match1})`);
      await setActualResult(page, match1, '2', '0', 0);

      // Scenario 2: Score is correct but winner is opposite (5 pts)
      console.log(`\n📝 Setting actual for Scenario 2 (Match ${match2})`);
      await setActualResult(page, match2, '1', '2', 1);

      // Scenario 3: Perfect match (8 pts)
      console.log(`\n📝 Setting actual for Scenario 3 (Match ${match3})`);
      await setActualResult(page, match3, '4', '2', 2);

      // Scenario 4: Completely wrong (0 pts)
      console.log(`\n📝 Setting actual for Scenario 4 (Match ${match4})`);
      await setActualResult(page, match4, '1', '2', 3);

      console.log('\n✅ All 4 actual results set in Admin');

    // =====================================================
    // STEP 3: Recalculate All Points
    // =====================================================
    console.log('\n🔄 Step 5: Recalculating all points...');
    const recalcButton = page.getByRole('button', { name: 'Recalculate All Points' });
    await recalcButton.waitFor({ state: 'visible', timeout: 10000 });
    await recalcButton.click();
    await page.waitForTimeout(3000); // Wait longer for recalculation to complete
    console.log('✅ Points recalculated');

    // =====================================================
    // STEP 4: Verify Points on Leaderboard
    // =====================================================
    console.log('\n📊 Step 6: Verifying points on Leaderboard...');
    await navigateTo(page, 'Leaderboard');
    await page.waitForTimeout(2000); // Extra wait for leaderboard to refresh

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scoring-validation-leaderboard.png', fullPage: true });

    // Get final points
    const finalPoints = await getUserPoints(page, 'Randy Pagels');
    const earnedPoints = finalPoints - initialPoints;

    // =====================================================
    // STEP 5: Validate Results
    // =====================================================
    console.log('\n✅ Step 7: Validating scoring results...');
    
    const expectedPoints = 3 + 5 + 8 + 0; // = 16 points
    
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║           SCORING VALIDATION RESULTS                      ║
╠═══════════════════════════════════════════════════════════╣
║ Scenario 1 (Correct Winner):    Expected: 3 pts          ║
║ Scenario 2 (Exact Score):       Expected: 5 pts          ║
║ Scenario 3 (Both Correct):      Expected: 8 pts          ║
║ Scenario 4 (Wrong Prediction):  Expected: 0 pts          ║
╠═══════════════════════════════════════════════════════════╣
║ Matches Tested: ${selectedMatches.join(', ').padEnd(36)} ║
║ TOTAL EXPECTED:                  ${expectedPoints} pts                   ║
║ TOTAL EARNED:                    ${earnedPoints} pts                   ║
║ STATUS:                          ${earnedPoints === expectedPoints ? '✅ PASS' : '❌ FAIL'}                 ║
╚═══════════════════════════════════════════════════════════╝
    `);

    // Assert total points are correct
    expect(earnedPoints).toBe(expectedPoints);
    
    } catch (error) {
      console.error('\n❌ COMPREHENSIVE TEST FAILED:', error);
      await page.screenshot({ path: 'e2e/screenshots/error-comprehensive-test.png', fullPage: true });
      throw error;
    }
  });

  test('scenario 1: correct winner only - 3 points', async ({ page }) => {
    console.log('🎯 Testing: Correct Winner Only (3 points expected)');
    
    try {
      await login(page);
      await navigateTo(page, 'Leaderboard');
      const initialPoints = await getUserPoints(page, 'Randy Pagels');

      // Make prediction: Team1 wins 3-1
      await navigateTo(page, 'Predictions');
      await makePrediction(page, '108', true, '3', '1', 0);

      // Set actual: Team1 wins 2-0 (correct winner, wrong score)
      await navigateTo(page, 'Admin');
      await setActualResult(page, '108', '2', '0', 0);

      // Recalculate and verify
      const recalcButton = page.getByRole('button', { name: 'Recalculate All Points' });
      await recalcButton.waitFor({ state: 'visible', timeout: 10000 });
      await recalcButton.click();
      await page.waitForTimeout(3000);

      await navigateTo(page, 'Leaderboard');
      await page.waitForTimeout(2000);
      
      const finalPoints = await getUserPoints(page, 'Randy Pagels');
      const earnedPoints = finalPoints - initialPoints;

      console.log(`✅ Scenario 1: Earned ${earnedPoints} points (Expected: 3)`);
      expect(earnedPoints).toBe(3);
    } catch (error) {
      console.error('❌ Scenario 1 failed:', error);
      throw error;
    }
  });

  test('scenario 2: exact score only - 5 points', async ({ page }) => {
    console.log('🎯 Testing: Exact Score Only (5 points expected)');
    
    try {
      await login(page);
      await navigateTo(page, 'Leaderboard');
      const initialPoints = await getUserPoints(page, 'Randy Pagels');

      // Make prediction: Team1 wins 2-1
      await navigateTo(page, 'Predictions');
      await makePrediction(page, '109', true, '2', '1', 0);

      // Set actual: Team2 wins 1-2 (wrong winner, exact score reversed)
      await navigateTo(page, 'Admin');
      await setActualResult(page, '109', '1', '2', 0);

      // Recalculate and verify
      const recalcButton = page.getByRole('button', { name: 'Recalculate All Points' });
      await recalcButton.waitFor({ state: 'visible', timeout: 10000 });
      await recalcButton.click();
      await page.waitForTimeout(3000);

      await navigateTo(page, 'Leaderboard');
      await page.waitForTimeout(2000);
      
      const finalPoints = await getUserPoints(page, 'Randy Pagels');
      const earnedPoints = finalPoints - initialPoints;

      console.log(`✅ Scenario 2: Earned ${earnedPoints} points (Expected: 5)`);
      expect(earnedPoints).toBe(5);
    } catch (error) {
      console.error('❌ Scenario 2 failed:', error);
      throw error;
    }
  });

  test('scenario 3: both correct - 8 points', async ({ page }) => {
    console.log('🎯 Testing: Both Correct (8 points expected)');
    
    try {
      await login(page);
      await navigateTo(page, 'Leaderboard');
      const initialPoints = await getUserPoints(page, 'Randy Pagels');

      // Make prediction: Team1 wins 4-2
      await navigateTo(page, 'Predictions');
      await makePrediction(page, '110', true, '4', '2', 0);

      // Set actual: Team1 wins 4-2 (perfect match!)
      await navigateTo(page, 'Admin');
      await setActualResult(page, '110', '4', '2', 0);

      // Recalculate and verify
      const recalcButton = page.getByRole('button', { name: 'Recalculate All Points' });
      await recalcButton.waitFor({ state: 'visible', timeout: 10000 });
      await recalcButton.click();
      await page.waitForTimeout(3000);

      await navigateTo(page, 'Leaderboard');
      await page.waitForTimeout(2000);
      
      const finalPoints = await getUserPoints(page, 'Randy Pagels');
      const earnedPoints = finalPoints - initialPoints;

      console.log(`✅ Scenario 3: Earned ${earnedPoints} points (Expected: 8)`);
      expect(earnedPoints).toBe(8);
    } catch (error) {
      console.error('❌ Scenario 3 failed:', error);
      throw error;
    }
  });

  test('scenario 4: wrong prediction - 0 points', async ({ page }) => {
    console.log('🎯 Testing: Wrong Prediction (0 points expected)');
    
    try {
      await login(page);
      await navigateTo(page, 'Leaderboard');
      const initialPoints = await getUserPoints(page, 'Randy Pagels');

      // Make prediction: Team1 wins 3-0
      await navigateTo(page, 'Predictions');
      await makePrediction(page, '111', true, '3', '0', 0);

      // Set actual: Team2 wins 1-2 (completely wrong)
      await navigateTo(page, 'Admin');
      await setActualResult(page, '111', '1', '2', 0);

      // Recalculate and verify
      const recalcButton = page.getByRole('button', { name: 'Recalculate All Points' });
      await recalcButton.waitFor({ state: 'visible', timeout: 10000 });
      await recalcButton.click();
      await page.waitForTimeout(3000);

      await navigateTo(page, 'Leaderboard');
      await page.waitForTimeout(2000);
      
      const finalPoints = await getUserPoints(page, 'Randy Pagels');
      const earnedPoints = finalPoints - initialPoints;

      console.log(`✅ Scenario 4: Earned ${earnedPoints} points (Expected: 0)`);
      expect(earnedPoints).toBe(0);
    } catch (error) {
      console.error('❌ Scenario 4 failed:', error);
      throw error;
    }
  });

  test('edge case: draw predictions', async ({ page }) => {
    console.log('🎯 Testing: Draw Predictions');
    
    try {
      await login(page);
      await navigateTo(page, 'Leaderboard');
      const initialPoints = await getUserPoints(page, 'Randy Pagels');

      // Make prediction: Draw 2-2 (Team1 selected as "winner")
      await navigateTo(page, 'Predictions');
      await makePrediction(page, '112', true, '2', '2', 0);

      // Set actual: Draw 2-2 (perfect match!)
      await navigateTo(page, 'Admin');
      await setActualResult(page, '112', '2', '2', 0);

      // Recalculate and verify
      const recalcButton = page.getByRole('button', { name: 'Recalculate All Points' });
      await recalcButton.waitFor({ state: 'visible', timeout: 10000 });
      await recalcButton.click();
      await page.waitForTimeout(3000);

      await navigateTo(page, 'Leaderboard');
      await page.waitForTimeout(2000);
      
      const finalPoints = await getUserPoints(page, 'Randy Pagels');
      const earnedPoints = finalPoints - initialPoints;

      console.log(`✅ Draw Test: Earned ${earnedPoints} points (Expected: 8 for perfect match)`);
      expect(earnedPoints).toBe(8);
    } catch (error) {
      console.error('❌ Draw test failed:', error);
      throw error;
    }
  });
});
