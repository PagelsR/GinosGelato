# Gino's Gelato - Application Insights Demo Runbook

## AI-Powered Observability: Master Your App Performance with Azure Application Insights

**Repo:** `https://github.com/PagelsR/GinosGelato`  
**Branch:** `feature/azure-modernization`  
**Azure resource group:** `rg-GinosGelato-Modernization`  
**Deployed storefront configured in this branch:** `https://wonderful-coast-040cb1a10.7.azurestaticapps.net/`


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

- **Investigate > Application map** — Demo 3 Part A
- **Investigate > Live metrics** — Demo 2
- **Investigate > Performance** — Demo 3 Part B
- **Investigate > Failures** — Demo 4
- **Investigate > Search** — Demo 4 fallback, BONUS DEMO C
- **Usage > Funnels** — Demo 5 Part A
- **Usage > User Flows** — Demo 5 Part B
- **Monitoring > Logs** — Demo 5 Part C

Open these only if you expect to reach the bonus material:

- **Investigate > Availability** — BONUS DEMO B
- **Investigate > Smart Detection** — BONUS DEMO E
- **Usage and estimated costs** — BONUS DEMO D (the cost question)

## Pre-session portal checks (5 minutes, morning of)

Three of the demos depend on data that may or may not be there. Check them
before you present so you never discover an empty blade on stage:

1. **Application map** renders an API node and an Azure SQL node. (Demo 3 Part A)
2. **Funnels** — build and **save** the funnel described in Demo 5 Part A, so
   live you only have to open it. Confirm it has non-trivial volume.
3. **Smart Detection** has at least one entry. (BONUS DEMO E — skip silently if empty.)

### Verify the funnel will resolve before you build it

Run this in **Monitoring > Logs**. It applies the same strict ordering the
Funnels blade uses, so it predicts exactly what the funnel will show:

**Option 1 — Ask the Observability Agent**

```text
Using customEvents over the last 3 days, for each user_Id find the earliest timestamp of BuilderPageVisit, IceCreamCreated, CheckoutStarted and OrderCompleted. Then count how many users performed each event strictly after the previous one in that exact order, and show me the four counts.
```

**Option 2 — KQL (authoritative for this check)**

```kusto
customEvents
| where timestamp > ago(3d)
| where name in ('BuilderPageVisit','IceCreamCreated','CheckoutStarted','OrderCompleted')
| summarize
    B = minif(timestamp, name == 'BuilderPageVisit'),
    I = minif(timestamp, name == 'IceCreamCreated'),
    C = minif(timestamp, name == 'CheckoutStarted'),
    O = minif(timestamp, name == 'OrderCompleted')
    by user_Id
| summarize
    Step1_Builder   = countif(isnotnull(B)),
    Step2_Created   = countif(isnotnull(B) and I > B),
    Step3_Checkout  = countif(isnotnull(B) and I > B and C > I),
    Step4_Completed = countif(isnotnull(B) and I > B and C > I and O > C)
```

All four numbers should be non-zero and decreasing. If `Step4_Completed` is
near zero, the browser SDK is dropping the terminal event — confirm the
`appInsights.flush(false)` call in `Checkout.tsx` is deployed, then narrow the
time range to **after** that deployment.

> ⚠️ **Trust Option 2 here.** This check exists specifically to reproduce the
> Funnels blade's *strict ordering* semantics. An agent may reasonably
> paraphrase that as "users who did both events," which is a different question
> and will happily report healthy numbers for a funnel that renders 0%. Use the
> prompt to explore; use the KQL to decide.

## Open VS Code tabs

Open, actually shown on screen:

- `e2e/journey-1-happy-path-pickup.spec.ts` (Demo 1)
- `ginos-gelato/server/Controllers/DemoController.cs` (Demo 6)

Open, backup reference only — not opened or shown live, staged in case of Q&A:

