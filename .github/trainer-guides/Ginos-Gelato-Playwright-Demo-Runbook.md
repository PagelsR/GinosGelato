# Gino's Gelato - Playwright Demo Runbook

**Test Smarter with AI: Playwright Automation at Scale on Azure** · 60 minutes

| | |
|---|---|
| Storefront | https://wonderful-coast-040cb1a10.7.azurestaticapps.net/ |
| Reliability Dashboard | https://pagelsr.github.io/GinosGelato/ |
| Playwright Workspace | `pwwuxryfogy5mzkc` (Azure Portal → **Test runs**) |
| Repo · branch | https://github.com/PagelsR/GinosGelato · `main` |

## Demos at a Glance

| Demo | Slide | Min | The audience sees |
|---|---:|---:|---|
| 1 - The Customer Journey Becomes Code | 10 | 8 | Install, CLI favorites, codegen records an order, Journey 1 runs |
| 2 - Create a New Journey with AI | 14 | 11 | Copilot explores the site, audits the offers, then writes a test |
| 3 - Break It, Diagnose It, Fix It | 16 | 5 | A real failure, diagnosed in UI Mode, explained by Copilot |
| 4 - Run the Same Suite at Scale in Azure | 21 | 10 | 20 cloud browsers, the Portal report, the Reliability Dashboard |

Everything after **Timing** is reference material, not needed on stage.

---

# Pre-Show Checklist

## The day before

- [ ] GitHub → Actions → **Playwright Testing - Daily Schedule** → **Run workflow** (`main`).
- [ ] When it finishes: in the **Validate at Scale** job, the **Verify Playwright Workspaces reporting upload** step is green.
- [ ] Portal → `pwwuxryfogy5mzkc` → **Test runs** → newest run opens the **Ginos Gelato - Testing at Scale** report (no 404) and a trace opens. Note the run's time.
- [ ] Dashboard shows a new `🖥️ CI Runner ×1` + `☁️ Cloud Scale ×20` pair.
- [ ] Demo 1 starter folder: in an empty folder (e.g. `C:\demo\playwright-start`) run `npm init playwright@latest` and accept the defaults - so nothing downloads on stage.
- [ ] Rehearse `/demo-explore-site`, `/demo-secret-shopper` and `/demo-empty-cart` once. Note how long each takes.
- [ ] Save a known-good `demo-empty-cart.spec.ts` outside the repo as a backup.
- [ ] Confirm **Copy prompt** shows on a failed test in UI Mode.

## 30 minutes before

- [ ] Open the storefront once - it warms up the API (30-60 s on a cold start).
- [ ] Repo terminal:

  ```powershell
  npm ci
  npx playwright install chromium
  $env:PLAYWRIGHT_HTML_OPEN="never"
  ```

- [ ] Copilot Chat in **Agent** mode; Playwright MCP server running (tools list shows `playwright`).
- [ ] `git status` is clean - no leftover `e2e/demo-empty-cart.spec.ts`.

## Open these

- **Browser:** storefront · GitHub Actions · Portal **Test runs** · the verified report · Reliability Dashboard
- **VS Code:** `e2e/journey-1-happy-path-pickup.spec.ts` · `e2e/journey-5-shipping-order.spec.ts` · `playwright.service.config.ts`
- **Terminals:** one in the repo, one in the Demo 1 starter folder

---

# DEMO 1 - The Customer Journey Becomes Code

**8 min · slide 10**

**Part A - Getting started (3 min), starter-folder terminal**

