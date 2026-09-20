# Gino's Gelato - Application Insights Demo Runbook

## AI-Powered Observability: Master Your App Performance with Azure Application Insights

**Repo:** `https://github.com/PagelsR/GinosGelato`  
**Branch:** `feature/azure-modernization`  
**Azure resource group:** `rg-GinosGelato-Modernization`  
**Deployed storefront configured in this branch:** `https://wonderful-coast-040cb1a10.7.azurestaticapps.net/`

---

# Important

For the presentation, use the **VS Code integrated terminal**. PowerShell is not required.

Only one command is needed live for Playwright:

```text
npx playwright test e2e/journey-1-happy-path-pickup.spec.ts --headed --workers=1
```

Everything else in the fault demos can be triggered with browser URLs.

---

# Before the Session

## One-time local setup

Do this before the conference, not on stage.

```text
npm ci
npx playwright install chromium
```

## Telemetry is already fresh

The branch's scheduled workflow (`.github/workflows/playwright-testing.yml`)
runs the full suite — journeys, faults, and flaky specs — automatically every
day at 11:00 UTC against the deployed Static Web App. No manual pre-session
run is required: by the time you present, healthy and fault telemetry from
the last run is already in Application Insights.

## Open Azure once

In Azure Portal:

1. **Resource groups**
2. Open **rg-GinosGelato-Modernization**
3. Select the Application Insights resource named **appi-uxryfogy5mzkc**

Open separate browser tabs for:

- **Investigate > Application map**
- **Investigate > Live metrics**
- **Investigate > Performance**
- **Investigate > Failures**
- **Investigate > Search**
- **Usage > User Flows**
- **Monitoring > Logs**

## Open VS Code tabs

Open:

- `e2e/journey-1-happy-path-pickup.spec.ts`
- `e2e/journey-4-fault-demo.spec.ts`
- `ginos-gelato/client/src/pages/Checkout.tsx`
- `ginos-gelato/server/Controllers/DemoController.cs`
- `ginos-gelato/server/Services/OrderService.cs`

---

# DEMO 1 - Customer Checkout + Playwright Journey

**Target:** 5 minutes  
**Demo slide:** Customer Checkout + Playwright Journey

## Speaker note for the Demo slide

> **RUNBOOK: Demo 1.** Show one normal customer checkout, then run Journey 1 in Playwright. The point is that the same customer path becomes repeatable executable code.

## SAY

> "We've talked about the journey. Let's run it first as a customer, then as automation."

## Manual customer journey

In the deployed storefront:

1. Browse.
2. Customize one gelato.
3. Add to cart.
4. Checkout.
5. Choose pickup.
6. Complete the order.
7. Show the confirmation.

## Playwright

Switch to VS Code.

Open:

`e2e/journey-1-happy-path-pickup.spec.ts`

Scroll only enough to show the business steps.

Then run:

```text
npx playwright test e2e/journey-1-happy-path-pickup.spec.ts --headed --workers=1
```

## SHOW

- The automated browser follows the same customer journey.
- The test ends at **Order Confirmed**.
- This run also generates browser, API, SQL, and custom-event telemetry.

## SAY

> "This is a customer who never gets tired. It gives us repeatability, regression coverage, and realistic telemetry."

## RETURN TO NEXT SLIDE

**The Difference That Matters**.

---

# DEMO 2 - Live Metrics

**Target:** 3 minutes  
**Demo slide:** Live Metrics

## Speaker note for the Demo slide

> **RUNBOOK: Demo 2.** Azure Portal > Application Insights > **Investigate > Live metrics**. Run Journey 1 again and show requests arriving live. Do not tour the whole page.

## SAY

> "Let's start with the simplest production question: what is happening right now?"

## Azure Portal:

**Resource groups > rg-GinosGelato-Modernization > appi-... > Investigate > Live metrics**

## DO

Leave Live Metrics visible.

Run Journey 1 again from the VS Code terminal:

```text
npx playwright test e2e/journey-1-happy-path-pickup.spec.ts --workers=1
```

## SHOW

Only point out:

- requests arriving
- failures, if any
- dependency activity
- sample telemetry

Do not explain every chart.

## SAY

> "Live Metrics answers: is it happening right now, and how broadly is it happening?"

## RETURN TO NEXT SLIDE

**The First Report**

---

# DEMO 3 - Slow Request -> Transaction -> SQL Dependency

**Target:** 8 minutes  
**Demo slide:** currently "Slow Checkout, Transaction, and SQL Dependency"

