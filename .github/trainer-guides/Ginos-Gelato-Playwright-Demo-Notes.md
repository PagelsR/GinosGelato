# DEMO NOTES ONLY - Playwright

- **Storefront:** https://wonderful-coast-040cb1a10.7.azurestaticapps.net/
- **Reliability Dashboard:** https://pagelsr.github.io/GinosGelato/
- **Playwright Workspace:** `pwwuxryfogy5mzkc` (Azure Portal → **Test runs**)
- Start MCP Playwright Server

⚠️ BEFORE YOU START ⚠️
Open the storefront to warm up the API. Copilot Chat is in **Agent** mode with the Playwright MCP server running. `git status` is clean. Have a known-good cloud run and its report open in a tab. Never pick a run from before 2026-10-08 because its report shows a 404.

In the repo terminal:

```powershell
npm ci
npx playwright install chromium
```

---

## Demo 1 - The Customer Journey Becomes Code (Slide 10)

### Part A – Getting Started
Show `npm init playwright@latest` in the starter folder. It has already been run, so don't run it again. Open `playwright.config.ts` and `tests/example.spec.ts`. In the repo terminal, run:

```text
npx playwright test --list
```

Mention the other favorites: `-g "Pickup"`, `--headed`, `--ui`, `show-report`, `codegen`.

### Part B – Codegen
```text
npx playwright codegen https://wonderful-coast-040cb1a10.7.azurestaticapps.net/
```

**Start Creating** → **Waffle Cone** → Vanilla Dream + Chocolate Fudge → Rainbow Sprinkles → **Add to Cart** → **Cart** → **Proceed to Checkout** → **Continue to Delivery** → **Store Pickup** → **Continue to Payment** → **Complete Order**.
> "This is Gino testing by hand, but now Playwright is writing it down."

Point at the `getByRole` locators. Close it without saving.

### Part C – Run the Real Test
Open `e2e/journey-1-happy-path-pickup.spec.ts` and point at the two `expect` lines.

```text
npx playwright test e2e/journey-1-happy-path-pickup.spec.ts --headed --workers=1
```

It ends on **Order Confirmed!**
> "Codegen gave us a draft. This one is the keeper."

---

## Demo 2 - Create a New Journey with AI (Slide 14)

### Part A – Explore
```text
/demo-explore-site
```

Copilot explores the site and finds **3 dead footer links**: `/privacy`, `/terms` and `/nutrition`.

### Part B – Secret Shopper (cut this first if short on time)
```text
/demo-secret-shopper
```

None of the 3 special offers are applied. The total is **$38.35**, including $4.99 delivery. The offers are display-only text in `Cart.tsx`.
> "No selectors, no code, and it caught Gino's site breaking three promises."

### Part C – Exploration to Test
```text
/demo-empty-cart
```

Copilot creates `e2e/demo-empty-cart.spec.ts`, runs it and iterates until it passes. If it drifts, open the backup spec.

⚠️ Delete `e2e/demo-empty-cart.spec.ts` afterwards ⚠️

---

## Demo 3 - Break It, Diagnose It, Fix It (Slide 16)

### Part A – Run the Test in UI Mode
```text
npx playwright test e2e/journey-5-shipping-order.spec.ts --ui
```

Click ▶. In the passing test, show the timeline, locator, DOM snapshot and network. Next, open **rejects shipping to a PO Box address**, which is red. Go to **Errors** and step to **Continue to Payment**. There's no validation error.
> "The test isn't broken. The app is missing a rule."

### Part B – Diagnose the Issue
Click **Copy prompt**, paste it into Copilot Chat and add:

```text
Is this a bug in the test or in the app? Where would the fix go?
```

---

## Demo 4 - Run the Same Suite at Scale in Azure (Slide 21)

### Setup (talk through it only)
Create a Playwright Workspace → grant roles (**Playwright Workspace Contributor** and **Storage Blob Data Contributor**) → `npm install -D @azure/playwright @azure/identity` → set `PLAYWRIGHT_SERVICE_URL` → add `playwright.service.config.ts`.
> "Same tests, same config, one extra file. The browsers just live in Azure now."

### Part A – The Config
Open `playwright.service.config.ts` and point at `createAzurePlaywrightConfig`, `DefaultAzureCredential` and `runName`. Show the CI command:

```text
npx playwright test --config=playwright.service.config.ts --workers=20 --grep-invert "FLAKY|Flaky Test Examples"
```

### Part B – Trigger It
GitHub → Actions → **Playwright Testing - Daily Schedule** → **Run workflow**. Don't wait for it.

Open a previous workflow run. Show job **Run Playwright Tests**. Show step **Run Playwright Tests**, scroll through the logs.

Show two **Artifacts** at the bottom of Summary page. These artifacts contain the test results and logs for further inspection, one run at a time.

### Part C – Azure Portal Test Runs
Portal → `pwwuxryfogy5mzkc` → **Test runs**. Point at **Triggered by**, **Duration** and **Max Concurrent Sessions**. Open the run you checked before the session, then open **rejects shipping to a PO Box address**.
> "Playwright gave us the test results. Azure gives us the browser fleet."

⚠️ If a report shows HTTP 404, switch to the report tab you opened before the session. Don't troubleshoot it on stage. ⚠️

Regardless of where the tests are run (locally, CI, or Azure), the results are consolidated and accessible from this portal.

### Part D – Reliability Dashboard
Open https://pagelsr.github.io/GinosGelato/ and show three sections:
- **Test Outcome Trend:** hover ◆ (Cloud) vs ● (CI Runner).
- **Flaky Test Distribution**
- **Recent Test Runs:** `🖥️ CI Runner ×1` vs `☁️ Cloud Scale ×20`.

---

## Closing (Slide 23)
> "A few hours ago we secured Gino's Gelato. Now we've proved the customer experience still works. Secure it, test it, ship with confidence."
