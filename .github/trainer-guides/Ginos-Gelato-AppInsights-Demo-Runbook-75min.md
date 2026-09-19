# Gino's Gelato - Application Insights Demo Runbook

## AI-Powered Observability: Master Your App Performance with Azure Application Insights

**Hard session limit:** 75 minutes  
**Target finish:** 68 minutes, leaving ~7 minutes of buffer  
**Repo:** `https://github.com/PagelsR/GinosGelato`  
**Branch:** `feature/azure-modernization`  
**Azure resource group:** `rg-GinosGelato-Modernization`  
**Deployed storefront configured in this branch:** `https://wonderful-coast-040cb1a10.7.azurestaticapps.net/`

---

# The Rule for This Talk

**Slides explain WHY. Demos prove it.**

There are only **six live demos**.

Do not tour the Azure portal.  
Do not teach Playwright syntax.  
Do not teach KQL syntax.  
Do not debug a broken demo on stage.

---

# Important: No PowerShell Is Required

The repo documentation labels some command blocks as `powershell`, but the Playwright commands themselves are ordinary terminal commands.

For the presentation, use the **VS Code integrated terminal**. PowerShell is not required.

Only one command is needed live for Playwright:

✅ **COPY THIS**

```text
npx playwright test e2e/journey-1-happy-path-pickup.spec.ts --headed --workers=1
```

✅ **END COPY**

Everything else in the fault demos can be triggered with browser URLs.

---

# Before the Session

## One-time local setup

Do this before the conference, not on stage.

✅ **COPY THIS**

```text
npm ci
npx playwright install chromium
```

✅ **END COPY**

## Seed telemetry before the audience arrives

The branch already contains a scheduled workflow:

`.github/workflows/playwright-testing.yml`

It runs the full suite daily and can also be run manually.

In GitHub:

1. Open the repo.
2. Click **Actions**.
3. Select **Playwright Testing - Daily Schedule**.
4. Click **Run workflow**.
5. Select branch **feature/azure-modernization**.
6. Click **Run workflow**.

Do this early enough that recent healthy and fault telemetry is already available.

## Open Azure once

In Azure Portal:

1. **Resource groups**
2. Open **rg-GinosGelato-Modernization**
3. Select the Application Insights resource named **appi-...**

Open separate browser tabs for:

- **Investigate > Live metrics**
- **Investigate > Performance**
- **Investigate > Failures**
- **Usage > User Flows**
- **Monitoring > Logs**

Optional backup tab:

- **Investigate > Application map**

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

> **RUNBOOK: Demo 1.** Show one normal customer checkout, then run Journey 1 in Playwright. The point is that the same customer path becomes repeatable executable code. Return to **The Difference That Matters**.

## SAY

> "We've talked about the journey. Let's run it first as a customer, then as automation."

## DO - Manual customer journey

In the deployed storefront:

1. Browse.
2. Customize one gelato.
3. Add to cart.
4. Checkout.
5. Choose pickup.
6. Complete the order.
7. Show the confirmation.

Do not narrate every click.

## DO - Playwright

Switch to VS Code.

Open:

`e2e/journey-1-happy-path-pickup.spec.ts`

Scroll only enough to show the business steps.

Then run:

✅ **COPY THIS**

```text
npx playwright test e2e/journey-1-happy-path-pickup.spec.ts --headed --workers=1
```

✅ **END COPY**

## SHOW

- The automated browser follows the same customer journey.
- The test ends at **Order Confirmed**.
- This run also generates browser, API, SQL, and custom-event telemetry.

## SAY

> "This is a customer who never gets tired. It gives us repeatability, regression coverage, and realistic telemetry."

## RETURN TO

**The Difference That Matters**

---

# DEMO 2 - Live Metrics

**Target:** 3 minutes  
**Demo slide:** Live Metrics

## Speaker note for the Demo slide

> **RUNBOOK: Demo 2.** Azure Portal > Application Insights > **Investigate > Live metrics**. Run Journey 1 again and show requests arriving live. Do not tour the whole page. Return to **The First Report**.

## SAY

> "Let's start with the simplest production question: what is happening right now?"

## CLICK

Azure Portal:

**Resource groups > rg-GinosGelato-Modernization > appi-... > Investigate > Live metrics**

## DO

Leave Live Metrics visible.

Run Journey 1 again from the VS Code terminal:

✅ **COPY THIS**

```text
npx playwright test e2e/journey-1-happy-path-pickup.spec.ts --workers=1
```

✅ **END COPY**

## SHOW

Only point out:

- requests arriving
- failures, if any
- dependency activity
- sample telemetry

Do not explain every chart.

## SAY

> "Live Metrics answers: is it happening right now, and how broadly is it happening?"

## RETURN TO

**The First Report**

---

# DEMO 3 - Slow Request -> Transaction -> SQL Dependency

**Target:** 8 minutes  
**Demo slide:** currently "Slow Checkout, Transaction, and SQL Dependency"