- `e2e/journey-4-fault-demo.spec.ts` — automated coverage of the same faults triggered by URL in Demos 3-4
- `ginos-gelato/client/src/pages/Builder.tsx` — emits `BuilderPageVisit` / `IceCreamCreated`; **required for BONUS DEMO C**
- `ginos-gelato/client/src/pages/Checkout.tsx` — emits the `CheckoutStarted` / `DeliveryMethodSelected` / `OrderCompleted` events discussed in Demo 5, plus the `OrderRevenue` metric; **required for BONUS DEMO C**
- `ginos-gelato/server/Services/OrderService.cs` — emits the server-side `OrderCreated` event referenced in Demo 3 and **BONUS DEMO C**
- `ginos-gelato/server/Program.cs` — the sampling reveal in BONUS DEMO D
- `ginos-gelato/client/src/services/appInsights.ts` — the browser half of the sampling contrast in BONUS DEMO D
- `iac/appInsights.bicep` — the Standard availability tests in BONUS DEMO B

---


# DEMO 1 - Customer Checkout + Playwright Journey

**Target:** 5 minutes  
**Demo slide:** Customer Checkout + Playwright Journey

## Speaker note for the Demo slide

> **RUNBOOK: Demo 1.** Show one normal customer checkout, then run Journey 1 in Playwright. The point is that the same customer path becomes repeatable executable code.

## SAY

> "We've talked about the journey. Let's run it first as a customer, then as automation."

## Manual customer journey

> ⌨️ **No typing required.** The checkout form ships prefilled with a demo
> customer, so this entire journey is click-only. Do not type on stage.

In the deployed storefront:

1. Browse.
2. Customize one gelato.
3. Add to cart.
4. Checkout.
5. **Continue to Delivery** — customer fields are already filled in.
6. Choose pickup, then **Continue to Payment** — special instructions already filled in.
7. **Complete Order** — card details already filled in.
8. Show the confirmation.

### What the audience will see prefilled

| Field | Value |
| --- | --- |
| Name / email / phone | Sofia Romano, `sofia.romano@example.com`, (555) 123-4567 |
| Special instructions | "Extra napkins, please. Ring the bell twice." |
| Card | `4111 1111 1111 1111`, CVV 123, expiry auto-rolls two years out |
| Address | **Not prefilled — by design** |

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

# DEMO 3 - Application Map -> Slow Request -> Transaction -> SQL Dependency

**Target:** 10 minutes (8 if you cut Part A)  
**Demo slide:** currently "Slow Checkout, Transaction, and SQL Dependency"

> **No new slide required.** Part A (Application Map) runs under the *existing*
> Demo 3 slide as the establishing shot. The deck does not shift.

> **Accuracy note:** the current branch reproduces the slow SQL symptom through a dedicated deterministic demo endpoint. The telemetry operation is the demo request, not the real checkout POST. For 100% accuracy, rename the Demo slide to **Slow Request, Transaction, and SQL Dependency** or say explicitly that you are reproducing the checkout symptom with a controlled demo request.

## Speaker note for the Demo slide

> **RUNBOOK: Demo 3.** Open **Investigate > Application map** first as the "where do I look" establishing shot. Then reproduce a deterministic 3-second Azure SQL delay with `/fault?fault=slow-sql`. In Application Insights go **Investigate > Performance**, open the slow server request, drill into a sample, open **End-to-end transaction details**, then select the SQL dependency.

---

## 🔥 PART A - Application Map (the establishing shot)

**Target:** 2 minutes

### SAY

> "Before I drill into anything — what does this system actually look like in
> production? Here's the thing: I never drew this diagram. Nobody on my team
> maintains it. Application Insights built it from the telemetry."

### Azure Portal:

**Application Insights > Investigate > Application map**

### DO

1. Set the time range to the **last 24 hours**.
2. Let the map finish rendering.
3. Point at the API node, then at the **Azure SQL** dependency node.
4. Hover the edge between them — read the call count and average duration aloud.
5. Click the API node and open the right-hand flyout: failed request rate and
   slowest dependencies.

### SHOW