> **Accuracy note:** the current branch reproduces the slow SQL symptom through a dedicated deterministic demo endpoint. The telemetry operation is the demo request, not the real checkout POST. For 100% accuracy, rename the Demo slide to **Slow Request, Transaction, and SQL Dependency** or say explicitly that you are reproducing the checkout symptom with a controlled demo request.

## Speaker note for the Demo slide

> **RUNBOOK: Demo 3.** Reproduce a deterministic 3-second Azure SQL delay with `/fault?fault=slow-sql`. In Application Insights go **Investigate > Performance**, open the slow server request, drill into a sample, open **End-to-end transaction details**, then select the SQL dependency.

## SAY

> "The customer said checkout felt slow. To make the symptom deterministic on stage, I'm reproducing the database delay with a safe demo request."

## TRIGGER

Open this browser URL:

```text
https://wonderful-coast-040cb1a10.7.azurestaticapps.net/fault?fault=slow-sql
```

The page should report that `slow-sql` completed after approximately 3 seconds.

The server runs a real Azure SQL command:

`WAITFOR DELAY '00:00:03'`

## Azure Portal:

**Application Insights > Investigate > Performance**

Then:

1. Use the recent demo time range.
2. Stay on the **Server** view.
3. Find the slow demo operation. Look for the request corresponding to:
   - `/api/demo/slow-sql`
   - or an operation name similar to `GET Demo/SlowSql`
4. Select the operation.
5. Under **Drill into**, open the sample requests.
6. Select the recent ~3 second sample.
7. Open **End-to-end transaction details**.
8. Select the long SQL dependency in the timeline.

## SHOW

- overall request duration
- the long SQL dependency
- operation/correlation ID
- SQL command text, if displayed
- most of the time is below the API in SQL

## SAY

> "Aggregate performance told us where to look. The transaction tells us what happened."

> "The customer experienced a slow request. Application Insights shows that the time lives in the SQL dependency."

## RETURN TO NEXT SLIDE

**End-to-End Transaction Details**

---

# DEMO 4 - API Failure + Browser Exception

**Target:** 6 minutes  
**Demo slide:** currently "API and Browser Exception"

> **Accuracy note:** `api-failure` intentionally returns HTTP 503. It is a failed API request, not a thrown server exception.

## Speaker note for the Demo slide

> **RUNBOOK: Demo 4.** Trigger `/fault?fault=api-failure`, then use **Investigate > Failures > Server** to find the 503 request. Next trigger `/fault?fault=browser-exception`, switch to the **Browser** failures view and open `DemoBrowserException`.

## PART A - API failure

### SAY

> "First, let's look at a backend request that fails. To make the symptom deterministic on stage, I'm reproducing the API failure with a safe demo request."

### TRIGGER

```text
https://wonderful-coast-040cb1a10.7.azurestaticapps.net/fault?fault=api-failure
```

The API deliberately returns **503 Service Unavailable**.

### Azure Portal:

**Application Insights > Investigate > Failures**

Then:

1. Select the **Server** view/tab.
2. Use the recent demo time range.
3. Find the failed operation corresponding to:
   - `/api/demo/api-failure`
   - or a name similar to `GET Demo/ApiFailure`
4. Select it.
5. Open the recent sample.
6. Point out:
   - `503`
   - failed request
   - related dependency/browser telemetry where shown

### SAY

> "This is a failed server request. The portal lets us move from aggregate failure count to one exact operation."

## PART B - Browser exception

```text
https://wonderful-coast-040cb1a10.7.azurestaticapps.net/fault?fault=browser-exception
```

The client deliberately reports and throws:

`DemoBrowserException`

### Azure Portal

**Application Insights > Investigate > Failures**

Then:

1. Switch to the **Browser** view/tab.
2. Open browser exceptions.
3. Find **DemoBrowserException**.
4. Select a recent sample.
5. Show the page/browser context.

If the portal UI does not expose the browser exception where expected, use:

**Investigate > Search**

Filter **Event types** to **Exception**, then select `DemoBrowserException`.

```
DemoBrowserException
```
## SAY

> "A healthy API does not guarantee a healthy customer experience. Some failures live entirely in the browser."

## RETURN TO NEXT SLIDE

**One Order, One Trace**

---

# DEMO 5 - Business Events + User Flow + KQL

**Target:** 6 minutes  
**Demo slide:** Business Events, User Flow, and KQL

## Important event-name correction

The branch does **not** emit `ProductViewed`, `ItemAddedToCart`, or `OrderFailed`.

The real useful events include:

