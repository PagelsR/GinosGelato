# Gino's Gelato - Playwright Demo Runbook

## Test Smarter with AI: Playwright Automation at Scale on Azure

**Talk length:** 60 minutes  
**Repo:** `https://github.com/PagelsR/GinosGelato`  
**Branch:** `feature/azure-modernization`  
**Azure resource group:** `rg-GinosGelato-Modernization`  
**Deployed storefront:** `https://wonderful-coast-040cb1a10.7.azurestaticapps.net/`

---

# 2026 Product Accuracy

The old **Microsoft Playwright Testing** service is no longer the product to demonstrate. It was retired on March 8, 2026.

For this talk, use:

**Azure App Testing -> Playwright Workspaces**

The story is still the same at a high level: keep the Playwright tests you already own, then run them on managed cloud browsers with high parallelization. The 2026 service also adds richer browser-session diagnostics, including logs, traces, screenshots, recordings, Live View, and Take Control.

---

# Repo Review - Can We Reuse the Application Insights Repo?

**Yes. Reuse the exact same repo and branch.**

The repo already has almost everything this talk needs:

- A deployed Gino's Gelato storefront.
- A real Playwright test suite in `/e2e/`.
- Stable customer journeys, including `journey-1-happy-path-pickup.spec.ts`.
- A scheduled GitHub Actions Playwright workflow.
- HTML and JSON reporting.
- Deliberately flaky tests that can be used as debugging examples.
- `.github/prompts/playwright.prompt.md`, which uses Playwright MCP for AI-assisted test generation.
- A custom `Journey Author` agent and a Playwright skill with repo-specific testing conventions.

## Required changes for the new conference talk

No application code changes are required. Do not change the existing Application Insights workflow.

Add only the cloud-test plumbing needed for Playwright Workspaces:

1. Create one **Playwright Workspace** in Azure App Testing.
2. Add `@azure/playwright` and `@azure/identity` as dev dependencies.
3. Add `playwright.service.config.ts`.
4. Add a separate GitHub Actions workflow for the cloud-scale demo.
5. Store the workspace region endpoint as `PLAYWRIGHT_SERVICE_URL` in GitHub Actions secrets.
6. Give the identity used by the workflow **Playwright Workspace Contributor** access to the workspace.

That keeps the telemetry talk and the Playwright talk isolated while both use the same application and tests.

## Optional changes

These are not required for Techorama:

- Add Bicep for the Playwright Workspace later if you want the workspace fully reproducible.
- Add Firefox and WebKit projects to the cloud-only config if you want a live cross-browser matrix.
- Generate the official Playwright Test Agents (`planner`, `generator`, `healer`) if you want to show them directly. The repo already has a purpose-built Journey Author agent, so this is optional.

---

# One-Time Setup Before the Conference

## 1. Install the service packages

From the repo root:

```text
npm install --save-dev @azure/playwright @azure/identity
```

Do not remove or replace `@playwright/test`.

## 2. Add `playwright.service.config.ts`

Create this beside `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';
import { createAzurePlaywrightConfig, ServiceOS } from '@azure/playwright';
import { DefaultAzureCredential } from '@azure/identity';
import config from './playwright.config';

export default defineConfig(
  config,
  createAzurePlaywrightConfig(config, {
    os: ServiceOS.LINUX,
    credential: new DefaultAzureCredential(),
    runName: 'Ginos Gelato - Conference Scale Demo',
  })
);
```

The repo's normal `playwright.config.ts` stays unchanged.

## 3. Create a Playwright Workspace

In Azure Portal:

1. Search for **Playwright Workspaces**.
2. Create a workspace in `rg-GinosGelato-Modernization`.
3. Choose a supported region close to the conference/demo environment.
4. Open the workspace **Get Started** page.
5. Copy the region endpoint.
6. Store it in GitHub Actions as:

```text
PLAYWRIGHT_SERVICE_URL
```

## 4. Grant access

The existing GitHub workflow already signs into Azure with `AZURE_CREDENTIALS`.

Grant that service principal:

```text
Playwright Workspace Contributor
```

on the Playwright Workspace.

