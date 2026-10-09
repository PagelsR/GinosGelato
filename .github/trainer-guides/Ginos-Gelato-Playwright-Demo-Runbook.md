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

## Required changes for the new conference talk — status: implemented

No application code changes were required. The existing Application Insights
workflow is unchanged.

The cloud-test plumbing is now **in the repo**, not just recommended:

1. ✅ **Playwright Workspace is IaC** — `iac/playwrightWorkspace.bicep`
   (`Microsoft.LoadTestService/playwrightWorkspaces`), wired into
   `iac/main.bicep`. It deploys to its own region (`eastus` by default, via
   the `playwrightWorkspaceLocation` param) because Playwright Workspaces
   isn't available in every region, and the rest of the stack may deploy
   elsewhere.

   **Real-world note:** Playwright Workspaces moved to the
   `Microsoft.LoadTestService` resource provider (alongside Azure Load
   Testing). The older `Microsoft.AzurePlaywrightService/accounts` type is
   retired and rejects writes outright — that's a hard failure, not a
   permissions issue, regardless of RBAC role. If you hit
   `DisallowedResourceOperation` on `accounts`, that's the tell. Also: the
   deploying identity typically has Contributor only, which can't do
   `Microsoft.Authorization/roleAssignments/write` (needs Owner/User Access
   Administrator) — so this repo's module defaults to referencing an
   **already-existing** workspace (`createPlaywrightWorkspace = false` in
   `iac/main.bicep`) rather than creating one, to keep the pipeline
   deterministic. Create the workspace once, manually, in the Portal (name it
   to match the Bicep naming convention — see step 3 below), then let Bicep
   read its outputs.
2. ✅ `@azure/playwright` and `@azure/identity` are dev dependencies in
   `package.json`.
3. ✅ `playwright.service.config.ts` exists at the repo root.
4. ✅ **No third workflow file.** The cloud-scale run is integrated directly
   into `.github/workflows/playwright-testing.yml` as a parallel job:
   `run-playwright-tests-at-scale` runs alongside the daily local job
   (true fan-out, same workflow run), with a third `publish-dashboard` job
   fanning back in to do the single GitHub Pages write for both.
5. ✅ **No manual copy-paste needed for `PLAYWRIGHT_SERVICE_URL`.**
   `iac/playwrightWorkspace.bicep` outputs `playwrightWorkspaceServiceUrl` -
   the exact `wss://...` browser endpoint, computed from the workspace's
   `workspaceId` property and region, matching what the Portal's **Get
   Started** page shows. Copy that value from the `provision-infrastructure`
   job's **Infrastructure Deployment Summary** and store it as the GitHub
   Actions secret `PLAYWRIGHT_SERVICE_URL`.
6. ⏳ **RBAC is still a manual one-time step** (`assignPlaywrightWorkspaceRoles
   = false` by default) because role assignment needs Owner/User Access
   Administrator, not the Contributor role CI principals should have. Grant
   access with the `az role assignment create` command in step 4 of "One-Time
   Setup" below.
7. ✅ **One combined dashboard, not two disconnected ones.** The existing
   GitHub Pages dashboard (`https://pagelsr.github.io/GinosGelato/`) now shows
   both the daily local run and the cloud-scale run on the same timeline and
   table, tagged with a **Mode** badge (`🖥️ CI Runner ×1` vs `☁️ Cloud Scale
   ×20`) so the parallelism story is visible at a glance, not in two separate
   places.

That keeps the telemetry talk and the Playwright talk isolated while both use the same application and tests.

## Optional changes

These are still not required for the talk:

- Add Firefox and WebKit projects to the cloud-only config if you want a live cross-browser matrix.
- Generate the official Playwright Test Agents (`planner`, `generator`, `healer`) if you want to show them directly. The repo already has a purpose-built Journey Author agent, so this is optional.
- Link a customer-managed Azure Storage account to the workspace for custom
  artifact retention (the default is Microsoft-managed storage, which is
  sufficient for this demo).

---

# One-Time Setup Before the Conference — all steps below are already done in the repo

This section is kept as a reference for how the pieces fit together. You
don't need to repeat steps 1–2 and 4–5; they're already committed.