- `BuilderPageVisit`
- `IceCreamCreated`
- `AddToCart`
- `CheckoutStarted`
- `CheckoutStepCompleted`
- `DeliveryMethodSelected`
- `OrderCompleted`
- server-side `OrderCreated`

## Speaker note for the Demo slide

> **RUNBOOK: Demo 5.** Open **Usage > User Flows**, start from `CheckoutStarted`, and show where the session goes next. Then open **Monitoring > Logs** and run the three prepared KQL questions.

## PART A - User Flow

### SAY

> "Technical telemetry tells us what failed. Business telemetry tells us what happened to the customer."

### Azure Portal:

**Application Insights > Usage > User Flows**

Then:

1. Click **Edit** or **Select an event**.
2. Set **Initial event** to `CheckoutStarted`.
3. Click **Create graph**.
4. Show the next customer actions/events.
5. Keep this short.

## PART B - KQL (Kusto Query Language)

### Azure Portal:

**Application Insights > Monitoring > Logs**

Use the Application Insights resource scope.

> **Two ways to ask, same evidence.** Logs now has an **Observability Agent**
> (preview) chat panel — toggle **Agent** on in the top-right of the Logs
> blade. For each question below, **Option 1** is the prompt to type into the
> agent; **Option 2** is the raw KQL, as a reliable fallback if the agent
> preview isn't enabled in the tenant you're demoing in, or if you want to show
> what's actually running under the hood.

### Question 1 - Which operations are slowest?

**Option 1 - Ask the Observability Agent**

```text
Show me the slowest operations in the last 24 hours. Include average and P95 duration, and sort by P95 descending.
```

**Option 2 - KQL**

```kusto
requests
| where timestamp > ago(24h)
| summarize
    Count = count(),
    Avg = avg(duration),
    P95 = percentile(duration, 95)
    by operation_Name
| order by P95 desc
```

### Question 2 - Which exceptions happen most often?

**Option 1 - Ask the Observability Agent**

```text
Which exceptions happened most often in the last 24 hours? Group by exception type and message, sorted by count.
```

**Option 2 - KQL**

```kusto
exceptions
| where timestamp > ago(24h)
| summarize Count = count() by type, outerMessage
| order by Count desc
```

### Question 3 - Which fulfillment method is selected most often?

This replaces the current slide question **"Which fulfillment method fails most?"** because the branch does not emit an `OrderFailed` business event.

**Option 1 - Ask the Observability Agent**

```text
In the last 24 hours, look at the DeliveryMethodSelected custom event and tell me which fulfillment method was selected most often.
```

**Option 2 - KQL**

```kusto
customEvents
| where timestamp > ago(24h)
| where name == "DeliveryMethodSelected"
| extend method = tostring(customDimensions.method)
| summarize Count = count() by method
| order by Count desc
```

## SAY

> "I'm not teaching KQL syntax. I'm showing that a developer can ask a question nobody thought to build a dashboard for — in plain English to the Observability Agent, or in KQL directly. Same data, same answer, two ways in."

## RETURN TO NEXT SLIDE

**Evidence-Based Debugging with GitHub Copilot**

---

# DEMO 6 - GitHub Copilot Root Cause Analysis

**Target:** 5 minutes  
**Demo slide:** GitHub Copilot Root Cause Analysis

## Recommended approach

Keep this grounded in the exact slow-SQL evidence from Demo 3.

Do not make a large live code change.

## Speaker note for the Demo slide

> **RUNBOOK: Demo 6.** Use the slow SQL evidence from Demo 3. In VS Code open `DemoController.cs`, select `SlowSql`, then give Copilot the observed ~3 second SQL dependency and ask it to explain the exact cause and what a production-safe remediation would be. Do not edit code live. Return to **Detect It Before the Customer Does**.

## DO

In VS Code open:

`ginos-gelato/server/Controllers/DemoController.cs`

Select the `SlowSql` action.

Open GitHub Copilot Chat.

## PROMPT

```text
Application Insights shows this request taking about 3 seconds, with nearly all of the duration inside an Azure SQL dependency.

Review the selected SlowSql code and:

1. Explain the exact root cause of the latency.
2. Point to the line responsible.
3. Explain why Application Insights reports the time as a SQL dependency.
4. If this were accidental production code, recommend the smallest safe remediation.
5. Tell me what tests or telemetry I should use to validate the fix.

Do not modify the code.
```

## SHOW

- Copilot connects the telemetry evidence to `WAITFOR DELAY`.
- Copilot explains why the time appears as SQL dependency telemetry.
- Copilot proposes validation rather than blindly changing code.

## SAY

