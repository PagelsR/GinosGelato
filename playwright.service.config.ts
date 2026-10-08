import { defineConfig } from '@playwright/test';
import { createAzurePlaywrightConfig, ServiceOS } from '@azure/playwright';
import { DefaultAzureCredential } from '@azure/identity';
import config from './playwright.config';

/**
 * Runs the same Playwright suite (see playwright.config.ts) on managed cloud
 * browsers via Azure App Testing - Playwright Workspaces, instead of the
 * local/CI runner. Requires the PLAYWRIGHT_SERVICE_URL environment variable
 * (the workspace's regional browser endpoint - see the Playwright Demo
 * Runbook for how to obtain and store it).
 *
 * Usage: npx playwright test --config=playwright.service.config.ts
 */
export default defineConfig(
  config,
  createAzurePlaywrightConfig(config, {
    os: ServiceOS.LINUX,
    credential: new DefaultAzureCredential(),
    runName: "Ginos Gelato - Testing at Scale",
  }),
  {
    // Playwright's defineConfig() REPLACES (not merges) the base config's
    // reporter array whenever a later argument declares its own 'reporter' -
    // so every reporter the pipeline needs must be re-listed here, not just
    // the new one. 'json' (test-results.json) feeds this repo's own
    // extract-test-metrics.js / GitHub Pages dashboard. 'html' must precede
    // the Azure Workspaces reporter (its own requirement). The Workspaces
    // reporter uploads traces/screenshots/recordings so Azure Portal's Test
    // Report view (and Live View) have artifacts to show - without it, the
    // Portal returns "HTTP 404: The specified container does not exist" for
    // any cloud run, since nothing was ever uploaded.
    reporter: [
      ['list'],
      ['json', { outputFile: 'test-results.json' }],
      ['html', { open: 'never' }],
      ['@azure/playwright/reporter'],
    ],
  }
);