## 1. Service packages (done)

`package.json` already lists `@azure/playwright` and `@azure/identity` as
dev dependencies, alongside the unchanged `@playwright/test`.

## 2. `playwright.service.config.ts` (done)

Lives at the repo root, beside `playwright.config.ts`:

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

The repo's normal `playwright.config.ts` stays unchanged.

The `reporter` block is what makes the Azure Portal's Test runs reports work:
`@azure/playwright/reporter` uploads the HTML report, traces, screenshots and
recordings to the workspace's linked storage account, and `html` must come
before it. `runName` is the title you'll see on each run's report in the
Portal (**Ginos Gelato - Testing at Scale**).

## 3. Playwright Workspace (manual one-time creation + IaC reference)

`iac/playwrightWorkspace.bicep` can create the workspace via Bicep
(`createPlaywrightWorkspace = true`), but this environment's subscription
rejects ARM writes to the live resource type for this preview-era service, so
the default is to create it **once, manually**, and have Bicep reference it
as `existing` from then on (`createPlaywrightWorkspace = false`, the
default):

1. Azure Portal → search **Playwright Workspaces** → **Create**.
2. **Resource group:** `rg-GinosGelato-Modernization`.
3. **Name:** match the Bicep naming convention exactly -
   `pww${uniqueString(subscription().subscriptionId, resourceGroup().id)}`.
   For this repo's subscription/RG that resolves to `pwwuxryfogy5mzkc` - find
   the current expected value by checking the name of any other deployed
   resource in the group (e.g. `app<suffix>`, `sql<suffix>`) and swapping the
   `pww` prefix in.
4. **Region:** `East US` (matches `playwrightWorkspaceLocation` default).
5. Leave **Reporting** enabled; don't enable local auth/access tokens (the
   repo authenticates via Entra ID / `DefaultAzureCredential` only). Enabling
   Reporting creates and links a storage account in the same resource group
   (currently `pwstrg20bf`) - every run's report is uploaded there, into a
   container named after the workspace ID.
6. After creation, the `provision-infrastructure` job's **Infrastructure
   Deployment Summary** will show `playwrightWorkspaceServiceUrl` - the
   ready-to-use `wss://...` browser endpoint, computed directly from the
   workspace's `workspaceId` property (no manual Portal copy needed). Store
   that value as a GitHub Actions secret named:

```text
PLAYWRIGHT_SERVICE_URL
```

## 4. Access (role assignment is opt-in — manual step required by default)

`iac/playwrightWorkspace.bicep` can grant the built-in
**Playwright Workspace Contributor** role to the deployment service principal
and the `adminObjectId` admin user, but that requires
`Microsoft.Authorization/roleAssignments/write` — which comes with **Owner**
or **User Access Administrator**, not **Contributor**. Most CI service
principals are (correctly, least-privilege) Contributor only, so this is
**off by default** (`assignPlaywrightWorkspaceRoles = false` in
`iac/main.bicep`) to avoid failing the whole deployment.

After the workspace is deployed, grant access manually (one-time, requires an
account with Owner/User Access Administrator on the resource group):

```powershell
# Resource ID of the deployed Playwright Workspace (works without knowing the
# generated name or the deployment name - main.bicep also outputs
# playwrightWorkspaceId directly if you have the deployment name handy)
$workspaceId = az resource list --resource-group rg-GinosGelato-Modernization `
  --resource-type Microsoft.LoadTestService/playwrightWorkspaces --query "[0].id" -o tsv

# Your own object ID (the signed-in az CLI account) - or use the adminObjectId
# default already in iac/main.bicep (0aa95253-9e37-4af9-a63a-3b35ed78e98b / RPagels)
$myObjectId = az ad signed-in-user show --query id -o tsv

az role assignment create --assignee $myObjectId `
  --role "Playwright Workspace Contributor" --scope $workspaceId
```

Repeat for the deployment service principal's object ID (the one behind
`AZURE_DEPLOY_SP_OBJECT_ID`, if that secret is set - find it with
`az ad sp show --id <AZURE_CREDENTIALS clientId> --query id -o tsv`) so CI can
run cloud tests too. If you'd rather have Bicep assign the roles
automatically, temporarily grant the deploying identity **User Access
Administrator** on the resource group, redeploy with
`assignPlaywrightWorkspaceRoles=true`, then revoke the elevated role.

