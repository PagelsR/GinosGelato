# Test Dashboard

This directory contains the Test Results Dashboard that gets deployed to GitHub Pages.

## What it does

- **Dashboard (`dashboard.html`)**: Landing page showing test trends and history
- **Test History**: Tracks pass/fail rates, duration, and links to detailed reports
- **Trend Charts**: Visualizes test metrics over time using Chart.js

## How it works

1. After each test run, Playwright generates a JSON report (`test-results.json`)
2. The `extract-test-metrics.js` script parses the results and updates `test-history.json`
3. Each test run is stored in a dated folder: `reports/YYYY-MM-DD-run-###/`
4. The dashboard reads `test-history.json` and renders trends and links
5. Everything is deployed to GitHub Pages at: `https://pagelsr.github.io/GinosGelato/`

## File Structure (on gh-pages branch)

```
/
├── index.html              (Dashboard)
├── test-history.json       (All test run metrics)
├── current-run-summary.json
└── reports/
    ├── 2026-03-10-run-123/
    │   └── index.html      (Detailed Playwright report)
    ├── 2026-03-11-run-124/
    └── ...
```

## Features

- ✅ Pass/Fail trend chart (last 20 runs)
- ✅ Duration trend chart
- ✅ Summary statistics (total runs, avg pass rate)
- ✅ Recent test runs table with direct links
- ✅ Keeps last 50 runs in history
- ✅ Mobile responsive design

## Viewing Reports

- **Dashboard**: https://pagelsr.github.io/GinosGelato/
- **Specific Run**: https://pagelsr.github.io/GinosGelato/reports/2026-03-10-run-123/