- The topology was **discovered, not authored**.
- Every edge carries numbers: call volume, average duration, failure percent.
- The slow edge is already visible — before you have written a single query.

### SAY

> "This is the fastest 'where do I look' in the entire product. The map is
> already telling me the time is on the SQL edge. Everything I do for the next
> eight minutes is just confirming what this picture said in two seconds."

> ⚠️ **Stage check (morning of):** the API role node and the Azure SQL dependency
> node are reliable. A separate **browser** node only appears if the JavaScript
> SDK telemetry carries a cloud role name — and
> `ginos-gelato/client/src/services/appInsights.ts` does not set one. If there is
> no browser node, do not improvise: tell the story as API → SQL and let Demo 4
> Part B carry the browser half.

---

## PART B - Slow request, transaction, SQL dependency

**Target:** 8 minutes

### SAY

> "The customer said checkout felt slow. To make the symptom deterministic on stage, I'm reproducing the database delay with a safe demo request."

### TRIGGER

Open this browser URL:

```text
https://wonderful-coast-040cb1a10.7.azurestaticapps.net/fault?fault=slow-sql
```

The page should report that `slow-sql` completed after approximately 3 seconds.

The server runs a real Azure SQL command:

`WAITFOR DELAY '00:00:03'`

### Azure Portal:

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

### SHOW

- overall request duration
- the long SQL dependency
- operation/correlation ID
- SQL command text, if displayed
- most of the time is below the API in SQL

### SAY

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

# DEMO 5 - Business Events + Funnel + User Flow + KQL

**Target:** 8 minutes (6 if you cut Part B)  
**Demo slide:** Business Events, User Flow, and KQL

> **No new slide required.** The funnel in Part A runs under the *existing*
> Demo 5 slide. If you want the slide to match exactly, retitle it
> **Business Events, Funnel, and KQL**. The deck length does not change.

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

> **RUNBOOK: Demo 5.** Open **Usage > Funnels** and show the saved gelato conversion funnel and its biggest drop-off. Optionally open **Usage > User Flows** from `CheckoutStarted`. Then open **Monitoring > Logs** and run the prepared questions — prompt first, KQL as the fallback.

---

## 🔥 PART A - Funnel (where we lose the customer)

**Target:** 3 minutes

### SAY

> "Technical telemetry tells us what failed. Business telemetry tells us what
> happened to the customer — and exactly where we lost them."

### Azure Portal:

**Application Insights > Usage > Funnels**

### DO

Open the funnel you **saved before the session**. If you are building it live,
use exactly these four steps:

1. `BuilderPageVisit`
2. `IceCreamCreated`
3. `CheckoutStarted`
4. `OrderCompleted`

Set the time range to the last 24 hours, or widen to 7 days if volume is thin.

> ⚠️ **Do NOT add `AddToCart` as a step.** It is emitted from `addToCart()` inside
> `Builder.tsx`'s click handler, which runs *before* the `IceCreamCreated` call on
> the same line of execution — measured at 0-2 ms apart. Azure funnels are
> strictly sequential, so a step that never occurs *after* the previous one
> resolves to 0% and silently zeroes every step below it.
>
> **Do NOT use `OrderCreated` as the last step.** That is the *server-side* event
> from `OrderService.cs` (`cloud_RoleName = app-...`). Server telemetry carries no
> browser `user_Id`, and funnels count users — so it is always 0%. The client-side
> event is `OrderCompleted`.

### SHOW

- The percentage of customers surviving each step.
- The single largest drop-off bar — name it out loud.

### SAY

> "Nobody filed a bug for this. There was no exception, no 500, no alert. The
> funnel is telling me a specific percentage of customers built a gelato and
> never ordered it. That isn't a stack trace — that's revenue."

### FALLBACK - ask the agent instead

If the funnel volume is too thin to be convincing, do not fight the UI. Switch
to **Monitoring > Logs**, turn on **Agent**, and ask:

```text
Using customEvents in the last 7 days, build me a conversion funnel for the event sequence BuilderPageVisit, IceCreamCreated, CheckoutStarted, OrderCompleted. Show the distinct user count at each step and the percentage that survived from the previous step.
```

The KQL equivalent, if you want to show what runs underneath:

```kusto
let steps = dynamic(["BuilderPageVisit","IceCreamCreated","CheckoutStarted","OrderCompleted"]);
customEvents
| where timestamp > ago(7d)
| where name in (steps)
| summarize Users = dcount(user_Id) by name
| extend StepOrder = array_index_of(steps, name)
| order by StepOrder asc
| extend SurvivedPct = round(100.0 * Users / toscalar(
    customEvents
    | where timestamp > ago(7d) and name == "BuilderPageVisit"
    | summarize dcount(user_Id)), 1)
```

> 💡 Unlike the Funnels blade, this query does **not** enforce ordering — it just
> counts users per event. That makes it a useful sanity check: if the portal
> funnel shows 0% for a step but this query shows users, the problem is step
> *order*, not missing data.

> ⚠️ **Stage check (morning of):** funnels need enough distinct sessions, and the
> telemetry here comes from a scheduled Playwright run that can collapse into a
> small number of sessions. **Build and save this funnel before you present** so
> live you are only opening it.

---

## PART B - User Flow

### SAY

> "The funnel told me *where* they left. User Flows tells me *what they did instead*."

### Azure Portal:

**Application Insights > Usage > User Flows**

Then:

1. Click **Edit** or **Select an event**.
2. Set **Initial event** to `CheckoutStarted`.
3. Click **Create graph**.
4. Show the next customer actions/events.
5. Keep this short.

## PART C - KQL (Kusto Query Language)

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

## RETURN TO NEXT SLIDE

**Detect It Before the Customer Does**

---

# Closing - No More Live Demos

After Demo 6, stay in PowerPoint.

For **Detect It Before the Customer Does**, the repo already provisions:

- a response-time alert when average request duration exceeds 3 seconds
- three **Standard** availability tests (not the retiring Classic URL ping test) for:
  - frontend home page
  - Flavors API
  - Toppings API

Use this as a short proactive-monitoring story. Do not open another portal blade unless you have extra time.

For **The Loop Every Team Lives In**:

> Build -> Deploy -> Observe -> Diagnose -> Improve -> Validate -> Repeat

For **What to Take Home**, read only 3 or 4 bullets.

---

# BONUS DEMOS (only if time remains)

> Search for `BONUS DEMO` to jump straight here. These are optional — only run
> them if you land ahead of the 68-minute plan with real time to spare. Skip
> silently otherwise; do not mention them if you're not doing them.

## ❓ ASK-ME JUMP TABLE

These are not time-fillers — they are answers. When the question lands
mid-session, jump straight to the matching bonus and come back.

| If someone asks… | Jump to | Search marker |
| --- | --- | --- |
| "What does all this telemetry **cost**?" | Sampling & cost | `BONUS DEMO D` |
| "Aren't you drowning in data at scale?" | Sampling & cost | `BONUS DEMO D` |
| "Did this break **when we deployed**?" | Release correlation | `BONUS DEMO A` |
| "Who's watching this at 2 AM?" | Alerts & availability | `BONUS DEMO B` |
| "Aren't URL ping tests going away?" | Alerts & availability | `BONUS DEMO B` |
| "Where's the **AI** in this?" | Smart Detection | `BONUS DEMO E` |
| "Can I find one specific event?" | Search | `BONUS DEMO C` |

**Highest-value three if you have exactly 10 minutes:** `BONUS DEMO D`
(sampling — the "wait, what?"), `BONUS DEMO E` (Smart Detection — the AI
payoff), `BONUS DEMO B` (the retirement deadline nobody in the room knows about).

> 🎂 **If today is September 30, 2026 — run `BONUS DEMO B` no matter what.**
> That is the exact day Classic URL ping tests retire. Cut something else if you
> have to; you will not get this alignment again.