For local testing, sign in with Azure CLI using an account that has the same role:

```text
az login
```

## 5. Add a dedicated cloud workflow

Recommended file:

```text
.github/workflows/playwright-azure-scale.yml
```

Recommended starting point:

```yaml
name: Playwright - Azure Scale Demo

on:
  workflow_dispatch:

permissions:
  contents: read

env:
  NODE_VERSION: '20.x'
  PLAYWRIGHT_SERVICE_URL: ${{ secrets.PLAYWRIGHT_SERVICE_URL }}

jobs:
  run-playwright-at-scale:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Run stable Playwright suite in Azure
        run: >
          npx playwright test
          --config=playwright.service.config.ts
          --workers=20
          --grep-invert "FLAKY|Flaky Test Examples"
        continue-on-error: true

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-cloud-report
          path: playwright-report/
          retention-days: 10
```

## 6. Pre-run the cloud demo

Before the session, manually dispatch the Azure scale workflow once.

Have these open as backup:

- The completed GitHub Actions run.
- The Playwright Workspace test run in Azure Portal.
- A failed or retried test with artifacts if available.

Never depend on a cloud run completing while the audience waits.

---

# Stage Setup

## Browser tabs

Open:

1. Deployed Gino's Gelato storefront.
2. GitHub repo - Actions.
3. Azure Portal - Playwright Workspace - Test runs.

## VS Code tabs

Open:

- `e2e/journey-1-happy-path-pickup.spec.ts`
- `.github/prompts/playwright.prompt.md`
- `.github/agents/journey-author.agent.md`
- `playwright.config.ts`
- `playwright.service.config.ts`
- `.github/workflows/playwright-azure-scale.yml`

## Terminal

From repo root:

```text
npm ci
npx playwright install chromium
```

Set this locally so reports do not automatically open and steal focus:

```text
PLAYWRIGHT_HTML_OPEN=never
```

On PowerShell:

```powershell
$env:PLAYWRIGHT_HTML_OPEN="never"
```

---

# DEMO 1 - The Customer Journey Becomes Code

**Target:** 6 minutes  
**Demo slide:** The Customer Journey Becomes Code

## Speaker note for the Demo slide

> **RUNBOOK: Demo 1.** Place one pickup order manually, then open `e2e/journey-1-happy-path-pickup.spec.ts` and run it headed with one worker. Show that the same customer journey becomes repeatable executable code. Return to **Anatomy of a Good Playwright Test**.

## SAY

> "Gino and Nico already know how to test this manually. The question is whether we can turn that same customer behavior into something repeatable."

## PART A - Manual journey

In the deployed storefront:

1. Start creating gelato.
2. Choose **Waffle Cone**.
3. Choose `Vanilla Dream` and `Chocolate Fudge`.
4. Add `Rainbow Sprinkles`.
5. Add to cart.
6. Checkout.
7. Choose pickup.
8. Complete the order.
9. Show **Order Confirmed!**.

Keep this fast. The point is the customer story, not the UI tour.

## PART B - Show the existing test

Switch to VS Code and open:

```text
e2e/journey-1-happy-path-pickup.spec.ts
```

Only show the major business steps and the final assertion.

Run:

```text
npx playwright test e2e/journey-1-happy-path-pickup.spec.ts --headed --workers=1
```

## SHOW

- The browser follows the same steps.
- The test uses role-based locators and web-first assertions.
- The test ends by verifying `Order Confirmed!` and the `GGyyMMdd-#####` order number.

## SAY

> "The test is not clicking random DOM nodes. It reads like a customer journey. That is what makes it maintainable."

## RETURN TO

**Anatomy of a Good Playwright Test**

---

# DEMO 2 - Create a New Journey with AI

**Target:** 7 minutes  
**Demo slide:** Create a New Journey with AI

## Speaker note for the Demo slide

> **RUNBOOK: Demo 2.** In VS Code use the existing Playwright prompt/MCP workflow to create a stronger empty-cart test. Require the agent to explore the live app first, generate the test, run it, and iterate until it passes. Save the result as `e2e/demo-empty-cart.spec.ts`. Delete or revert the demo file after the session. Return to **When a Test Fails, Don't Guess**.