For local testing, sign in with Azure CLI using an account that has the same role:

```text
az login
```

### Reporting storage access (required for Portal reports)

Starting runs on the workspace is not enough - the Portal's Test runs reports
only work if the reporter can **upload** to the linked storage account
(`pwstrg20bf`). Shared-key access is disabled on that account, so uploads use
Entra ID and need the data-plane role **Storage Blob Data Contributor**.
Owner or Contributor on the storage account does **not** include it.

Grant it to the identity behind `AZURE_CREDENTIALS` (currently
`82f103_ServicePrincipal_FullAccess`, app ID
`a23b6a0a-5e39-4b32-ba8e-9ad656ba20e4`) and to yourself for local runs:

```powershell
$storageId = az storage account show -n pwstrg20bf -g rg-GinosGelato-Modernization --query id -o tsv
$spObjectId = az ad sp show --id a23b6a0a-5e39-4b32-ba8e-9ad656ba20e4 --query id -o tsv

az role assignment create --assignee-object-id $spObjectId `
  --assignee-principal-type ServicePrincipal `
  --role "Storage Blob Data Contributor" --scope $storageId
az role assignment create --assignee $myObjectId `
  --role "Storage Blob Data Contributor" --scope $storageId
```

Allow 5-10 minutes for the role to take effect. If it's missing, the test
runs still appear in the Portal's Test runs list, but opening one shows
**HTTP 404: The specified blob does not exist**, and the cloud-scale job's
log shows `Reporting upload status: FAILED`. Both workflows now fail the
cloud-scale job on that line (step **Verify Playwright Workspaces reporting
upload**), so it can't go unnoticed.

To confirm which identity CI actually runs as, check the **Triggered by** ID
on any run in the Portal's Test runs list - it's that service principal's
object ID.

## 5. Cloud-scale job (done — integrated into the existing daily/push workflow)

No dedicated third workflow file. `.github/workflows/playwright-testing.yml`
has three jobs forming a fan-out / fan-in, the same shape used in
`BuildDeploy.yml`:

```text
run-playwright-tests (CI Runner, 1 worker)  ─┐
                                               ├─► publish-dashboard