---
## BONUS DEMO A — Release Correlation ("did this start after the last deploy?")

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

**Option 1 — Ask the Observability Agent** (toggle **Agent** on, top-right)

```text
For the last 3 days, group requests by application_Version and the gitCommitSha custom dimension. For each release show the request count using sum of itemCount, the failure rate as a percentage, and the P95 duration in milliseconds. Sort by version descending so I can compare consecutive releases.
```

**Option 2 — KQL**

```kusto
requests
| where timestamp > ago(3d)
| summarize
    Requests = sum(itemCount),
    FailureRate = round(100.0 * sumif(itemCount, success == false) / sum(itemCount), 2),
    P95Ms = round(percentile(duration, 95), 0)
    by application_Version, GitCommitSha = tostring(customDimensions.gitCommitSha)
| order by application_Version desc
```

> 💡 Note `sum(itemCount)` rather than `count()` — same lesson as BONUS DEMO D.
> Get in the habit and the number stays right if sampling ever engages.

### SHOW

- Every row is tagged with the exact commit SHA that shipped it.
- Walk **down** the `P95Ms` column. Releases are not equal — on a recent run
  this returned eight versions ranging from **43 ms** to **5,843 ms** P95, and
  failure rates from **0.44%** to **8.33%**. Point at the worst row and say
  "that release was a bad day, and we can name the commit."
- If you redeploy mid-conference, you can immediately filter to just the new
  version and compare failure rate and duration against the previous one.

> ⚠️ **Be ready for the `1.0.0.0` row.** You will likely see one version literally
> named `1.0.0.0` with `gitCommitSha = "unknown"` and an ugly failure rate. That
> is the assembly default — telemetry emitted when the release environment
> variables were not present. Do not let it look like a mystery: say "that's the
> fallback bucket for anything that started before the deploy stamped it, which
> is itself useful to be able to see."

### SAY

> "Every request already knows which commit produced it. If a regression ships,
> we don't have to ask 'when did this start' — we filter by `application_Version`
> and get the answer."

### RETURN TO

**Detect It Before the Customer Does**

---

## BONUS DEMO B — Alerts and Availability Tests (proactive monitoring)

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
- Toggle the graph from **Line** to **Scatter Plot**, then click a dot →
  **End-to-end transaction details**. A synthetic probe produces the *same*
  transaction view you drilled into in Demo 3.

### 🔥🔥 "Wait, What?" — Classic or Standard? (THE TODAY MOMENT)

> 🎤 **This talk is scheduled for September 30, 2026 — which is the exact day
> URL ping tests retire.**

Ask it as a question first, and wait for the hands:

> "Quick show of hands — who's running URL ping tests in production today?"

Let the hands stay up. Then check your watch.

> "I want you to know what today is. **Today — September 30th, 2026 — is the day
> Classic URL ping tests retire in Application Insights.** Not deprecated.
> Retired. Microsoft's words are: *existing URL ping tests are removed from your
> resources.* Multi-step web tests already went in August 2024."

Now open `iac/appInsights.bicep` in VS Code and show the three webtest resources:

### SHOW

- All three tests are `kind: 'standard'` — this repo is already on the
  non-deprecated path, in infrastructure as code, reviewable in a pull request.
- Standard tests do things ping tests never could, and this file uses them:
  - `SSLCheck` + `SSLCertRemainingLifetimeCheck: 7` — **proactive** TLS expiry
    warning, seven days before the certificate kills your site
  - `ContentMatch: 'Gino'` — a 200 that renders the wrong page still fails
  - `HttpVerb` / custom headers / request body — real API probing, not just pings
  - `RetryEnabled: true` — roughly 80% of failures vanish on retry

### SAY

> "The difference that matters isn't Classic versus Standard as a feature list.
> It's that our uptime checks are a reviewed file in the repo. When someone asks
> 'who decided to monitor that endpoint,' the answer is a commit — not a person
> who clicked something in the portal eighteen months ago and then left."

### NOTE — "Why Standard?" and "What do they cost?"

