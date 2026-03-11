# Flaky Test Examples

This test file contains intentionally flaky tests designed to demonstrate:
- How the dashboard tracks flaky tests over time
- How flaky tests are treated as failures in the pass rate
- Different patterns of test flakiness

## Test Cases

### 1. Random 50/50 Test - Simulates Network Instability
Randomly fails 50% of the time using `Math.random()`. This simulates:
- Network timeouts
- API instability
- External service dependencies

### 2. Time-based Flaky Test - Fails on Odd Seconds
Fails when the current second is odd. This demonstrates:
- Time-dependent test failures
- Race conditions based on timing
- Non-deterministic test behavior

### 3. Race Condition Simulation
Randomly introduces delays and fails based on timing thresholds. This shows:
- Asynchronous timing issues
- Race conditions in web applications
- Inconsistent element loading

## Why These Tests Exist

These tests help demonstrate the **Flaky Test Tracking** feature in the dashboard:
- **Flaky tests are counted as FAILED** (not passed) in pass rate calculations
- The dashboard shows a dedicated "Flaky Test Trend" chart
- Each test run displays flaky test counts separately
- Helps identify stability issues in your test suite

## Retry Configuration

With `retries: 2` in CI:
- Tests get 3 attempts total (initial + 2 retries)
- If a test passes on any retry, it's marked as "flaky"
- Flaky tests reduce your pass rate even if they eventually pass
- This encourages fixing flaky tests rather than ignoring them

## Removing These Tests

**Important:** These are example/demonstration tests. For a production application, you should:
1. Delete this file: `e2e/flaky-tests.spec.ts`
2. Fix any real flaky tests in your suite
3. Keep the dashboard tracking - it will help identify new flaky tests

## Real-World Flaky Test Patterns

When you encounter real flaky tests, common causes include:
- **Timing Issues**: Not waiting for elements/animations to complete
- **Test Isolation**: Tests depending on previous test state
- **External Dependencies**: API calls without proper mocking
- **Browser State**: Cached data or cookies affecting results
- **Concurrency**: Race conditions in parallel test execution
