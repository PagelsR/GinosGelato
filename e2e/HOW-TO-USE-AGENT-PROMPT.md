# 🚀 How to Use the Agent Prompt in Another VS Code Instance

## Quick Start Guide

### Step 1: Open the Prompt File
Open [`AGENT-PROMPT-COPY-PASTE.txt`](AGENT-PROMPT-COPY-PASTE.txt) in this repo

### Step 2: Copy Everything
Look for the section marked:
```
═══════════════════════════════════════════════════════════════════
📋 COPY FROM HERE ⬇️
═══════════════════════════════════════════════════════════════════
```

Copy **everything** from there down to:
```
═══════════════════════════════════════════════════════════════════
📋 COPY TO HERE ⬆️
═══════════════════════════════════════════════════════════════════
```

### Step 3: Open New VS Code Instance
1. Open a new VS Code window (File → New Window)
2. Open GitHub Copilot Chat (Ctrl+Alt+I or Cmd+Alt+I)

### Step 4: Paste and Run
1. Paste the entire prompt into the Copilot Chat
2. Press Enter
3. Watch the agent work! 🎭

---

## 📦 Files Reference

| File | Purpose | Use When |
|------|---------|----------|
| [`AGENT-PROMPT-COPY-PASTE.txt`](AGENT-PROMPT-COPY-PASTE.txt) | **Full detailed prompt** | Complete testing with all 4 scenarios |
| [`SCORING-TEST-PROMPT.md`](SCORING-TEST-PROMPT.md) | Reference documentation | Understanding test methodology |
| [`SCORING-QUICK-REFERENCE.txt`](SCORING-QUICK-REFERENCE.txt) | Quick cheat sheet | Manual testing |
| [`TEST-RESULTS-TEMPLATE.md`](TEST-RESULTS-TEMPLATE.md) | Results documentation | Recording test outcomes |

---

## 💡 Quick Version (Short Prompt)

If you want a shorter, faster version, copy this instead:

```
/playwright explore https://yellow-ocean-020b8190f.1.azurestaticapps.net/

Login: Randy.Pagels@Xebia.com / f3Jps:t-43ddJcF

Test scoring validation - 4 scenarios on FRESH matches (not 108-111):

1. Predict A:3-1:B → Actual A:2-0:B → Expect 3pts (right winner, wrong score)
2. Predict A:2-1:B → Actual B:2-1:A → Expect 5pts (right score, wrong winner)
3. Predict A:4-2:B → Actual A:4-2:B → Expect 8pts (perfect match)
4. Predict A:3-0:B → Actual B:2-1:A → Expect 0pts (completely wrong)

For each: Make prediction → Set actual in Admin → Recalculate Points → Verify on Leaderboard → Screenshot
Total expected: 16 points. Provide detailed summary table.
```

---

## 🎯 What the Agent Will Do

1. **Open browser** to the predictions site
2. **Login** as Randy Pagels
3. **Navigate** through Predictions → Admin → Leaderboard
4. **Test each scenario:**
   - Make a prediction
   - Set actual result
   - Recalculate points
   - Verify points awarded
5. **Take screenshots** of each result
6. **Generate summary table** with pass/fail for each scenario

---

## 📸 Expected Output

The agent will provide:
- ✅ 4 screenshots (one per scenario)
- ✅ 1 final leaderboard screenshot
- ✅ Summary table showing:
  - Prediction made
  - Actual result set
  - Expected points
  - Actual points awarded
  - Pass/Fail status
- ✅ Overall test verdict (PASS/FAIL)

---

## 🔧 Troubleshooting

**Problem:** Agent can't find unused matches
- **Solution:** The test site already has predictions on matches 108-111. Tell the agent: "Use matches 115-118 instead" or "Find matches without predictions"

**Problem:** Agent stops after first scenario
- **Solution:** Encourage it: "Continue to Scenario 2" or "Complete all 4 scenarios"

**Problem:** Points calculation seems wrong
- **Solution:** Ask agent to: "Show browser console for calculation errors" or "Check if Recalculate was clicked"

**Problem:** Screenshots not saved
- **Solution:** Check your Downloads folder or ask agent: "Save screenshots to specific folder"

---

## 💰 Cost Estimate

**Using Playwright Browser:**
- Estimated time: 5-10 minutes
- Token usage: ~10,000-15,000 tokens
- Screenshots: 5 images

**Worth it because:**
- ✅ Validates scoring logic works correctly
- ✅ Visual proof of results
- ✅ Can be repeated anytime
- ✅ Catches regressions automatically

---

## 🎓 Pro Tips

1. **Run on fresh data:** Make sure matches don't already have predictions
2. **Watch the browser:** Running with visible browser (not headless) helps debug
3. **Save screenshots:** Evidence is king for bug reports
4. **Document everything:** Use the TEST-RESULTS-TEMPLATE.md after
5. **Run periodically:** After any scoring logic changes

---

## 📞 Need Help?

If the agent gets stuck or confused:

1. **Check file:** [`SCORING-QUICK-REFERENCE.txt`](SCORING-QUICK-REFERENCE.txt) for manual steps
2. **Simplify:** Run one scenario at a time instead of all 4
3. **Debug:** Ask agent to show page HTML when stuck
4. **Reset:** Close browser and start fresh

---

## ✅ Success Criteria

Test is **PASSING** if:
- ✅ Scenario 1 awards exactly 3 points
- ✅ Scenario 2 awards exactly 5 points  
- ✅ Scenario 3 awards exactly 8 points
- ✅ Scenario 4 awards exactly 0 points
- ✅ Total is exactly 16 points
- ✅ No errors in browser console

Test is **FAILING** if:
- ❌ Any scenario awards wrong points
- ❌ Total is not 16 points
- ❌ Points don't appear on leaderboard
- ❌ Recalculate doesn't work
- ❌ Console shows calculation errors

---

**Created:** March 19, 2026  
**For:** Randy Pagels  
**Project:** FIFA World Cup 2026 Predictions
