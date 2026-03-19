# 🎯 FIFA World Cup 2026 - Scoring Validation Test Prompt

## 📋 Repeatable Agent Mode Prompt

```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Test the scoring calculation system for Randy Pagels with the following scenarios:

**Login Credentials:**
- Email: Randy.Pagels@Xebia.com
- Password: f3Jps:t-43ddJcF

**SCORING RULES TO VALIDATE:**
- 3 pts: Correct winner only (prediction has right winner but wrong exact score)
- 5 pts: Exact score only (prediction has exact score but wrong winner)
- 8 pts: Both correct (prediction has both correct winner AND exact score)
- 0 pts: Wrong prediction (neither winner nor exact score match)

**TEST SCENARIOS (Run each independently):**

**Scenario 1: Correct Winner Only (3 points expected)**
1. Login as Randy Pagels
2. Navigate to "Predictions"
3. Find first available match, unlock it
4. Select Team A as winner
5. Enter prediction: Team A: 3, Team B: 1
6. Save prediction
7. Navigate to "Admin" dashboard
8. Find the same match, unlock it
9. Enter actual result: Team A: 2, Team B: 0 (Team A wins, but different score)
10. Save actual result
11. Click "Recalculate All Points"
12. Navigate to "Leaderboard"
13. Verify Randy Pagels has +3 points from this match
14. Take screenshot showing points

**Scenario 2: Exact Score Only (5 points expected)**
1. Login as Randy Pagels
2. Navigate to "Predictions"
3. Find second available match, unlock it
4. Select Team A as winner
5. Enter prediction: Team A: 2, Team B: 1
6. Save prediction
7. Navigate to "Admin" dashboard
8. Find the same match, unlock it
9. Enter actual result: Team B: 2, Team A: 1 (Same score reversed - Team B wins instead!)
10. Save actual result
11. Click "Recalculate All Points"
12. Navigate to "Leaderboard"
13. Verify Randy Pagels has +5 points from this match
14. Take screenshot showing points

**Scenario 3: Both Correct (8 points expected)**
1. Login as Randy Pagels
2. Navigate to "Predictions"
3. Find third available match, unlock it
4. Select Team A as winner
5. Enter prediction: Team A: 4, Team B: 2
6. Save prediction
7. Navigate to "Admin" dashboard
8. Find the same match, unlock it
9. Enter actual result: Team A: 4, Team B: 2 (Exact match!)
10. Save actual result
11. Click "Recalculate All Points"
12. Navigate to "Leaderboard"
13. Verify Randy Pagels has +8 points from this match
14. Take screenshot showing points

**Scenario 4: Wrong Prediction (0 points expected)**
1. Login as Randy Pagels
2. Navigate to "Predictions"
3. Find fourth available match, unlock it
4. Select Team A as winner
5. Enter prediction: Team A: 3, Team B: 0
6. Save prediction
7. Navigate to "Admin" dashboard
8. Find the same match, unlock it
9. Enter actual result: Team B: 2, Team A: 1 (Complete opposite!)
10. Save actual result
11. Click "Recalculate All Points"
12. Navigate to "Leaderboard"
13. Verify Randy Pagels has +0 points from this match (no change)
14. Take screenshot showing points

**FINAL VERIFICATION:**
- Navigate to Leaderboard
- Verify total points: 3 + 5 + 8 + 0 = 16 points total
- Take final screenshot
- Provide summary table of all scenarios

**OUTPUT REQUIRED:**
1. Screenshot of each scenario's leaderboard result
2. Summary table showing:
   - Scenario | Prediction | Actual Result | Expected Points | Actual Points | Pass/Fail
3. Any discrepancies found in scoring logic
```

---

## 📊 Test Results Summary Template

Copy and fill this out after each test run:

```markdown
## Scoring Test Results - [Date]

### Test Environment
- **URL:** https://yellow-ocean-020b8190f.1.azurestaticapps.net/
- **User:** Randy Pagels
- **Test Date:** [YYYY-MM-DD]
- **Browser:** [Chrome/Firefox/Safari]

### Results Summary

| Scenario | Match | Prediction | Actual Result | Expected Pts | Actual Pts | Status |
|----------|-------|------------|---------------|--------------|------------|--------|
| Correct Winner Only | Match #1 | TeamA 3-1 TeamB (A wins) | TeamA 2-0 TeamB (A wins) | 3 | ___ | ⬜ PASS / ❌ FAIL |
| Exact Score Only | Match #2 | TeamA 2-1 TeamB (A wins) | TeamB 2-1 TeamA (B wins) | 5 | ___ | ⬜ PASS / ❌ FAIL |
| Both Correct | Match #3 | TeamA 4-2 TeamB (A wins) | TeamA 4-2 TeamB (A wins) | 8 | ___ | ⬜ PASS / ❌ FAIL |
| Wrong Prediction | Match #4 | TeamA 3-0 TeamB (A wins) | TeamB 2-1 TeamA (B wins) | 0 | ___ | ⬜ PASS / ❌ FAIL |

**Total Expected Points:** 16
**Total Actual Points:** ___

### Issues Found
- [ ] No issues
- [ ] Scoring logic incorrect for: ___________
- [ ] UI display issues: ___________
- [ ] Other: ___________

### Screenshots
- [x] Scenario 1 Screenshot
- [x] Scenario 2 Screenshot
- [x] Scenario 3 Screenshot
- [x] Scenario 4 Screenshot
- [x] Final Leaderboard Screenshot

### Notes
[Add any additional observations here]
```

---

## 🎯 Quick Test Command

For fast manual testing, use this shortened version:

```
Test FIFA predictions scoring for Randy.Pagels@Xebia.com (password: f3Jps:t-43ddJcF):

1. Make 4 predictions on different matches
2. In Admin, set actual results to test:
   - Match 1: Right winner, wrong score (expect 3 pts)
   - Match 2: Right score, wrong winner (expect 5 pts)
   - Match 3: Perfect match (expect 8 pts)
   - Match 4: Completely wrong (expect 0 pts)
3. Recalculate points
4. Verify leaderboard shows 16 total points
5. Screenshot each result
```

---

## 🔍 Debugging Tips

If scoring is incorrect:
1. Check browser console for calculation errors
2. Verify "Recalculate All Points" was clicked
3. Confirm actual results were saved before recalculation
4. Check if predictions were made BEFORE match locked
5. Verify both teams' scores are entered correctly
6. Refresh leaderboard page to ensure latest data loaded
