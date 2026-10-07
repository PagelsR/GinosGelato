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
  })
);