run-playwright-tests-at-scale (20 workers)   ─┘
```

The two test jobs run fully in parallel (true fan-out, no `needs:` between
them) — `run-playwright-tests-at-scale` runs the stable suite
(`--grep-invert "FLAKY|Flaky Test Examples"`) via
`playwright.service.config.ts --workers=20`, authenticating with the same
`AZURE_CREDENTIALS` secret the rest of the pipeline already uses. Each just
uploads its raw `test-results.json` + `playwright-report/` as a build
artifact — neither touches GitHub Pages directly.

`publish-dashboard` (`needs: [run-playwright-tests, run-playwright-tests-at-scale]`)
is the single fan-in point: it downloads both artifacts, extracts metrics for
both tagged entries (`ci-runner` / `cloud-scale`) into the **same**
`test-history.json`, and does the one gh-pages push. This keeps the
GitHub Actions graph showing a true parallel diamond (like **PART C** in the
BONUS section) while avoiding a race where two jobs independently push to
gh-pages at the same time. See **Testing at Scale: Reporting Dashboards**
below.

## 6. Pre-run the cloud demo

Before the session, manually dispatch `playwright-testing.yml` once so a
completed cloud run exists:

1. GitHub -> Actions -> **Playwright Testing - Daily Schedule** -> **Run
   workflow** (branch `main`).
2. When it finishes, open the **Validate at Scale (Azure Playwright
   Workspaces)** job and confirm the **Verify Playwright Workspaces reporting
   upload** step is green. If it's red, see **Reporting storage access**
   above - the Portal report for that run will be a 404.
3. Azure Portal -> `pwwuxryfogy5mzkc` -> **Test runs** -> click the newest
   run. Confirm the **Ginos Gelato - Testing at Scale** report loads and a
   test's trace opens. Note the run's time so you can find it on stage.
4. Open https://pagelsr.github.io/GinosGelato/ and confirm the newest rows in
   **Recent Test Runs** are a `🖥️ CI Runner ×1` and a `☁️ Cloud Scale ×20`
   pair from that run (the dashboard updates a few minutes after the
   workflow, once GitHub Pages redeploys).

Runs from before the reporting-storage fix (2026-10-08) still appear in the
Test runs list but always show a 404 - never pick those on stage.

Have these open as backup:

- The completed GitHub Actions run.
- The Playwright Workspace test run in Azure Portal (the report verified in
  step 3, already open).
- The Reliability Dashboard.
- A failed or retried test with artifacts if available.

Never depend on a cloud run completing while the audience waits.

---

# Stage Setup

## Browser tabs

Open:

1. Deployed Gino's Gelato storefront.
2. GitHub repo - Actions.
3. Azure Portal - Playwright Workspace `pwwuxryfogy5mzkc` - **Test runs**.
4. Azure Portal - the pre-verified **Ginos Gelato - Testing at Scale** run
   report (see **Pre-run the cloud demo**), so Demo 4 never depends on
   navigation.
5. Reliability Dashboard - https://pagelsr.github.io/GinosGelato/

## VS Code tabs

Open:

- `e2e/journey-1-happy-path-pickup.spec.ts`
- `e2e/journey-5-shipping-order.spec.ts` (Demo 3 - the PO Box failure)
- Copilot Chat in **Agent** mode, Playwright MCP server running (Demo 2)
- `.github/prompts/playwright.prompt.md`
- `.github/agents/journey-author.agent.md`
- `playwright.config.ts`
- `playwright.service.config.ts`
- `iac/playwrightWorkspace.bicep`
- `.github/workflows/playwright-testing.yml` (see `run-playwright-tests-at-scale` and the fan-in `publish-dashboard` job)
- `.github/pages/dashboard.html` (see the Mode badge / blended dashboard logic)

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

**Target:** 9 minutes (Part A 3-4 min, Part B 5 min)  
**Demo slide:** Create a New Journey with AI

## Speaker note for the Demo slide

> **RUNBOOK: Demo 2.** **A)** Playwright MCP: Copilot drives the storefront as a secret shopper and audits the Special Offers - no code. **B)** `/playwright` prompt → `e2e/demo-empty-cart.spec.ts` → run until green. Delete the file after. Return to **When a Test Fails, Don't Guess**.

## WHY THIS DEMO

This makes the **AI** part of the title real, in two steps:

- **Part A** - Copilot drives a real browser through the storefront from a
  plain-English request, using the Playwright MCP server. No test code at all.
- **Part B** - the same MCP tools explore the live app *before* writing a
  test, so the generated test is based on the real UI, not guesses.

Use the repo's `/playwright` prompt for Part B:

```text
.github/prompts/playwright.prompt.md
```

It lists the Playwright MCP tools (`playwright/*`) and tells Copilot to explore
the app before writing code. The custom `.github/agents/journey-author.agent.md`
does **not** list the Playwright MCP tools, so it can't explore the live app -
use the prompt file, not the agent, for this demo.

## PART A - Playwright MCP: Copilot Drives the Storefront

**Before the session:**

1. Copilot Chat in **Agent** mode, with the Playwright MCP server running (the
   tools picker lists the `playwright` tools).
2. Warm the app: open https://wonderful-coast-040cb1a10.7.azurestaticapps.net/
   once - the API can take 30-60 seconds on a cold start.
3. Dry-run the prompt below once on the day and note how long it takes.

## SAY

> "Before we write a single line of test code, let's give Copilot a browser
> and a job."

## THE PROMPT

Paste into Copilot Chat (Agent mode):

```text
You're a secret shopper for Gino's Gelato, and Gino suspects his website is
making promises it doesn't keep. Use the Playwright browser tools to do this
for real - don't write any code.

1. Open https://wonderful-coast-040cb1a10.7.azurestaticapps.net/
2. Order three sundaes - one for Gino, one for Nico, and one for the Techorama
   audience. Each one: Bowl Cup, three flavors of your choice (make them
   interesting), with Hot Fudge and Whipped Cream. Add all three to the cart.
3. On the Cart page, read me the "Special Offers" box.
4. Check out as Gino Gelato (gino@ginosgelato.test, 555-0100) with Local
   Delivery to 123 Gelato Street, Sweet City, SC 12345. Stop at the payment
   step. Do NOT place the order.
5. Report back like Gino's accountant: an itemized bill, then for each Special
   Offer - did this order qualify, and was it actually applied? Show the math
   and end with a one-line verdict.
```

## WHAT SHOULD HAPPEN

Each sundae is $10.25 (Bowl Cup $3.00 + 3 flavors × $2.00 + Hot Fudge $0.75 +
Whipped Cream $0.50), so three make a **$30.75 subtotal** - enough to qualify
for every offer on the Cart page:

| Special Offer | Qualifies? | Applied? |
|---|---|---|
| Free topping with 3+ items | Yes - 3 items | **No** |
| 10% off orders over $25 | Yes - $30.75 | **No** |
| Free delivery on $30+ orders | Yes - $30.75 | **No** - $4.99 delivery fee charged |

Order Summary at the payment step: Subtotal **$30.75**, Tax (8.5%) **$2.61**,
Delivery **$4.99**, Total **$38.35**.

This is a real bug, not a staged one: the offers are display-only text in
`ginos-gelato/client/src/pages/Cart.tsx`, and neither the client checkout nor
the API (`ginos-gelato/server/Services/PricingService.cs`) applies any of them.

## SHOW

- The browser moving by itself while the tool calls (`browser_navigate`,
  `browser_click`, `browser_snapshot`, ...) stream into the chat.
- The accountant's verdict.

## SAY

> "No selectors. No code. Copilot read the page the way a screen reader does,
> drove a real browser, and caught Gino's website breaking three promises.
> Now let's have it write a test we can keep."

**If it runs long:** stop it once the $4.99 delivery fee appears in the Order
Summary, and give the verdict yourself from the table above.

## PART B - Turn Exploration into a Test

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

You do not need to generate those agents live. The Gino repo already has its own purpose-built MCP prompt, which keeps the demo specific to the application.

## OPTIONAL SWAP - Healer agent (replaces Part B, never added to it)

Only if rehearsed - Part B is the reliable path.

1. Before the session, on a scratch branch, generate the agents once
   (Playwright 1.56+; the repo uses 1.58):

   ```text
   npx playwright init-agents --loop=vscode
   ```

2. Live: copy Journey 1 to a scratch spec and break one locator (for example
   `'Waffle Cone'` → `'Waffle Cones'`). Run it red.
3. Ask the **healer** agent to fix it. Show the diff, run it green.

> "The healer didn't guess - it re-read the real page and repaired the
> locator. I still review the change."

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
Part A creates nothing - it stops before placing the order.

## RETURN TO

**When a Test Fails, Don't Guess**

---

# DEMO 3 - Debug with UI Mode, Trace Viewer, and AI

**Target:** 5 minutes  
**Demo slide:** Break It, Diagnose It, Fix It

## Speaker note for the Demo slide

> **RUNBOOK: Demo 3.** Run `journey-5-shipping-order.spec.ts` in UI Mode. Tour the timeline on a passing test, then open the **PO Box** failure: error, steps, DOM snapshot. Click **Copy prompt** and let Copilot say whether the bug is in the test or the app. Return to **Local Testing Has a Ceiling**.

## SAY

> "When a browser test fails, the worst debugging strategy is rerun it and stare harder. Playwright gives us evidence."

## WHY THE PO BOX TEST

`e2e/journey-5-shipping-order.spec.ts` contains **"rejects shipping to a PO Box
address"** - a test that fails on every run, by design. It asserts a business
rule the app doesn't implement yet (no shipping to PO Boxes). It's a real
failure, not a staged or flaky one, so there's nothing to manufacture on stage.
The same test also shows up red in Demo 4's cloud report and on the
Reliability Dashboard.

## PART A - UI Mode tour (1.5 min)

```text
npx playwright test e2e/journey-5-shipping-order.spec.ts --ui
```

Run the whole file. Select **Shipping order completes end-to-end** (green) and
keep it to four things:

1. Timeline / time-travel view.
2. The locator used for an action.
3. DOM snapshot at that moment.
4. Network or console information.

## PART B - Break It, Diagnose It (2 min)

Select **rejects shipping to a PO Box address** (red).

1. **Errors** tab: *"App should reject shipping to a PO Box, but no such
   validation exists yet."*
2. Step through the actions: the address typed as `PO Box 1234`, then
   **Continue to Payment** clicked.
3. DOM snapshot after the click: the app went straight to the payment step,
   with no error message.

> "The test isn't broken. The app is missing a rule - and Playwright handed us
> the evidence."

## PART C - Fix It, with AI (1.5 min)

1. On the error, click **Copy prompt** (Playwright 1.51+, in UI Mode and in the
   HTML report). It copies the error, the test source and a page snapshot as a
   ready-made prompt.
2. Paste it into Copilot Chat and add:

   ```text
   Is this a bug in the test or in the app? Where would the fix go?
   ```

3. Expected answer: the test is right; the checkout's shipping step has no PO
   Box validation.

Don't implement the fix live. "Fix It" here means knowing exactly where and why,
in seconds.

If **Copy prompt** isn't there in your build, select the error text, paste it
into Copilot Chat yourself, and ask the same question. Check this in rehearsal.

## BACKUP

The PO Box test also fails in every cloud-scale run, so its trace is in the
latest Portal report (Demo 4 Part C) and in the GitHub Actions
`cloud-scale-results-*` artifact.

For an HTML-report version of the same flow (it also has **Copy prompt**):

```text
npx playwright test e2e/journey-5-shipping-order.spec.ts --trace on
npx playwright show-report
```

## RETURN TO

**Local Testing Has a Ceiling**

---

# DEMO 4 - Run the Same Suite at Scale in Azure

**Target:** 10 minutes  
**Demo slide:** Run the Same Suite at Scale in Azure

## Speaker note for the Demo slide

> **RUNBOOK: Demo 4.** Show `playwright.service.config.ts`, then trigger the **Playwright Testing - Daily Schedule** GitHub Actions workflow or run the stable suite with `--workers=20`. Immediately switch to a pre-completed run in Azure App Testing -> Playwright Workspaces -> Test runs and open its **Ginos Gelato - Testing at Scale** report. Show parallel cloud browsers, results, and one diagnostic artifact. Then open the **Reliability Dashboard** (https://pagelsr.github.io/GinosGelato/) and show the same run as a ☁️ Cloud Scale row next to the 🖥️ CI Runner row. Return to **Gino's Testing Recipe**.

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

- GitHub -> Actions -> **Playwright Testing - Daily Schedule** -> Run workflow
  (runs `run-playwright-tests` and `run-playwright-tests-at-scale` in
  parallel, then `publish-dashboard`), or
- Run the command locally after `az login` and setting `PLAYWRIGHT_SERVICE_URL`.

Do not wait on stage.

Immediately switch to the pre-completed run.

## PART C - Azure Portal: Playwright Workspace Test runs

Open:

```text
Azure App Testing -> Playwright Workspaces -> pwwuxryfogy5mzkc -> Test runs
```

(Or type `pwwuxryfogy5mzkc` in the Portal search bar, then select **Test
runs** in the left menu.)

1. **The Test runs list.** Point at the columns: **Time**, **Triggered by**
   (the GitHub Actions icon - CI started these, not a laptop), **Duration**,
   **Max Concurrent Sessions** (how many cloud browsers ran at once) and
   **Branch**. One sentence: "Every CI run lands here automatically."
2. **Open the pre-run conference run.** Click the run you verified in **Pre-run
   the cloud demo** (or switch to the tab you already have open). It opens as
   **Ginos Gelato - Testing at Scale** - the `runName` from
   `playwright.service.config.ts`.
3. **The run summary.** Total, passed, failed and flaky counts, and the
   overall duration.
4. **One test.** Click a test - ideally **rejects shipping to a PO Box
   address**, the same failure from Demo 3 - and open its trace,
   screenshot or recording.

If a run shows **HTTP 404: The specified blob does not exist**, don't
troubleshoot on stage - switch to the pre-verified report tab. (Cause: that
run's report was never uploaded; see **Reporting storage access**.)

## SHOW

Keep it focused:

- Same Playwright suite.
- Multiple workers executing on managed cloud browsers (**Max Concurrent
  Sessions**).
- Overall duration and result summary.
- A test result.
- Trace/screenshot/recording if present.
- Live View or Take Control only if it is already staged and reliable.

## SAY

> "This is the evidence for one exact run - test by test, browser by
> browser. Now let's zoom out from one run to every run."

## PART D - The Reliability Dashboard

Switch to the dashboard tab from **Stage Setup**:

```text
https://pagelsr.github.io/GinosGelato/
```

The page is titled **Gino's Gelato — Customer Journey & Reliability
Dashboard**. It blends **both** run types - the CI runner (1 worker) and the
Azure cloud-scale run (20 workers) - into one timeline and table. Walk it top
to bottom:

1. **KPI strip** (top row) - the latest run's headline numbers.
2. **Test Outcome Trend** - leave **All runs** selected. The legend line
   above the chart reads `● CI Runner (1 worker)  ◆ Cloud Scale (parallel
   Azure Playwright Workspaces)`. Hover a ◆ diamond, then a ● circle next to
   it, and compare durations. Optionally toggle **Passed** off so only
   **Failed** and **Flaky** remain.
3. **Flaky Test Distribution** - the tests that passed only on retry over
   the last 50 runs. This is the "which tests do we stop trusting" view.
4. **Recent Test Runs** - point at the **Mode** column: `🖥️ CI Runner ×1`
   next to `☁️ Cloud Scale ×20` from the same workflow run - the ☁️ row is
   the run you just opened in the Portal (match it by time). Click one row's
   report link to show it opens that run's archived HTML report.

## SHOW

- The **Mode** column in the runs table: `🖥️ CI Runner ×1` next to
  `☁️ Cloud Scale ×20` - same suite, same timeline, wildly different worker
  counts, side by side.
- The trend chart legend: circle markers are CI Runner runs, diamond markers
  are Cloud Scale runs - point out a cloud-scale run's marker and its much
  shorter duration for the same (or larger) test count.
- The recent runs table, each linking to its own archived HTML report.

## SAY

> "This isn't two separate systems bolted together. It's one dashboard, one
> URL, and now you can see at a glance which runs used twenty cloud browsers
> instead of one - and how much faster that made the same suite. It's built
> entirely from our own Playwright JSON reports, tagged by which job produced
> them - no extra Azure resource required for this view."

## KEY LINE

> "Playwright gave us the test. Azure gives us the browser fleet. The
> Portal shows the evidence for one exact run; the Reliability Dashboard
> shows whether we're getting better or worse over time."

## OPTIONAL CROSS-BROWSER POINT

The current repo keeps the live demo on Chromium for simplicity. Playwright Workspaces supports the browser and operating system matrix Playwright supports. If you want a future version of the demo to show multiple browsers, add Firefox and WebKit as **cloud-only** projects rather than changing the existing telemetry workflow.

## RETURN TO

**Gino's Testing Recipe**

---

# BONUS - The Fan-Out / Fan-In Graph

**Target (if time permits):** 3 minutes
**Use this if:** Demo 4 lands early, or during Q&A — not inserted into the
core 60 minutes (see the timing guide below). The Reliability Dashboard and
the Portal Test runs are **not** part of this bonus - they're core, in
Demo 4.

## WHY THIS DEMO

The dashboard answers "is this trending up or down," the Portal answers "why
did this exact run fail," and the GitHub Actions pipeline graph itself
answers "was it actually worth it" - no narration required.

## PART A - Build and Deploy to Azure graph

This one needs zero narration - the GitHub Actions graph proves the point by
itself. Open:

```text
GitHub -> Actions -> Build and Deploy to Azure -> a completed run -> graph view
```

## SHOW

Point at the box between **Build & Deploy Frontend** and
**Post-Deployment Verification**. It fans out into two parallel jobs and fans
back in:

- `Run Playwright Tests` (GitHub-hosted runner, 1 worker) - its duration label.
- `Validate at Scale (Azure Playwright Workspaces)` (cloud browsers,
  10 workers) - its duration label, printed right next to the first one.

Say nothing yet. Let the audience read both numbers - e.g. `10m 17s` next to
`1m 10s`. Same deployment, same starting instant, two branches, one answer.

## SAY

> "Both of these boxes started at the exact same moment, in the exact same
> pipeline run. One number is nine times smaller than the other, and that's
> not a chart I built - that's the native GitHub Actions graph, doing the
> explaining for us."

## NOTE

`Validate at Scale` here is deliberately **not** part of the blended
dashboard - it's a quick, non-blocking post-deploy smoke check
(`e2e/journey-*` subset only) that exists in this specific pipeline
(`BuildDeploy.yml`) primarily for this visual and a fast sanity check after
each deploy.

The daily/scheduled numbers that actually feed the dashboard trend come from
the separate `playwright-testing.yml` workflow, which has the **same**
fan-out / fan-in shape, just one box wider:

```text
Run Playwright Tests  ─┐
                         ├─► Publish to Test Dashboard
Validate at Scale      ─┘
```

If there's time, open that workflow's graph too - it's the one worth
dwelling on, since those two boxes are the exact runs that produced the
"CI Runner" and "Cloud Scale" rows the audience saw on the dashboard in
Demo 4. `Publish to Test Dashboard` is the fan-in: it waits for both,
then does the single write to GitHub Pages so the two parallel jobs never
race each other for the same file.

## KEY LINE

> "The dashboard shows the trend, the Portal shows the evidence for one
> exact run, and the pipeline graph itself shows the payoff, in plain
> daylight, with no explanation required."

## RETURN TO

**Closing - No More Live Demos**

---

# Closing - No More Live Demos

After Demo 4, stay in PowerPoint.

## Gino's Testing Recipe

The whole talk in six steps, under the line *"The goal is not more tests. The
goal is more confidence per change."* Read the headings quickly, don't
re-explain them, and leave the links on screen:

```text
playwright.dev | learn.microsoft.com/azure/app-testing | github.com/PagelsR/GinosGelato
```

The **Feedback Loop** slide is hidden in the deck. If you have spare time, unhide
it and land this flow before the Recipe:

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
| Playwright fundamentals | 7 min |
| Demo 1 - customer journey | 6 min |
| AI-assisted authoring | 5 min |
| Demo 2 - Playwright MCP + AI journey creation | 9 min |
| Debugging + reliability | 5 min |
| Demo 3 - UI Mode / trace / Copy prompt | 5 min |
| CI + Azure App Testing | 4 min |
| Demo 4 - Azure scale + Reliability Dashboard | 10 min |
| Closing | 2 min |

**Total:** 60 minutes

Demo 4 grew by 2 minutes for the Reliability Dashboard (Part D); the
CI + Azure App Testing slides give up those 2 minutes, since the dashboard
now shows what those slides used to explain.

**Optional, time-permitting:** BONUS - The Fan-Out / Fan-In Graph (~3 min).
Not part of the 60-minute core — use only if Demo 4 lands early or during
Q&A.

---

# Presenter Safety Net

If time gets tight:

1. Never cut Demo 1. It establishes the customer journey.
2. Keep Demo 2 because AI is in the title. If short, stop Part A once the
   $4.99 delivery fee appears and give the verdict yourself.
3. Shorten Demo 3 to Parts B and C (the PO Box failure and Copy prompt) -
   skip the tour, keep the AI.
4. Never cut Demo 4, including Part D (Reliability Dashboard). Azure scale
   is the payoff. If short on time, trim Part C to the Test runs list plus
   one trace, and Part D to the trend chart plus the Mode column.
5. Cut the Fan-Out / Fan-In Graph bonus first — it's optional.

If cloud access is slow:

- Trigger the run, then immediately use the pre-completed Azure run.
- The audience still sees the command and the cloud results without waiting.

If Playwright MCP is slow or stalls:

- The app is probably cold - it should have been warmed before the session.
- Stop the agent and narrate the verdict from the Demo 2 Part A table.

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

