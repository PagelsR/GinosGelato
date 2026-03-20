# ⚡ FIFA Scoring Test - Ultra Quick Prompts

Copy-paste these one-liners directly into Copilot Chat in any VS Code instance.

---

## 🎯 Full Test (All 4 Scenarios) - Recommended

```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login: Randy.Pagels@Xebia.com (password: f3Jps:t-43ddJcF). Test scoring calculation with 4 scenarios on fresh matches: (1) Predict A:3-1:B, Actual A:2-0:B, expect 3pts; (2) Predict A:2-1:B, Actual B:2-1:A, expect 5pts; (3) Predict A:4-2:B, Actual A:4-2:B, expect 8pts; (4) Predict A:3-0:B, Actual B:2-1:A, expect 0pts. For each: make prediction on Predictions page → set actual result in Admin → click Recalculate All Points → verify points on Leaderboard → screenshot. Total should be 16 points. Provide summary table.
```

---

## 🧪 Individual Scenario Tests

### Scenario 1 Only: Correct Winner (3 pts)
```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login: Randy.Pagels@Xebia.com (f3Jps:t-43ddJcF). Test correct winner scoring: Predict Team A:3 vs Team B:1 on fresh match → Save → In Admin set actual A:2, B:0 → Recalculate Points → Verify +3pts on Leaderboard → Screenshot.
```

### Scenario 2 Only: Exact Score (5 pts)
```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login: Randy.Pagels@Xebia.com (f3Jps:t-43ddJcF). Test exact score: Predict Team A:2 vs Team B:1 on fresh match → Save → In Admin set actual A:1, B:2 (same score reversed!) → Recalculate Points → Verify +5pts on Leaderboard → Screenshot.
```

### Scenario 3 Only: Both Correct (8 pts)
```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login: Randy.Pagels@Xebia.com (f3Jps:t-43ddJcF). Test perfect match: Predict Team A:4 vs Team B:2 on fresh match → Save → In Admin set actual A:4, B:2 (exact match!) → Recalculate Points → Verify +8pts on Leaderboard → Screenshot.
```

### Scenario 4 Only: Wrong Prediction (0 pts)
```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login: Randy.Pagels@Xebia.com (f3Jps:t-43ddJcF). Test wrong prediction: Predict Team A:3 vs Team B:0 on fresh match → Save → In Admin set actual A:1, B:2 (opposite!) → Recalculate Points → Verify 0pts change on Leaderboard → Screenshot.
```

---

## 🔍 Exploratory Prompts

### Just Login and Explore
```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login as Randy.Pagels@Xebia.com (password: f3Jps:t-43ddJcF) and explore the Predictions, Admin, and Leaderboard pages. Find matches without predictions and show me the current point totals.
```

### Check Current State
```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login as Randy.Pagels@Xebia.com (f3Jps:t-43ddJcF), navigate to Leaderboard and show Randy's current points. Then check Predictions page for matches that don't have predictions yet.
```

### Verify Admin Access
```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login as Randy.Pagels@Xebia.com (f3Jps:t-43ddJcF), navigate to Admin dashboard, take screenshot, and verify I can access match management features.
```

---

## 📊 Verification Only (After Manual Testing)

```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login: Randy.Pagels@Xebia.com (f3Jps:t-43ddJcF). Navigate to Leaderboard and show Randy Pagels' current total points. Compare against expected: Scenario 1 (3pts) + Scenario 2 (5pts) + Scenario 3 (8pts) + Scenario 4 (0pts) = 16 total. Screenshot and report if actual matches expected.
```

---

## 🚨 Debugging Prompts

### Screenshot All Pages
```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login as Randy.Pagels@Xebia.com (f3Jps:t-43ddJcF). Navigate to each page (Home, Predictions, Leaderboard, Admin) and take fullpage screenshots of each. Show me what's visible.
```

### Check Console Errors
```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login as Randy.Pagels@Xebia.com (f3Jps:t-43ddJcF). Navigate to Admin, click "Recalculate All Points", and show me any console errors or warnings that appear.
```

### Inspect Match Structure
```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login as Randy.Pagels@Xebia.com (f3Jps:t-43ddJcF). Go to Predictions page, inspect the HTML structure of a match card (show checkboxes, input fields, Save button selectors). Screenshot with DevTools open.
```

---

## 🎨 Custom Tests

### Test with Specific Matches
```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login: Randy.Pagels@Xebia.com (f3Jps:t-43ddJcF). Test scoring on matches 115-118 specifically: Run all 4 scenarios (correct winner, exact score, both, wrong) and verify 16 total points.
```

### Test Draw Scenarios
```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login: Randy.Pagels@Xebia.com (f3Jps:t-43ddJcF). Test draw scoring: Predict 2-2 draw on fresh match → In Admin set actual 2-2 → Recalculate → Should get 8pts for perfect match. Screenshot and verify.
```

### Stress Test (10 Predictions)
```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login: Randy.Pagels@Xebia.com (f3Jps:t-43ddJcF). Make 10 random predictions on different matches, set varying actual results in Admin, recalculate, and show final points breakdown on Leaderboard.
```

---

## 💡 Tips for Best Results

1. **Always specify "fresh match"** or "match without predictions" to avoid conflicts
2. **Include screenshots** in the prompt to get visual evidence
3. **Use specific match numbers** if you know which ones are available
4. **Break into steps** if agent seems confused (do one scenario at a time)
5. **Ask for summaries** to get formatted tables and pass/fail verdicts

---

## 🎯 Success Indicators

The prompt worked if you get:
- ✅ Browser opens and navigates correctly
- ✅ Login succeeds
- ✅ Predictions are saved
- ✅ Admin shows actual results saved
- ✅ Points appear on Leaderboard
- ✅ Screenshots are captured
- ✅ Summary table is generated

---

## 🔗 Related Files

- Full prompt: [`AGENT-PROMPT-COPY-PASTE.txt`](AGENT-PROMPT-COPY-PASTE.txt)
- How-to guide: [`HOW-TO-USE-AGENT-PROMPT.md`](HOW-TO-USE-AGENT-PROMPT.md)
- Reference: [`SCORING-QUICK-REFERENCE.txt`](SCORING-QUICK-REFERENCE.txt)
- Results template: [`TEST-RESULTS-TEMPLATE.md`](TEST-RESULTS-TEMPLATE.md)