Expect both questions. Have these answers loaded.

**Q: Why Standard?**

**So why Standard tests?** They can validate SSL certificates, response codes, content, headers, and even POST requests, and they can run from multiple locations around the world.

**Q: What do they cost?**

Standard tests bill **per test execution**. **Standard tests are not free**. They’re billed per test execution. Pricing varies by region and agreement, but it’s roughly **$0.0005 per execution**.
- As an example, one test running every five minutes from five locations is roughly **$20–$25 per month**. So for a few tests, the cost is pretty small, but at enterprise scale, it’s definitely something you want to plan for.

### If you want the KQL

**Option 1 — Ask the Observability Agent** (Logs → toggle **Agent** on)

```text
Using availabilityResults over the last 24 hours, show me the success rate and average duration for each availability test, broken down by test location. Sort by success rate ascending.
```

**Option 2 — KQL**

```kusto
availabilityResults
| where timestamp > ago(24h)
| summarize
    Runs = count(),
    SuccessRate = round(100.0 * countif(success == true) / count(), 2),
    AvgDurationMs = round(avg(duration), 0)
    by name, location
| order by SuccessRate asc
```

### SAY

> "This is the difference between finding a problem and being told about a
> problem. The alert and the availability tests run whether or not I'm watching
> the portal."

### RETURN TO

**Detect It Before the Customer Does**

---

## BONUS DEMO C — Find Custom Markers with Search

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

### THEN SHOW THE CODE (this is the payoff)

Switch to VS Code and show the three lines that produced what they just saw.
Go in this order — it walks the same path as the telemetry.

**1. `ginos-gelato/client/src/pages/Builder.tsx` — find `IceCreamCreated`**

> "Four lines of business vocabulary. Not a log message — a queryable fact."

**2. `ginos-gelato/client/src/pages/Checkout.tsx` — find `OrderCompleted`**

The same shape, with the full order on it: `orderNumber`, `orderTotal`,
`deliveryType`, `deliveryFee`, `shippingFee`, `tax`, `subtotal`.

**3. `ginos-gelato/server/Services/OrderService.cs` — find `OrderCreated`**

This is the most interesting one on the slide-free tour — three things at once:

Point out all three:

- **Two dictionaries.** Strings are dimensions you group and filter by;
  doubles are measurements you average and sum. The browser SDK flattens both
  into `customDimensions` — the .NET SDK makes you choose deliberately.
- **The `?` on `_telemetry`.** Look at the constructor: `TelemetryClient?` is an
  *optional* parameter. If someone challenges you, open
  `ginos-gelato/server.Tests/OrderServiceValidationTests.cs` and show
  `CreateService` \u2014 it builds `OrderService` with three arguments and simply
  omits telemetry. Business logic is not coupled to Azure.
- **No correlation code.** Nobody passed an operation ID. The SDK picks up the
  ambient request context — which is exactly why "related items" in the portal
  could link the browser event to this one.

### SAY

> "These aren't synthetic demo events — they're the same markers that would be
> in place the day this feature shipped: `BuilderPageVisit`, `IceCreamCreated`,
> `AddToCart`, `CheckoutStarted`, `CheckoutStepCompleted`,
> `DeliveryMethodSelected`, `OrderCompleted`, and server-side `OrderCreated`.
> Search is the fastest way to answer 'did this specific thing happen,' without
> writing a query or building a dashboard first."

### RETURN TO

**Evidence-Based Debugging with GitHub Copilot**

---

## BONUS DEMO D — 🔥 "Wait, What?" — You Are Already Sampling

**Target:** 5 minutes  
**Search marker:** `BONUS DEMO D`  
**Use when:** anyone asks what this costs. This is *the* answer to that question.

### SAY

> "Somebody always asks what this costs. Fair question. But before I answer it,
> I want to show you something about this app that I did not know either, the
> first time I went looking."

### PART A — The reveal

Open `ginos-gelato/server/Program.cs` in VS Code.