> "We didn't ask AI to guess. We gave it evidence and the exact code path."

> "Better evidence in, better explanation out."

## RETURN TO

**Detect It Before the Customer Does**

---

# Closing - No More Live Demos

After Demo 6, stay in PowerPoint.

For **Detect It Before the Customer Does**, the repo already provisions:

- a response-time alert when average request duration exceeds 3 seconds
- availability tests for:
  - frontend home page
  - Flavors API
  - Toppings API

Use this as a short proactive-monitoring story. Do not open another portal blade unless you have extra time.

For **The Loop Every Team Lives In**:

> Build -> Deploy -> Observe -> Diagnose -> Improve -> Validate -> Repeat

For **What to Take Home**, read only 3 or 4 bullets.

---

# 68-Minute Timing Plan

| Section | Target |
|---|---:|
| Opening slides through Playwright concept | 8 min |
| Demo 1 - Checkout + Playwright | 5 min |
| Observability + signals + App Insights overview | 5 min |
| Demo 2 - Live Metrics | 3 min |
| Slow-request setup slides | 4 min |
| Demo 3 - Slow request -> SQL | 8 min |
| Transaction + failures concept slides | 4 min |
| Demo 4 - API failure + browser exception | 6 min |
| Correlation + business telemetry + three questions | 6 min |
| Demo 5 - User Flow + KQL | 6 min |
| Copilot concept slide | 2 min |
| Demo 6 - Copilot root cause | 5 min |
| Closing slides | 6 min |
| **Planned total** | **68 min** |
| **Buffer before hard 75-minute stop** | **7 min** |

---

# What To Cut If Time Runs Long

Cut in this order:

1. One of the three KQL queries.
2. Deep browser-exception details.
3. Extra Live Metrics explanation.
4. Manual checkout clicks - jump directly to Playwright.

Do **not** cut:

- Demo 3 slow dependency investigation
- Demo 6 evidence-grounded Copilot story
- final takeaway

---

# No Reset Is Needed Between Fault Demos

The safest presentation approach is to use only the `?fault=` URLs.

Each URL activates one fault only for that page load.

Do **not** use the optional `DEMO_FAULT` localStorage setting during the presentation.

To return to normal, simply navigate back to:

```text
https://wonderful-coast-040cb1a10.7.azurestaticapps.net/
```

Because we are not storing a persistent fault flag, there is no PowerShell cleanup command and no reset script required.

---

# Final Rehearsal Checklist

- [ ] Slide 6 instrumentation wording matches the repo (see correction below)
- [ ] Demo 3 slide/title acknowledges the controlled slow request
- [ ] Demo 4 title says **API Failure and Browser Exception**
- [ ] Business-event slide uses actual event names from the code
- [ ] Third KQL question is fulfillment **mix**, not failures
- [ ] `npm ci` completed
- [ ] Playwright Chromium installed
- [ ] Journey 1 runs headed
- [ ] `/fault?fault=slow-sql` works
- [ ] `/fault?fault=api-failure` works
- [ ] `/fault?fault=browser-exception` works
- [ ] Daily scheduled workflow ran successfully in the last 24h (Actions tab)
- [ ] User Flows can start from `CheckoutStarted`
- [ ] Three KQL queries return useful rows
- [ ] Copilot prompt rehearsed
- [ ] Full rehearsal finishes in 65-68 minutes

---

# Slide Accuracy Corrections Before Final

## How the Telemetry Gets In

The current slide says:

`Azure Monitor OpenTelemetry Distro instruments the ASP.NET Core API`

The uploaded branch currently uses:

`Microsoft.ApplicationInsights.AspNetCore`

and in `Program.cs`:

`builder.Services.AddApplicationInsightsTelemetry();`

For exact alignment with the repo, change the slide to:

**Application Insights ASP.NET Core SDK instruments the API**

Suggested speaker note:

> "The API currently uses the Application Insights ASP.NET Core SDK for requests, dependencies, logs, exceptions, and distributed tracing. The browser uses the Application Insights JavaScript SDK. Both send to the same Application Insights resource."

## Business Telemetry

Replace the illustrative event names that do not exist with actual repo events:

**IceCreamCreated -> AddToCart -> CheckoutStarted -> DeliveryMethodSelected -> OrderCompleted**

Optionally show the API-side companion event:

**OrderCreated**

## API and Browser Exceptions

Rename:

**API and Browser Exceptions**

to:

**API Failure and Browser Exception**

The current API demo returns HTTP 503; it does not throw a server-side exception.

## Three Questions, Three Queries

Replace:

**Which fulfillment method fails most?**

