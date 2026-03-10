#!/usr/bin/env node

/**
 * Extract test metrics from Playwright JSON results
 * and update the test history file
 */

const fs = require('fs');
const path = require('path');

// Read Playwright JSON results
const resultsPath = process.argv[2] || './test-results.json';
const historyPath = process.argv[3] || './test-history.json';
const runNumber = process.argv[4] || Date.now();
const runUrl = process.argv[5] || '';

console.log(`Reading test results from: ${resultsPath}`);

let results;
try {
  const rawData = fs.readFileSync(resultsPath, 'utf8');
  results = JSON.parse(rawData);
} catch (error) {
  console.error('Error reading test results:', error.message);
  process.exit(1);
}

// Calculate metrics
const suites = results.suites || [];
const allTests = [];

function extractTests(suite) {
  if (suite.specs) {
    suite.specs.forEach(spec => {
      // Check if test is flaky (passed after retry)
      const isFlaky = spec.tests && spec.tests.some(test => {
        const results = test.results || [];
        // Flaky = has multiple results and eventually passed
        return results.length > 1 && spec.ok;
      });
      
      allTests.push({
        title: spec.title,
        ok: spec.ok,
        tests: spec.tests || [],
        isFlaky: isFlaky
      });
    });
  }
  if (suite.suites) {
    suite.suites.forEach(extractTests);
  }
}

suites.forEach(extractTests);

const total = allTests.length;
const flaky = allTests.filter(t => t.isFlaky).length;
const passed = allTests.filter(t => t.ok && !t.isFlaky).length;
const failed = allTests.filter(t => !t.ok).length;
const duration = results.stats?.duration || 0;

// Treat flaky tests as failed for pass rate calculation
const effectiveFailed = failed + flaky;
const effectivePassed = passed;

// Create summary object
const summary = {
  runId: `${new Date().toISOString().split('T')[0]}-run-${runNumber}`,
  timestamp: new Date().toISOString(),
  date: new Date().toISOString().split('T')[0],
  runNumber: runNumber,
  total: total,
  passed: effectivePassed,
  failed: effectiveFailed,
  flaky: flaky,
  skipped: 0,
  duration: Math.round(duration / 1000), // convert to seconds
  passRate: total > 0 ? Math.round((effectivePassed / total) * 100) : 0,
  reportUrl: runUrl
};

console.log('Test Summary:', JSON.stringify(summary, null, 2));

// Read existing history or create new
let history = [];
if (fs.existsSync(historyPath)) {
  try {
    const historyData = fs.readFileSync(historyPath, 'utf8');
    history = JSON.parse(historyData);
    console.log(`Loaded ${history.length} previous test runs`);
  } catch (error) {
    console.warn('Could not read history file, starting fresh:', error.message);
  }
}

// Add new summary to history
history.push(summary);

// Keep only last 50 runs
if (history.length > 50) {
  history = history.slice(-50);
}

// Write updated history
fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
console.log(`Updated history with ${history.length} total runs`);

// Also write just this run's summary for easy access
fs.writeFileSync('./current-run-summary.json', JSON.stringify(summary, null, 2));
console.log('Wrote current run summary');