> "Find me the sampling code."

Let them look. Then scroll to the Application Insights registration:

```csharp
builder.Services.AddApplicationInsightsTelemetry();
```

> "That's it. That's the whole telemetry configuration. There is no sampling
> code in this repository. **And this application is sampling right now.**"

### SHOW

- Adaptive sampling is **on by default** in the Application Insights ASP.NET and
  ASP.NET Core SDKs, and in Azure Functions. Nobody opts in.
- The default target is **5 telemetry items per second, per host**.
- The SDK actually registers **two** adaptive sampling processors: one that
  includes `Event` telemetry and one that excludes it. So custom events get
  their own 5/sec budget, separate from the 5/sec shared by everything else.
- It samples by **operation ID**, so a sampled-in failed request keeps its
  exceptions, traces, and dependencies. You never get half a transaction.
- On a low-traffic app it does nothing at all. It only engages above the rate limit.

### PART B — 🔥 The second "wait, what?"

Now open `ginos-gelato/client/src/services/appInsights.ts`.

> "Here's the browser configuration for the *same* Application Insights resource."

There is no `samplingPercentage` in that config — the JavaScript SDK defaults to
**100%**, and the JS SDK does not support adaptive sampling at all.

### SAY

> "Same resource. Same product. The server is sampling and the browser is not.
> Neither decision is written down anywhere in this codebase. That is the real
> answer to 'what does it cost' — most teams have no idea what they're actually
> keeping."

### PART C — 🔥 KILLER QUERY: "Am I being sampled right now?"

**Option 1 — Ask the Observability Agent** (Logs → toggle **Agent** on)

```text
For the last 24 hours, tell me whether my telemetry is being sampled. Union requests, dependencies, pageViews, browserTimings, exceptions and traces, and show me the retained percentage per telemetry type per hour, calculated as 100 divided by the average itemCount.
```

**Option 2 — KQL**

```kusto
union requests, dependencies, pageViews, browserTimings, exceptions, traces
| where timestamp > ago(24h)
| summarize RetainedPercentage = 100 / avg(itemCount) by bin(timestamp, 1h), itemType
| render timechart
```

> Any `itemType` under 100 is being sampled. This is the query nobody knows
> exists, and it answers a question every team has.

### PART D — 🔥 KILLER QUERY: sampling does not lie to you

The most common objection is "then my numbers are wrong." They are not — *if*
you count correctly.

**Option 1 — Ask the Observability Agent**

```text
For requests in the last 24 hours, show me the raw record count next to the sampling-corrected count using sum of itemCount, grouped by operation name. Highlight where the two numbers differ.
```

**Option 2 — KQL**

```kusto
requests
| where timestamp > ago(24h)
| summarize
    RawRecords = count(),
    ActualRequests = sum(itemCount)
    by operation_Name
| extend Multiplier = round(1.0 * ActualRequests / RawRecords, 2)
| order by ActualRequests desc
```

### SAY

> "`itemCount` is the multiplier the SDK stamped on every record it kept. Count
> records and you undercount. `sum(itemCount)` and you get the real number.
> This is the single most important thing to know about sampling, and it's one
> word in a query."

Two more facts worth saying out loud:

- **Metrics are never sampled.** Custom metrics, performance counters, and
  session telemetry are always kept, at full fidelity, in every sampling mode.
  If a number has to be exact, make it a metric, not an event.
- Sampling is applied **once**. Ingestion sampling in the portal is ignored
  entirely when the SDK is already sampling.

### PART E — The portal answer to the cost question

Azure Portal → Application Insights → **Usage and estimated costs**.

Walk the three levers, in the order you'd actually reach for them:

| Lever | Where | Trade-off |
| --- | --- | --- |
| **SDK adaptive sampling** | `Program.cs` (on by default) | Best fidelity per byte; preserves whole transactions |
| **SDK fixed-rate sampling** | `Program.cs` + browser config | Deterministic; synchronizes browser and server |
| **Ingestion sampling** | This blade | No redeploy, but you already paid to send it |

