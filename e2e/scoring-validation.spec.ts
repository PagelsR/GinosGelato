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

  // Helper function to login
  async function login(page: any) {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: 'Login / Register' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(LOGIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(LOGIN_PASSWORD);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Randy Pagels' })).toBeVisible();
  }

  // Helper function to navigate to a specific page
  async function navigateTo(page: any, pageName: string) {
    await page.getByRole('button', { name: pageName }).click();
    await page.waitForTimeout(500); // Brief pause for navigation
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
    
    // Unlock match
    await page.locator(`#enable-${matchId}`).click();
    await expect(page.locator(`#enable-${matchId}`)).toBeChecked();
    
    // Select winner
    const checkboxIndex = matchIndex * 3 + 1 + (selectFirstTeam ? 0 : 1);
    await page.getByRole('checkbox').nth(checkboxIndex).click();
    
    // Enter scores
    const scoreIndex = matchIndex * 2;
    await page.getByRole('textbox', { name: '-' }).nth(scoreIndex).fill(team1Score);
    await page.getByRole('textbox', { name: '-' }).nth(scoreIndex + 1).fill(team2Score);
    
    // Save
    await page.getByRole('button', { name: 'Save' }).nth(matchIndex).click();
    await expect(page.locator('text=✓ Saved!').nth(matchIndex)).toBeVisible({ timeout: 5000 });
    
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
    
    // Find and unlock the match in admin
    await page.locator(`#enable-${matchId}`).click();
    await expect(page.locator(`#enable-${matchId}`)).toBeChecked();
    
    // Enter actual scores
    const scoreIndex = matchIndex * 2;
    await page.getByRole('textbox', { name: '-' }).nth(scoreIndex).fill(team1Score);
    await page.getByRole('textbox', { name: '-' }).nth(scoreIndex + 1).fill(team2Score);
    
    // Save
    await page.getByRole('button', { name: 'Save' }).nth(matchIndex).click();
    await expect(page.locator('text=✓ Saved!').nth(matchIndex)).toBeVisible({ timeout: 5000 });
    
    console.log(`✅ Actual result saved for match ${matchId}`);
  }

  // Helper function to get user points from leaderboard
  async function getUserPoints(page: any, userName: string): Promise<number> {
    // Look for Randy Pagels' row and extract points
    const userRow = page.locator('tr', { has: page.locator(`text="${userName}"`) });
    await expect(userRow).toBeVisible({ timeout: 5000 });
    
    // Get the points column (usually last column)
    const pointsText = await userRow.locator('td').last().textContent();
    const points = parseInt(pointsText?.trim() || '0', 10);
    
    console.log(`📊 ${userName} has ${points} points`);
    return points;
  }

  test('complete scoring validation - all scenarios', async ({ page }) => {
    // =====================================================
    // SETUP: Login and Record Initial Points
    // =====================================================
    console.log('🔐 Step 1: Login as Randy Pagels...');
    await login(page);
    
    // Navigate to leaderboard to record baseline points
    await navigateTo(page, 'Leaderboard');
    const initialPoints = await getUserPoints(page, 'Randy Pagels').catch(() => 0);
    console.log(`📊 Initial points: ${initialPoints}`);

    // =====================================================
    // STEP 1: Make Predictions for 4 Matches
    // =====================================================
    console.log('\n⚽ Step 2: Making predictions for 4 matches...');
    await navigateTo(page, 'Predictions');

    // Scenario 1: Correct Winner Only (3 pts expected)
    // Prediction: Team1: 3, Team2: 1 (Team1 wins)
    // Actual will be: Team1: 2, Team2: 0 (Team1 wins, different score)
    await makePrediction(page, '108', true, '3', '1', 0);

    // Scenario 2: Exact Score Only (5 pts expected)
    // Prediction: Team1: 2, Team2: 1 (Team1 wins)
    // Actual will be: Team2: 2, Team1: 1 (Team2 wins, score reversed)
    await makePrediction(page, '109', true, '2', '1', 1);

    // Scenario 3: Both Correct (8 pts expected)
    // Prediction: Team1: 4, Team2: 2 (Team1 wins)
    // Actual will be: Team1: 4, Team2: 2 (Perfect match!)
    await makePrediction(page, '110', true, '4', '2', 2);

    // Scenario 4: Wrong Prediction (0 pts expected)
    // Prediction: Team1: 3, Team2: 0 (Team1 wins)
    // Actual will be: Team2: 2, Team1: 1 (Team2 wins, completely different)
    await makePrediction(page, '111', true, '3', '0', 3);

    console.log('✅ All 4 predictions made successfully');

    // =====================================================
    // STEP 2: Set Actual Results in Admin Dashboard
    // =====================================================
    console.log('\n🔧 Step 3: Navigating to Admin Dashboard...');
    await navigateTo(page, 'Admin');
    await page.waitForTimeout(1000);

    // Scenario 1: Team1 wins with different score (3 pts)
    await setActualResult(page, '108', '2', '0', 0);

    // Scenario 2: Score is correct but winner is opposite (5 pts)
    await setActualResult(page, '109', '1', '2', 1);

    // Scenario 3: Perfect match (8 pts)
    await setActualResult(page, '110', '4', '2', 2);

    // Scenario 4: Completely wrong (0 pts)
    await setActualResult(page, '111', '1', '2', 3);

    console.log('✅ All 4 actual results set in Admin');

    // =====================================================
    // STEP 3: Recalculate All Points
    // =====================================================
    console.log('\n🔄 Step 4: Recalculating all points...');
    await page.getByRole('button', { name: 'Recalculate All Points' }).click();
    await page.waitForTimeout(2000); // Wait for recalculation
    console.log('✅ Points recalculated');

    // =====================================================
    // STEP 4: Verify Points on Leaderboard
    // =====================================================
    console.log('\n📊 Step 5: Verifying points on Leaderboard...');
    await navigateTo(page, 'Leaderboard');
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scoring-validation-leaderboard.png', fullPage: true });

    // Get final points
    const finalPoints = await getUserPoints(page, 'Randy Pagels');
    const earnedPoints = finalPoints - initialPoints;

    // =====================================================
    // STEP 5: Validate Results
    // =====================================================
    console.log('\n✅ Step 6: Validating scoring results...');
    
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
║ TOTAL EXPECTED:                  ${expectedPoints} pts                   ║
║ TOTAL EARNED:                    ${earnedPoints} pts                   ║
║ STATUS:                          ${earnedPoints === expectedPoints ? '✅ PASS' : '❌ FAIL'}                 ║
╚═══════════════════════════════════════════════════════════╝
    `);

    // Assert total points are correct
    expect(earnedPoints).toBe(expectedPoints);
  });

  test('scenario 1: correct winner only - 3 points', async ({ page }) => {
    console.log('🎯 Testing: Correct Winner Only (3 points expected)');
    
    await login(page);
    await navigateTo(page, 'Leaderboard');
    const initialPoints = await getUserPoints(page, 'Randy Pagels').catch(() => 0);

    // Make prediction: Team1 wins 3-1
    await navigateTo(page, 'Predictions');
    await makePrediction(page, '108', true, '3', '1', 0);

    // Set actual: Team1 wins 2-0 (correct winner, wrong score)
    await navigateTo(page, 'Admin');
    await setActualResult(page, '108', '2', '0', 0);

    // Recalculate and verify
    await page.getByRole('button', { name: 'Recalculate All Points' }).click();
    await page.waitForTimeout(2000);

    await navigateTo(page, 'Leaderboard');
    const finalPoints = await getUserPoints(page, 'Randy Pagels');
    const earnedPoints = finalPoints - initialPoints;

    console.log(`✅ Scenario 1: Earned ${earnedPoints} points (Expected: 3)`);
    expect(earnedPoints).toBe(3);
  });

  test('scenario 2: exact score only - 5 points', async ({ page }) => {
    console.log('🎯 Testing: Exact Score Only (5 points expected)');
    
    await login(page);
    await navigateTo(page, 'Leaderboard');
    const initialPoints = await getUserPoints(page, 'Randy Pagels').catch(() => 0);

    // Make prediction: Team1 wins 2-1
    await navigateTo(page, 'Predictions');
    await makePrediction(page, '109', true, '2', '1', 0);

    // Set actual: Team2 wins 1-2 (wrong winner, exact score reversed)
    await navigateTo(page, 'Admin');
    await setActualResult(page, '109', '1', '2', 0);

    // Recalculate and verify
    await page.getByRole('button', { name: 'Recalculate All Points' }).click();
    await page.waitForTimeout(2000);

    await navigateTo(page, 'Leaderboard');
    const finalPoints = await getUserPoints(page, 'Randy Pagels');
    const earnedPoints = finalPoints - initialPoints;

    console.log(`✅ Scenario 2: Earned ${earnedPoints} points (Expected: 5)`);
    expect(earnedPoints).toBe(5);
  });

  test('scenario 3: both correct - 8 points', async ({ page }) => {
    console.log('🎯 Testing: Both Correct (8 points expected)');
    
    await login(page);
    await navigateTo(page, 'Leaderboard');
    const initialPoints = await getUserPoints(page, 'Randy Pagels').catch(() => 0);

    // Make prediction: Team1 wins 4-2
    await navigateTo(page, 'Predictions');
    await makePrediction(page, '110', true, '4', '2', 0);

    // Set actual: Team1 wins 4-2 (perfect match!)
    await navigateTo(page, 'Admin');
    await setActualResult(page, '110', '4', '2', 0);

    // Recalculate and verify
    await page.getByRole('button', { name: 'Recalculate All Points' }).click();
    await page.waitForTimeout(2000);

    await navigateTo(page, 'Leaderboard');
    const finalPoints = await getUserPoints(page, 'Randy Pagels');
    const earnedPoints = finalPoints - initialPoints;

    console.log(`✅ Scenario 3: Earned ${earnedPoints} points (Expected: 8)`);
    expect(earnedPoints).toBe(8);
  });

  test('scenario 4: wrong prediction - 0 points', async ({ page }) => {
    console.log('🎯 Testing: Wrong Prediction (0 points expected)');
    
    await login(page);
    await navigateTo(page, 'Leaderboard');
    const initialPoints = await getUserPoints(page, 'Randy Pagels').catch(() => 0);

    // Make prediction: Team1 wins 3-0
    await navigateTo(page, 'Predictions');
    await makePrediction(page, '111', true, '3', '0', 0);

    // Set actual: Team2 wins 1-2 (completely wrong)
    await navigateTo(page, 'Admin');
    await setActualResult(page, '111', '1', '2', 0);

    // Recalculate and verify
    await page.getByRole('button', { name: 'Recalculate All Points' }).click();
    await page.waitForTimeout(2000);

    await navigateTo(page, 'Leaderboard');
    const finalPoints = await getUserPoints(page, 'Randy Pagels');
    const earnedPoints = finalPoints - initialPoints;

    console.log(`✅ Scenario 4: Earned ${earnedPoints} points (Expected: 0)`);
    expect(earnedPoints).toBe(0);
  });

  test('edge case: draw predictions', async ({ page }) => {
    console.log('🎯 Testing: Draw Predictions');
    
    await login(page);
    await navigateTo(page, 'Leaderboard');
    const initialPoints = await getUserPoints(page, 'Randy Pagels').catch(() => 0);

    // Make prediction: Draw 2-2 (Team1 selected as "winner")
    await navigateTo(page, 'Predictions');
    await makePrediction(page, '112', true, '2', '2', 0);

    // Set actual: Draw 2-2 (perfect match!)
    await navigateTo(page, 'Admin');
    await setActualResult(page, '112', '2', '2', 0);

    // Recalculate and verify
    await page.getByRole('button', { name: 'Recalculate All Points' }).click();
    await page.waitForTimeout(2000);

    await navigateTo(page, 'Leaderboard');
    const finalPoints = await getUserPoints(page, 'Randy Pagels');
    const earnedPoints = finalPoints - initialPoints;

    console.log(`✅ Draw Test: Earned ${earnedPoints} points (Expected: 8 for perfect match)`);
    expect(earnedPoints).toBe(8);
  });
});