## WHY THIS DEMO

This makes the **AI** part of the title real. The repo already contains:

```text
.github/prompts/playwright.prompt.md
```

That prompt explicitly tells Copilot to use Playwright MCP to interact with the application before writing code.

The repo also contains a custom:

```text
.github/agents/journey-author.agent.md
```

Use either path depending on what is most reliable in the current VS Code build.

## RECOMMENDED PROMPT

Use the existing `/playwright` prompt file, then provide:

```text
Create a Playwright test for this Gino's Gelato scenario:

A customer opens the site, goes directly to the Cart without adding anything,
and should see the empty-cart state.

Explore the live application first using Playwright MCP. Do not guess the UI.
Then create e2e/demo-empty-cart.spec.ts using the repo's existing Playwright
conventions. Assert the actual empty-cart message you observe. Run the test and
iterate until it passes.
```

Expected assertion from the current repo/UI:

```text
Your cart is empty!
```

## SHOW

Focus on the loop, not the amount of generated code:

```text
Requirement
   -> Explore real UI
   -> Generate test
   -> Run test
   -> Fix locator/assertion if needed
   -> Green test
```

## 2026 TALKING POINT

Playwright now also ships **Playwright Test Agents** that formalize the same kind of loop:

```text
Planner -> Generator -> Healer
```

You do not need to generate those agents live. The Gino repo already has its own purpose-built agent and MCP prompt, which keeps the demo specific to the application.

## CLEANUP

After the demo:

```text
git restore .
```

or delete only:

```text
e2e/demo-empty-cart.spec.ts
```

Do not leave a demo-only test in the branch unless you decide it has real value.

## RETURN TO

**When a Test Fails, Don't Guess**

---

# DEMO 3 - Debug with UI Mode and Trace Viewer

**Target:** 5 minutes  
**Demo slide:** Break It, Diagnose It, Fix It

## Speaker note for the Demo slide

> **RUNBOOK: Demo 3.** Run Journey 1 in Playwright UI Mode, then open the trace/timeline and show actions, locator details, DOM snapshots, console, and network information. If a recent scheduled run has a flaky retry/failure, use that as the failure example. Do not manufacture a random failure on stage. Return to **Local Testing Has a Ceiling**.

## SAY

> "When a browser test fails, the worst debugging strategy is rerun it and stare harder. Playwright gives us evidence."

## OPTION A - Reliable live path

Run UI Mode:

```text
npx playwright test e2e/journey-1-happy-path-pickup.spec.ts --ui
```

Run the test once and select it.

## SHOW

Keep this to four things:

1. Timeline / time-travel view.
2. The locator used for an action.
3. DOM snapshot at that moment.
4. Network or console information.

Then say:

> "This is why a browser test failure can be a debugging artifact, not just a red X."

## OPTION B - If a recent scheduled run has a failure

The daily workflow intentionally includes flaky examples. If the latest run contains a retry/failure:

1. Open the HTML report or artifact.
2. Select one failed/retried test.
3. Open its trace.
4. Show the exact action and page state where it failed.

Do not spend time trying to force a random test to fail live.

## OPTIONAL TRACE COMMAND

If you want a guaranteed trace from a successful run:

```text
npx playwright test e2e/journey-1-happy-path-pickup.spec.ts --trace on
```

Then:

```text
npx playwright show-report
```

## RETURN TO

**Local Testing Has a Ceiling**

---

# DEMO 4 - Run the Same Suite at Scale in Azure

**Target:** 8 minutes  
**Demo slide:** Run the Same Suite at Scale in Azure

## Speaker note for the Demo slide

> **RUNBOOK: Demo 4.** Show `playwright.service.config.ts`, then trigger the dedicated GitHub Actions cloud workflow or run the stable suite with `--workers=20`. Immediately switch to a pre-completed run in Azure App Testing -> Playwright Workspaces. Show parallel cloud browsers, results, and one diagnostic artifact. If useful, briefly show Live View or Take Control. Return to **The Feedback Loop**.

## SAY

> "Nothing about the customer journey changed. We are changing where the browsers run and how many can run at once."