with:

**Which fulfillment method is selected most often?**

The current branch emits `DeliveryMethodSelected` but does not emit `OrderFailed`.

---

# 🎁 BONUS DEMOS (only if time remains)

> Search for `BONUS DEMO` to jump straight here. These are optional — only run
> them if you land ahead of the 68-minute plan with real time to spare. Skip
> silently otherwise; do not mention them if you're not doing them.

## 🎁 BONUS DEMO A — Release Correlation ("did this start after the last deploy?")

**Target:** 4 minutes  
**Search marker:** `BONUS DEMO A`

### SAY

> "One more question production teams ask constantly: did this problem start
> after our last deployment?"

### WHY IT WORKS

`ReleaseTelemetryInitializer` (`ginos-gelato/server/Telemetry/ReleaseTelemetryInitializer.cs`)
stamps **every** piece of server telemetry with release context, populated by
`BuildDeploy.yml` at deploy time:

- `application_Version` — `1.0.<GitHub run number>`
- `customDimensions.gitCommitSha` — the exact commit SHA deployed
- `customDimensions.deploymentId` — the GitHub Actions run ID
- `customDimensions.environment` — ASP.NET Core environment name

### CLICK

Azure Portal → Application Insights → **Monitoring > Logs**.

```kusto
requests
| where timestamp > ago(24h)
| summarize Count = count(), AvgDuration = avg(duration)
    by application_Version, tostring(customDimensions.gitCommitSha)
| order by Count desc
```

### SHOW

- Every row is tagged with the exact commit SHA that shipped it.
- If you redeploy mid-conference, you can immediately filter to just the new
  version and compare error rate / duration against the previous one.

### SAY

> "Every request already knows which commit produced it. If a regression ships,
> we don't have to ask 'when did this start' — we filter by `application_Version`
> and get the answer."

### RETURN TO

**Detect It Before the Customer Does**

---

## 🎁 BONUS DEMO B — Alerts and Availability Tests (proactive monitoring)

**Target:** 4 minutes  
**Search marker:** `BONUS DEMO B`

### SAY

> "Everything so far has been reactive — a human opened the portal and looked.
> Let's see what's watching when nobody's looking."

### CLICK

Azure Portal → Application Insights → **Alerts**.

- Open the pre-provisioned alert rule (`iac/appInsights.bicep`): fires when
  **average server response time exceeds 3 seconds**.
- Point out it's the exact threshold the `slow-sql` fault (Demo 3) is designed
  to approach — that fault is a deliberate rehearsal of what this alert is
  meant to catch in production.

Then Azure Portal → Application Insights → **Investigate > Availability**.

- Show the three synthetic availability tests already running from multiple
  regions: frontend home page, Flavors API, Toppings API.
- Point out the pass/fail history and multi-region map.

### SAY

> "This is the difference between finding a problem and being told about a
> problem. The alert and the availability tests run whether or not I'm watching
> the portal."

### RETURN TO

**Detect It Before the Customer Does**

---

## 🎁 BONUS DEMO C — Find Custom Markers with Search

**Target:** 4 minutes  
**Search marker:** `BONUS DEMO C`

### SAY

> "Every step of the ordering process drops a custom marker into telemetry.
> Let's just search for a couple of them by name — no dashboard required."

### CLICK

Azure Portal → Application Insights → **Investigate > Search**.

Type each of these into the search box (one at a time), with **Event type**
filtered to **Custom Event**:

```text
IceCreamCreated
```

```text
OrderCompleted
```

### SHOW

- `IceCreamCreated` (client, `Builder.tsx`) — expand a result and show its
  properties: `container`, `flavorCount`, `toppingCount`, `price`.
- `OrderCompleted` (client, `Checkout.tsx`) — expand a result and show
  `orderNumber`, `orderTotal`, `deliveryType`, `deliveryFee`.
- Click **related items** on an `OrderCompleted` result to jump to the
  server-side `OrderCreated` event (`OrderService.cs`) sharing the same
  operation ID — the browser marker and the server marker are the same order.

### SAY

> "These aren't synthetic demo events — they're the same markers that would be
> in place the day this feature shipped: `BuilderPageVisit`, `IceCreamCreated`,
> `AddToCart`, `CheckoutStarted`, `CheckoutStepCompleted`,
> `DeliveryMethodSelected`, `OrderCompleted`, and server-side `OrderCreated`.
> Search is the fastest way to answer 'did this specific thing happen,' without
> writing a query or building a dashboard first."

### RETURN TO

**Evidence-Based Debugging with GitHub Copilot**