1. Show the install command (already run - don't re-run it):

   ```text
   npm init playwright@latest
   ```

   It asks 4 questions: TypeScript or JavaScript, tests folder, GitHub Actions workflow, install browsers.
2. Open `playwright.config.ts` and `tests/example.spec.ts` in the starter folder.
3. Switch to the repo terminal and run:

   ```text
   npx playwright test --list
   ```

4. Name the other favorites (don't run them):

   | Command | Does |
   |---|---|
   | `npx playwright test -g "Pickup"` | Run tests by name |
   | `npx playwright test --headed` | Watch the browser |
   | `npx playwright test --ui` | UI Mode (Demo 3) |
   | `npx playwright show-report` | Open the HTML report |
   | `npx playwright codegen <url>` | Record actions as code (next) |

**Part B - Place an order by hand, with codegen watching (2.5 min)**

5. Run:

   ```text
   npx playwright codegen https://wonderful-coast-040cb1a10.7.azurestaticapps.net/
   ```

6. In the codegen browser: **Start Creating** → **Waffle Cone** → Vanilla Dream + Chocolate Fudge → Rainbow Sprinkles → **Add to Cart** → **Cart** → **Proceed to Checkout** → **Continue to Delivery** → **Store Pickup** → **Continue to Payment** → **Complete Order**. (Customer and payment fields are pre-filled.)

   **Say:** "This is Gino testing by hand - except now Playwright is writing it down."
7. Point at the recorded code: `getByRole` locators, a first draft. Close codegen without saving.

**Part C - Run the real test (2.5 min), repo terminal**

8. Open `e2e/journey-1-happy-path-pickup.spec.ts`. Point at the business steps and the two `expect` lines at the end.
9. Run:

   ```text
   npx playwright test e2e/journey-1-happy-path-pickup.spec.ts --headed --workers=1
   ```

   → Expect: the same order, ending on **Order Confirmed!** with a `GGyyMMdd-#####` number.

   **Say:** "Codegen gave us a draft. This is the keeper - it reads like a customer journey."

**If it breaks:** codegen won't open → skip Part B. The app is slow → it's cold; the test allows 90 s, keep talking.

---

# DEMO 2 - Create a New Journey with AI

**11 min · slide 14** · explore → audit → test

**Before:** Copilot Chat in **Agent** mode · Playwright MCP running · storefront warmed up.

**Part A - Explore: Copilot tours the site (2 min)**

1. In Copilot Chat, type:

   ```text
   /demo-explore-site
   ```

2. Let it run. Point at the browser moving by itself and the `browser_*` tool calls in the chat.
3. → Expect a page-by-page summary, the main journeys, top 3 tests to write, and **3 dead footer links**: Privacy Policy, Terms of Service and Nutrition Info go to `/privacy`, `/terms` and `/nutrition`, which the app doesn't have.

   **Say:** "It read the site like a screen reader would - and found broken links on its first day."

**Part B - Secret shopper: Copilot audits the offers (3-4 min)**

4. In Copilot Chat, type:

   ```text
   /demo-secret-shopper
   ```

5. → Expect this verdict ($30.75 subtotal + $2.61 tax + $4.99 delivery = **$38.35**):

   | Special Offer | Qualifies? | Applied? |
   |---|---|---|
   | Free topping with 3+ items | Yes | **No** |
   | 10% off orders over $25 | Yes | **No** |
   | Free delivery on $30+ orders | Yes | **No** - $4.99 charged |

   It's a real bug: the offers are display-only text in `Cart.tsx`; nothing in checkout or `PricingService.cs` applies them.

   **Say:** "No selectors, no code - and it caught Gino's site breaking three promises."

**Part C - Turn exploration into a test (5 min)**

6. In Copilot Chat, type:

   ```text
   /demo-empty-cart
   ```

   → Expect: it explores the live site, creates `e2e/demo-empty-cart.spec.ts`, runs it, and iterates to green on `Your cart is empty!`.

   **Say:** "Explore, generate, run, fix, green. And I still review the assertion."

**If it breaks:** Part A is slow → stop it and read out whatever it has found. Part B is slow → stop once $4.99 shows in the Order Summary and give the verdict from the table. Part C drifts → stop after it explores; open your backup `demo-empty-cart.spec.ts`. Short on time → skip Part B.

**After:** delete `e2e/demo-empty-cart.spec.ts`.

---

# DEMO 3 - Break It, Diagnose It, Fix It

**5 min · slide 16**

1. Run:

   ```text
   npx playwright test e2e/journey-5-shipping-order.spec.ts --ui
   ```

2. Click ▶ on the file. Select **Shipping order completes end-to-end** (green) → show the timeline, a locator, the DOM snapshot, and network.
3. Select **rejects shipping to a PO Box address** (red) → **Errors** tab → step to **Continue to Payment** → the snapshot shows the app went straight to payment, no error.

   **Say:** "The test isn't broken. The app is missing a rule."
4. Click **Copy prompt** → paste into Copilot Chat → add:

   ```text
   Is this a bug in the test or in the app? Where would the fix go?
   ```

   → Expect: the test is right; the checkout's shipping step has no PO Box validation.

   **Say:** "Fix It means knowing exactly where and why - in seconds."

**If it breaks:** no **Copy prompt** button → paste the error text yourself. Short on time → skip step 2.

---

# DEMO 4 - Run the Same Suite at Scale in Azure

**10 min · slide 21**

**Before:** the verified report tab and the dashboard tab are already open.

**Part A - The config (1.5 min)**

1. Open `playwright.service.config.ts`. Point at: it imports the existing config · `createAzurePlaywrightConfig` · `DefaultAzureCredential` · `runName: 'Ginos Gelato - Testing at Scale'`.
2. Show the CI command:

   ```text
   npx playwright test --config=playwright.service.config.ts --workers=20 --grep-invert "FLAKY|Flaky Test Examples"
   ```

**Part B - Trigger, don't wait (30 s)**

3. GitHub → Actions → **Playwright Testing - Daily Schedule** → **Run workflow**. Move on.

**Part C - Portal Test runs (4 min)**

4. Portal → `pwwuxryfogy5mzkc` → **Test runs**. Point at **Triggered by** (GitHub), **Duration**, **Max Concurrent Sessions**.
5. Open the verified run → **Ginos Gelato - Testing at Scale** report → the summary counts.
6. Open **rejects shipping to a PO Box address** → its trace or screenshot: "the same failure from Demo 3, now in the cloud."

   **Say:** "Playwright gave us the test. Azure gives us the browser fleet."

**Part D - Reliability Dashboard (4 min)**

7. Switch to https://pagelsr.github.io/GinosGelato/
8. **Test Outcome Trend:** hover a ◆ (Cloud Scale), then a ● (CI Runner) → compare durations.
9. **Flaky Test Distribution:** the tests that only pass on retry.
10. **Recent Test Runs:** the **Mode** column, `🖥️ CI Runner ×1` next to `☁️ Cloud Scale ×20` → click one report link.

    **Say:** "The Portal shows the evidence for one run. The dashboard shows whether we're getting better."

**If it breaks:** a report shows **HTTP 404** → switch to the verified report tab; never troubleshoot on stage. Short on time → do only steps 4, 6, 8 and 10.

---

# Closing

1. Slide **Gino's Testing Recipe** (23): read the headings, don't re-explain them, leave the links up.
2. **Say:** "A few hours ago we secured Gino's Gelato. Now we've proved the customer experience still works. Secure it, test it, ship with confidence."

The **Feedback Loop** slide (22) is hidden. Unhide it only if you have spare time.

---

# If Things Go Wrong

| Problem | Do this |
|---|---|
| App or MCP is slow | It's cold. Keep talking; if it stalls, stop and narrate the expected result. |
| Cloud run is slow | Never wait. Use the verified run. |
| Report shows HTTP 404 | Switch to the verified report tab. |
| AI drifts | Stop after it explores; open the backup `demo-empty-cart.spec.ts`. |
| Running long | Cut in this order: Demo 2 Part B → Demo 3 step 2 → Demo 4 short path. Never cut Demo 1 or Demo 4. |

---

# Timing

| Section | Slides | Min |
|---|---|---:|
| Opening + story | 1-7 | 6 |
| Playwright basics | 8-9 | 3 |
| **Demo 1** | 10 | 8 |
| Anatomy + AI + MCP | 11-13 | 5 |
| **Demo 2** | 14 | 11 |
| When a test fails | 15 | 2 |
| **Demo 3** | 16 | 5 |
| Ceiling → Azure → repo changes | 17-20 | 6 |
| **Demo 4** | 21 | 10 |
| Recipe + thank you | 23-24 | 2 |
| **Total** | | **58** |

That leaves 2 minutes of buffer. If you need more, skip Demo 2 Part B (the secret shopper) - it frees 3-4 minutes.

---
---

# Appendix - Reference (not needed on stage)

## A. 2026 product accuracy

- **Microsoft Playwright Testing was retired on March 8, 2026.** Demonstrate **Azure App Testing → Playwright Workspaces**.
- Azure App Testing has two services: Azure Load Testing and Playwright Workspaces. This talk uses Playwright Workspaces.
- Playwright Workspaces moved to the `Microsoft.LoadTestService` resource provider. The old `Microsoft.AzurePlaywrightService/accounts` type rejects writes (`DisallowedResourceOperation`) regardless of role.

## B. What's in the repo

No application code changes were needed. The talk adds:

| Piece | Where |
|---|---|
| Dev dependencies | `@azure/playwright`, `@azure/identity` in `package.json` |
| Service config | `playwright.service.config.ts` (below) |
| Cloud job | `run-playwright-tests-at-scale` in `.github/workflows/playwright-testing.yml`, parallel to the CI runner job |
| Post-deploy smoke | `validate-at-scale` in `.github/workflows/BuildDeploy.yml` (journeys only, 10 workers) |
| Workspace IaC | `iac/playwrightWorkspace.bicep`, referenced as existing by default (`createPlaywrightWorkspace = false`) |
| Dashboard | `.github/pages/dashboard.html`, published to GitHub Pages by the `publish-dashboard` job |
| AI prompts | `.github/prompts/playwright.prompt.md`, `demo-explore-site.prompt.md`, `demo-secret-shopper.prompt.md`, `demo-empty-cart.prompt.md` |
| AI conventions | `.github/skills/ginos-gelato-playwright/SKILL.md`, `.github/agents/journey-author.agent.md` (no MCP tools - use the prompt files for Demo 2) |

`playwright-testing.yml` fans out and back in, so only one job writes to GitHub Pages:

```text
run-playwright-tests           (CI Runner, 1 worker)  ─┐
                                                        ├─► publish-dashboard
run-playwright-tests-at-scale  (Cloud, 20 workers)    ─┘
```

`playwright.service.config.ts`:

```ts
export default defineConfig(
  config,
  createAzurePlaywrightConfig(config, {
    os: ServiceOS.LINUX,
    credential: new DefaultAzureCredential(),
    runName: 'Ginos Gelato - Testing at Scale',
  }),
  {
    reporter: [
      ['list'],
      ['json', { outputFile: 'test-results.json' }],
      ['html', { open: 'never' }],
      ['@azure/playwright/reporter'],
    ],
  }
);
```

The `@azure/playwright/reporter` uploads the report, traces and recordings to the workspace's storage; `html` must come before it. `runName` is the report title in the Portal.

## C. One-time Azure setup (already done)

**1. Create the workspace (Portal, once)**

- Azure Portal → **Playwright Workspaces** → **Create**.
- Resource group `rg-GinosGelato-Modernization` · name `pwwuxryfogy5mzkc` (matches the Bicep naming `pww${uniqueString(...)}`) · region **East US**.
- Leave **Reporting** on (this creates and links storage account `pwstrg20bf`). Keep local auth / access tokens off.
- Copy `playwrightWorkspaceServiceUrl` from the `provision-infrastructure` job's **Infrastructure Deployment Summary** into the GitHub secret `PLAYWRIGHT_SERVICE_URL`.

**2. Grant roles** (needs Owner or User Access Administrator)

`AZURE_CREDENTIALS` uses `82f103_ServicePrincipal_FullAccess` (app ID `a23b6a0a-5e39-4b32-ba8e-9ad656ba20e4`).

```powershell
$workspaceId = az resource list -g rg-GinosGelato-Modernization `
  --resource-type Microsoft.LoadTestService/playwrightWorkspaces --query "[0].id" -o tsv
$storageId   = az storage account show -n pwstrg20bf -g rg-GinosGelato-Modernization --query id -o tsv
$myObjectId  = az ad signed-in-user show --query id -o tsv
$spObjectId  = az ad sp show --id a23b6a0a-5e39-4b32-ba8e-9ad656ba20e4 --query id -o tsv

# Run tests on the workspace (you, for local runs)
az role assignment create --assignee $myObjectId --role "Playwright Workspace Contributor" --scope $workspaceId

# Upload reports - required, or every Portal report shows HTTP 404
az role assignment create --assignee-object-id $spObjectId --assignee-principal-type ServicePrincipal `
  --role "Storage Blob Data Contributor" --scope $storageId
az role assignment create --assignee $myObjectId --role "Storage Blob Data Contributor" --scope $storageId
```

- Shared-key access is off on `pwstrg20bf`, so uploads need **Storage Blob Data Contributor**. Owner or Contributor does not include it. Allow 5-10 minutes for a new role to apply.
- Without it, runs still appear in **Test runs** but open with **HTTP 404: The specified blob does not exist**, and the job log shows `Reporting upload status: FAILED`. Both workflows now fail the job on that line.
- To see which identity CI really uses: the **Triggered by** ID on a run in **Test runs** is that service principal's object ID.
- Runs from before the storage fix (2026-10-08) always show a 404 - never pick those on stage.

## D. Optional: Healer agent swap (replaces Demo 2 Part C)

Only if rehearsed. Replaces Part C.

1. Before the session, on a scratch branch: `npx playwright init-agents --loop=vscode` (Playwright 1.56+; the repo uses 1.58).
2. Live: copy Journey 1 to a scratch spec, break one locator (`'Waffle Cone'` → `'Waffle Cones'`), run it red.
3. Ask the **healer** agent to fix it. Show the diff, run it green.

## E. Bonus: the fan-out / fan-in graph (3 min, only if time allows)

1. GitHub → Actions → **Build and Deploy to Azure** → a completed run → graph view.
2. Point at the two parallel boxes after **Build & Deploy Frontend**: `Run Playwright Tests` (1 worker) and `Validate at Scale (Azure Playwright Workspaces)` (10 workers). Let the audience read both durations.
3. **Say:** "Both started at the same moment in the same pipeline. One is several times faster - and that's the native GitHub Actions graph, not a chart I built."

## F. What not to carry forward from the old deck

- **Drop:** the long agenda, Azure Test Plans as a storyline, Selenium/Cypress comparison tables, customer-reference slides, old Microsoft Playwright Testing branding, Private Preview reporting slides, long feature inventories.
- **Keep:** testing should earn its automation cost · tests should be independent, readable and repeatable · codegen starts a test, good locators finish it · UI Mode and Trace Viewer · CI as a quality gate · cloud parallelism as the ending.