## PART A - Show the small repo change

Open:

```text
playwright.service.config.ts
```

Point out only:

- Imports the existing Playwright config.
- Adds the Azure Playwright service config.
- Uses `DefaultAzureCredential`.
- Runs cloud browsers on Linux.

Then show the workflow command:

```text
npx playwright test --config=playwright.service.config.ts --workers=20 --grep-invert "FLAKY|Flaky Test Examples"
```

## PART B - Trigger, then leave it

Either:

- GitHub -> Actions -> **Playwright - Azure Scale Demo** -> Run workflow, or
- Run the command locally after `az login` and setting `PLAYWRIGHT_SERVICE_URL`.

Do not wait on stage.

Immediately switch to the pre-completed run.

## PART C - Azure Portal

Open:

```text
Azure App Testing -> Playwright Workspaces -> <workspace> -> Test runs
```

Select the pre-run conference run.

## SHOW

Keep it focused:

- Same Playwright suite.
- Multiple workers executing on managed cloud browsers.
- Overall duration and result summary.
- A test result.
- Trace/screenshot/recording if present.
- Live View or Take Control only if it is already staged and reliable.

## KEY LINE

> "Playwright gave us the test. Azure gives us the browser fleet."

## OPTIONAL CROSS-BROWSER POINT

The current repo keeps the live demo on Chromium for simplicity. Playwright Workspaces supports the browser and operating system matrix Playwright supports. If you want a future version of the demo to show multiple browsers, add Firefox and WebKit as **cloud-only** projects rather than changing the existing telemetry workflow.

## RETURN TO

**The Feedback Loop**

---

# Closing - No More Live Demos

After Demo 4, stay in PowerPoint.

## The Feedback Loop

Land this flow:

```text
Requirement
   -> AI-assisted test authoring
   -> Local Playwright validation
   -> Pull request
   -> Cloud browser execution
   -> Evidence when something fails
   -> Fix
   -> Repeat
```

## Techorama connection

If the audience saw the earlier Gino's Gelato security session:

> "A few hours ago we secured Gino's Gelato. Now we have proved that the customer experience still works."

Close the two-talk story with:

```text
Secure it -> Test it -> Ship with confidence
```

---

# 60-Minute Timing Guide

| Section | Target |
|---|---:|
| Gino/Nico story + why testing | 7 min |
| Playwright fundamentals | 8 min |
| Demo 1 - customer journey | 6 min |
| AI-assisted authoring | 6 min |
| Demo 2 - AI journey creation | 7 min |
| Debugging + reliability | 5 min |
| Demo 3 - UI Mode / trace | 5 min |
| CI + Azure App Testing | 6 min |
| Demo 4 - Azure scale | 8 min |
| Closing | 2 min |

**Total:** 60 minutes

---

# Presenter Safety Net

If time gets tight:

1. Never cut Demo 1. It establishes the customer journey.
2. Keep Demo 2 because AI is in the title.
3. Shorten Demo 3 to a 60-second UI Mode tour.
4. Never cut Demo 4. Azure scale is the payoff.

If cloud access is slow:

- Trigger the run, then immediately use the pre-completed Azure run.
- The audience still sees the command and the cloud results without waiting.

If AI generation drifts:

- Stop after it explores the real UI.
- Open the prepared version of `demo-empty-cart.spec.ts`.
- Say: "The important part is the loop: explore, generate, run, validate."

---

# What Not to Carry Forward from the Old Deck

Do not bring the old 2024/2025 talk forward slide-for-slide.

Retire or greatly reduce:

- The long agenda.
- Azure Test Plans integration as a major storyline.
- Selenium/Cypress comparison tables.
- Customer-reference slides.
- Old Microsoft Playwright Testing branding.
- Private Preview reporting slides.
- Long feature inventories.

Keep the strongest ideas:

- Testing should earn its automation cost.
- Tests should be independent, readable, and repeatable.
- Codegen can help start a test, but the final test still needs good locators and assertions.
- UI Mode and Trace Viewer are excellent debugging tools.
- CI turns tests into a quality gate.
- Cloud parallelism is the natural ending of the story.