Also point at **Data retention** and the **Daily cap**.

> ⚠️ **Stage safety: show, do not set.** A daily cap applied live silently drops
> telemetry for the rest of the session — including demos you have not run yet.
> Look at the blade and move on.

### If someone asks "how would I change it?" (show, do not type live)

```csharp
// Turn adaptive sampling off entirely.
builder.Services.AddApplicationInsightsTelemetry(
    new ApplicationInsightsServiceOptions { EnableAdaptiveSampling = false });
```

```csharp
// Or keep adaptive sampling, but retune it. Disabling the default is required —
// otherwise you get two sampling chains and ingest more than you expect.
builder.Services.Configure<TelemetryConfiguration>(config =>
{
    var chain = config.DefaultTelemetrySink.TelemetryProcessorChainBuilder;
    chain.UseAdaptiveSampling(maxTelemetryItemsPerSecond: 5, excludedTypes: "Dependency");
    chain.Build();
});

builder.Services.AddApplicationInsightsTelemetry(
    new ApplicationInsightsServiceOptions { EnableAdaptiveSampling = false });
```

### SAY

> "So the honest answer to 'what does it cost' is: less than you think, because
> you're already sampling — and you have three dials, and the cheapest one is
> the one you never knew was already turned on."

### RETURN TO

**What to Take Home**

---

## 🎁 BONUS DEMO E — 🔥 Smart Detection (the AI nobody configured)

**Target:** 3 minutes  
**Search marker:** `BONUS DEMO E`  
**Why it earns its slot:** the session is titled *AI-Powered Observability*.
This is the one feature where the AI ran without being asked.

### SAY

> "Everything I've shown you so far, a human started. I opened a blade, I ran a
> query, I clicked a node. Let me show you the one thing in here that has been
> analyzing this application the entire time I've been talking."

### Azure Portal:

**Application Insights > Investigate > Smart Detection**

> If the menu item isn't where you expect it, type "Smart Detection" into the
> resource menu filter box. The portal has moved it more than once.

### DO

1. Open the Smart Detection list.
2. Open any detection.
3. Read the **What happened** and **Why it's a problem** sections aloud.
4. Point at the supporting evidence the detection links to — it deep-links into
   the same Failures and Performance blades from Demos 3 and 4.

### SHOW

- Nobody wrote a rule. Nobody set a threshold. There is no KQL behind it.
- It learned this application's normal and flagged the deviation.
- It covers failure-rate anomalies, performance degradation, trace degradation,
  memory leaks, and abnormal rises in exception volume.

### SAY

> "This is the difference between a threshold and a baseline. My alert in Bonus
> B fires at three seconds because *I* picked three seconds. Smart Detection
> never asked me for a number — it learned what this app does on a Tuesday, and
> it tells me when Tuesday stops looking like Tuesday."

> ⚠️ **Stage check (morning of):** this blade can legitimately be empty on a
> healthy low-traffic app. **Check it before the session.** If it's empty, skip
> this demo silently and use the KQL below instead — do not apologize on stage
> for a feature working correctly.

### 🔥 Fallback / encore — do the same thing yourself in one query

**Option 1 — Ask the Observability Agent**

```text
Look at request failure rate per hour over the last 7 days and detect anomalies against the learned baseline. Show me which hours were statistically abnormal and how far off baseline they were.
```

**Option 2 — KQL**

```kusto
requests
| where timestamp > ago(7d)
| make-series FailRate = 100.0 * countif(success == false) / count()
    default = 0 on timestamp step 1h
| extend (Anomalies, Score, Baseline) = series_decompose_anomalies(FailRate, 2.0)
| render anomalychart with(anomalycolumns = Anomalies)
```

### SAY

> "Smart Detection does this for you, continuously, for free. But it's worth
> seeing that it isn't magic — it's a baseline and a deviation, and you can run
> the same analysis yourself in six lines."

### RETURN TO

**Detect It Before the Customer Does**