> **Accuracy note:** the current branch reproduces the slow SQL symptom through a dedicated deterministic demo endpoint. The telemetry operation is the demo request, not the real checkout POST. For 100% accuracy, rename the Demo slide to **Slow Request, Transaction, and SQL Dependency** or say explicitly that you are reproducing the checkout symptom with a controlled demo request.

## Speaker note for the Demo slide

> **RUNBOOK: Demo 3.** Reproduce a deterministic 3-second Azure SQL delay with `/fault?fault=slow-sql`. In Application Insights go **Investigate > Performance**, open the slow server request, drill into a sample, open **End-to-end transaction details**, then select the SQL dependency. Return to **End-to-End Transaction Details**.

## SAY

> "The customer said checkout felt slow. To make the symptom deterministic on stage, I'm reproducing the database delay with a safe demo request."

## TRIGGER

Open this browser URL:

✅ **COPY THIS**

```text
https://wonderful-coast-040cb1a10.7.azurestaticapps.net/fault?fault=slow-sql
```

✅ **END COPY**

The page should report that `slow-sql` completed after approximately 3 seconds.

The server runs a real Azure SQL command:

`WAITFOR DELAY '00:00:03'`

## CLICK

Azure Portal:

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

## RETURN TO

**End-to-End Transaction Details**

---

# DEMO 4 - API Failure + Browser Exception

**Target:** 6 minutes  
**Demo slide:** currently "API and Browser Exceptions"

> **Accuracy note:** `api-failure` intentionally returns HTTP 503. It is a failed API request, not a thrown server exception. Rename this Demo slide to **API Failure and Browser Exception** for exact alignment with the code and telemetry.

## Speaker note for the Demo slide

> **RUNBOOK: Demo 4.** Trigger `/fault?fault=api-failure`, then use **Investigate > Failures > Server** to find the 503 request. Next trigger `/fault?fault=browser-exception`, switch to the **Browser** failures view and open `DemoBrowserException`. Return to **One Order, One Trace**.

## PART A - API failure

### SAY

> "First, let's look at a backend request that fails."

### TRIGGER

✅ **COPY THIS**

```text
https://wonderful-coast-040cb1a10.7.azurestaticapps.net/fault?fault=api-failure
```

✅ **END COPY**

The API deliberately returns **503 Service Unavailable**.

### CLICK

Azure Portal:

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

### TRIGGER

✅ **COPY THIS**

```text
https://wonderful-coast-040cb1a10.7.azurestaticapps.net/fault?fault=browser-exception
```

✅ **END COPY**

The client deliberately reports and throws:

`DemoBrowserException`

### CLICK

Stay in:

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

## SAY

> "A healthy API does not guarantee a healthy customer experience. Some failures live entirely in the browser."

## RETURN TO

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

Update the Business Telemetry slide to use actual names from the code.

## Speaker note for the Demo slide

> **RUNBOOK: Demo 5.** Open **Usage > User Flows**, start from `CheckoutStarted`, and show where the session goes next. Then open **Monitoring > Logs** and run the three prepared KQL questions. Return to **Evidence-Based Debugging with GitHub Copilot**.

## PART A - User Flow

### SAY

> "Technical telemetry tells us what failed. Business telemetry tells us what happened to the customer."

### CLICK

Azure Portal:

**Application Insights > Usage > User Flows**

Then:

1. Click **Edit** or **Select an event**.
2. Set **Initial event** to `CheckoutStarted`.
3. Click **Create graph**.
4. Show the next customer actions/events.
5. Keep this short.

## PART B - KQL

### CLICK

Azure Portal:

**Application Insights > Monitoring > Logs**

Use the Application Insights resource scope.

### Question 1 - Which operations are slowest?

✅ **COPY THIS**

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

✅ **END COPY**

### Question 2 - Which exceptions happen most often?

✅ **COPY THIS**

```kusto
exceptions
| where timestamp > ago(24h)
| summarize Count = count() by type, outerMessage
| order by Count desc
```

✅ **END COPY**

### Question 3 - Which fulfillment method is selected most often?

This replaces the current slide question **"Which fulfillment method fails most?"** because the branch does not emit an `OrderFailed` business event.

✅ **COPY THIS**

```kusto
customEvents
| where timestamp > ago(24h)
| where name == "DeliveryMethodSelected"
| extend method = tostring(customDimensions.method)
| summarize Count = count() by method
| order by Count desc
```

✅ **END COPY**

## SAY

> "I'm not teaching KQL syntax. I'm showing that a developer can ask a question nobody thought to build a dashboard for."

## RETURN TO

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

✅ **COPY THIS**

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

✅ **END COPY**

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

✅ **COPY THIS**

```text
https://wonderful-coast-040cb1a10.7.azurestaticapps.net/
```

✅ **END COPY**

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
- [ ] Recent telemetry exists before the talk
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
