# 04 - Trainer Demo Guide: Production Troubleshooting with Application Insights

## Duration

~55 minutes for an application-development audience. Eight demo beats that move
from a working feature to finding and fixing a production problem.
Energy arc: **Setup → Symptom → Rising Investigation → Wow closer.**

| # | Demo | Time | Energy |
|---|------|------|--------|
| 0 | The app, the architecture, the "already shipped" story | 5:00 | Low — warm-up |
| 1 | The customer experience and a visible symptom | 5:00 | Low → Medium |
| 2 | App Insights health + Live Metrics + the journey as code | 5:00 | Medium |
| 3 | Trace a slow request end-to-end (browser → API → SQL) | 10:00 | Rising Wow |
| 4 | Diagnose a failed request down to the exception | 10:00 | Rising Wow |
| 5 | Technical vs. business telemetry — the checkout funnel | 7:00 | Medium |
| 6 | Answer a real question with KQL | 6:00 | Medium |
| 7 | Take the finding back to code with Copilot | 5:00 | Wow closer 🔥 |
| 8 | Alerts, release correlation, recap | 2:00 | Wind-down |

------------------------------------------------------------------------

## Platform

This module runs across three surfaces — no VS 2026 required:

- A **browser** on the deployed storefront (Azure Static Web Apps).
- The **Azure Portal** → Application Insights for the target resource.
- **VS Code** with GitHub Copilot for the final "back to code" beat.

------------------------------------------------------------------------

## Environment

- Deployed app reachable (Static Web App front end + App Service API).
  Default demo URL: `https://wonderful-coast-040cb1a10.7.azurestaticapps.net/`
  (this is the Playwright `baseURL` fallback in `playwright.config.ts`).
- Application Insights resource receiving telemetry from both the browser SDK
  and the API. See [02 - Observability](02-Observability.md) for what is wired.
- Demo faults enabled on the API (`DemoFaults:Enabled` = true, the default).
- Repo open locally in VS Code: <https://github.com/PagelsR/GinosGelato>
- Node + Playwright installed (`npm ci` at the repo root) so you can run the
  customer journeys live.
- Copilot Chat signed in for Demo 7.

> The fault scenarios are deterministic and disabled by default in the UI — they
> only fire when you explicitly select them. Full mechanics are documented in
> [03 - Demo Readiness](03-Demo-Readiness.md).

------------------------------------------------------------------------

## Setup (do this before you present)

1. Open the deployed storefront in a browser tab and confirm it loads.
2. Open the Azure Portal to the Application Insights resource, and pin these
   blades as tabs: **Live Metrics**, **Application map**, **Failures**,
   **Performance**, **Transaction search**, **Logs**.
3. In VS Code, open these files as tabs so you can show "the user flow as code":
   - `e2e/journey-1-happy-path-pickup.spec.ts`
   - `e2e/journey-4-fault-demo.spec.ts`
   - `ginos-gelato/client/src/pages/Checkout.tsx`
   - `ginos-gelato/server/Services/OrderService.cs`
4. Warm the telemetry: run the happy-path journey once so the portal already has
   a clean transaction to show (see Demo 2 command).
5. Have a second browser tab ready on `/fault` for the fault beats.

> Timing note: browser telemetry can take 1–3 minutes to appear in the portal.
> Trigger each scenario a little before you narrate it, or use **Live Metrics**
> (near real-time) to bridge the gap.

------------------------------------------------------------------------

## Demo 0: The App and the "Already Shipped" Story (~5 min)

**Goal:** Set the stage fast. Establish that the feature exists and was built
with AI assistance — without spending the session proving it.

**Trainer flow:**
1. Show the storefront home page.
2. Sketch the architecture in one breath: React storefront → ASP.NET Core API →
   Azure SQL, hosted on Azure Static Web Apps + App Service, with Application
   Insights, GitHub Actions, and Bicep.

**Talking point:**

> "Imagine the team was asked to add online ordering. Copilot helped scaffold the
> feature, generate the API, add persistence, and create automated tests. That
> work is already complete. Today we look at what happens *after* the feature
> reaches production — when something is slow, failing, or behaving
> unpredictably, and the team has to find it."

------------------------------------------------------------------------

## Demo 1: The Customer Experience and a Visible Symptom (~5 min)

**Goal:** Start as a customer, not in the portal. Give the audience a reason to
care about every screen that follows.

**Trainer flow:**
1. Walk the happy path live: Home → Build Ice Cream (container + flavors +
   toppings) → Cart → Checkout (pickup) → confirmation. Note the confirmation
   number format `GGyyMMdd-#####`.
2. Now reproduce the symptom deterministically. In a second browser tab,
   navigate to the Fault Demo page with the `slow-sql` scenario pre-selected.
   The `/fault` path is the **FaultDemo** React page; the `?fault=` query
   parameter tells it which scenario to run automatically on load.

   Copy and paste the full URL:

   ```
   https://wonderful-coast-040cb1a10.7.azurestaticapps.net/fault?fault=slow-sql
   ```

   The Fault Console shows the request executing and completing after
   approximately 3 seconds — that delay is a real `WAITFOR DELAY '00:00:03'`
   SQL command running against Azure SQL, producing a genuine slow dependency
   in Application Insights.

   The three available fault values are:

   | `?fault=` value    | What it triggers                                      |
   |--------------------|-------------------------------------------------------|
   | `slow-sql`         | 3-second SQL delay → slow dependency in AI            |
   | `sql-failure`      | SQL command fails → failed SQL dependency (red SQL node on App Map) |
   | `api-failure`      | API returns 503 → failed request + exception in AI    |
   | `browser-exception`| Client throws unhandled error → exception in AI       |

**Talking point:**

> "The customer says checkout got slow. Where does an application developer
> start? Not by guessing — by following the telemetry."

------------------------------------------------------------------------

## Demo 2: Health, Live Metrics, and the Journey as Code (~5 min)

**Goal:** Orient the audience in Application Insights, then show the powerful
idea that the customer journey *is* code you can run on demand.

**Trainer flow:**
1. In the portal, open the App Insights **Overview**: failed requests, server
   response time, request volume, availability. Do not tour every blade.
2. Open **Application map** and read the topology aloud — it mirrors the
   architecture: **Client** (browser) → **App Service** (API) → **Azure SQL**.
   Point at the call counts and the per-node error percentage; this is the
   10-second orientation before any drill-down. (Keep it here as the map; you
   will see a node turn red in Demo 4.)
3. Open **Live Metrics**.
4. In VS Code, open `e2e/journey-1-happy-path-pickup.spec.ts` and scroll it —
   this is the real user flow expressed as code.
5. Run it against the deployed app and watch Live Metrics react:

   ```powershell
   npx playwright test e2e/journey-1-happy-path-pickup.spec.ts
   ```

6. Point out incoming requests and dependency calls arriving live.

**Talking point:**

> "Our customer journeys are Playwright specs in `/e2e/`. A scheduled workflow
> runs them daily against production, so we always have realistic telemetry —
> and I can replay any journey on demand. Application Insights tells us whether a
> problem is isolated, widespread, new, or getting worse."

------------------------------------------------------------------------

## Demo 3: Trace a Slow Request End-to-End (~10 min)

**Goal:** The strongest "rising wow." Turn "the app is slow" into "this exact SQL
operation consumed the time." Show correlation across browser → API → SQL.

**Trainer flow:**
1. Generate the slow scenario deterministically. Either open
   `/fault?fault=slow-sql` in the browser, or run the fault journey:

   ```powershell
   npx playwright test e2e/journey-4-fault-demo.spec.ts -g "slow SQL"
   ```

   The API endpoint `GET /api/demo/slow-sql` runs a deliberate `WAITFOR DELAY`,
   so a genuine slow **SQL dependency** appears in telemetry.
2. In the portal, open **Performance** → find the slow operation, then open a
   sample and click **End-to-end transaction details**.
3. Walk the timeline layer by layer:

   ```
   Browser (React telemetry)
     ↓
   ASP.NET Core API request
     ↓
   EF Core / Azure SQL dependency  ← the time lives here
   ```

4. Call out the shared **operation ID** linking browser, API request, and SQL.

**Talking point:**

> "Distributed tracing turns 'checkout is slow' into 'this SQL dependency took
> ~3 seconds, and everything above it was fast.' We didn't have to guess whether
> it was the front end, the network, the API, or the database."

------------------------------------------------------------------------

## Demo 4: Diagnose a Failed Request (~10 min)

**Goal:** Show a controlled failure traced to a specific exception with useful
context — and correlated across the browser and API.

**Trainer flow:**
1. Trigger the API failure. Open `/fault?fault=api-failure`, or:

   ```powershell
   npx playwright test e2e/journey-4-fault-demo.spec.ts -g "API failure"
   ```

   `GET /api/demo/api-failure` returns `503` with problem details.
2. In the portal, open **Failures** → failed request `resultCode 503` → drill
   into the **exception** and its related request/dependency.
3. Show the **structured context** captured on the client exception (from
   `src/services/api.ts` and `Checkout.tsx`): properties such as `fault`,
   `api`, `endpoint`, `demoMode`, and on order failures `itemCount`,
   `orderTotal`, `deliveryType`.
4. Show the shared operation ID linking the browser event to the API failure.
5. **Database-layer failure (Application Map turns red).** Trigger a failed SQL
   dependency — open `/fault?fault=sql-failure`, or:

   ```powershell
   npx playwright test e2e/journey-4-fault-demo.spec.ts -g "SQL failure"
   ```

   `GET /api/demo/sql-failure` runs a deliberate `RAISERROR`, so a **failed SQL
   dependency** is recorded (no order data touched). Return to **Application
   map** and show the **SQL node/edge now flagged red** with a small error
   percentage — the same map from Demo 2, now showing a database-layer problem.
   Because the daily fault journey runs this once a day, that red slice stays an
   occasional `<1%`, not a constant alarm.

### Reading the Application Map (narrate left → right)

- **CLIENT** (e.g. "735 views, 434 ms") — the React storefront; browser
  telemetry. Views are page loads; the number is average client load time.
- **AVAILABILITY 100%** — synthetic availability pings; the app answered them all.
- **App Service node** (e.g. "4 instances, 2%, 224 ms, 349 calls") — the
  ASP.NET Core API. Green = healthy; the small red tick is the error slice.
- **The red edge → SQL** (e.g. "48.4 ms | 0.2% ❗", 499 calls) — the star: of
  ~499 SQL dependency calls, ~0.2% failed, so the edge and the SQL node flag red.
  That is the planted `sql-failure` fault appearing as a real **failed Azure SQL
  dependency**.
- **SQL node** (`sql-…GinosGelatoDb`) — the Azure SQL database dependency.

Click the red edge, then drill in:

- **Top failing status codes → `50000`** — SQL Server error number **50000** is
  exactly what our `RAISERROR(N'Demo SQL failure…', 16, 1)` raises.
- **operation_Name: `GET Demo/SqlFailure`** — proof it came from the demo fault
  endpoint, *not* a real checkout path. Nothing in ordering is broken.
- **Sample dependency: `Success == false`, response code `50000`,
  `…GinosGelatoDb`** — the exact failed SQL call, timestamped and correlated to
  one operation.

**Talking point (Application Map):**

> "Two things to notice. First, it's a *database dependency* failing — not the
> API, not the browser — and the map points right at it without me guessing.
> Second, it's only ~0.2%: an occasional blip, not an outage, which is what real
> triage looks like. I click 'Investigate failures,' land on the exact SQL
> command and error code 50000, and see it came from `GET Demo/SqlFailure` — from
> 'something's red' to 'this query, this instance, this time' in about three
> clicks."

**Honesty beat (recommended):**

> "Full transparency — I planted this one. It's a deterministic demo fault that
> runs a harmless `RAISERROR`, fired once a day by our Playwright journey so the
> map always has a realistic sub-1% database error to investigate. The tooling
> and workflow are exactly what you'd use on a real failure; only the cause is
> simulated."

**Talking point:**

> "The exception is far more useful when logs, requests, dependencies, and
> business context share one operation ID. We keep customer PII out of telemetry
> and log the business context that helps us reproduce the failure."

------------------------------------------------------------------------

## Demo 5: Technical vs. Business Telemetry — the Funnel (~7 min)

**Goal:** Elevate the session. A system can be technically healthy while
customers still cannot finish the business process.

**Trainer flow:**
1. Contrast the two questions:
   - *Technical:* did the request fail? how long did SQL take? which exception?
   - *Business:* how many started checkout? how many completed? which fulfillment
     method? where are customers dropping off?
2. Show the **real custom events** this app emits (open `Checkout.tsx` and
   `OrderService.cs` to prove they are in code):

   ```
   IceCreamCreated        (builder)
   AddToCart              (cart)
   CheckoutStarted        (browser)
        ↓
   CheckoutStepCompleted  (browser)
   DeliveryMethodSelected (browser)
        ↓
   OrderCompleted         (browser)   +   OrderCreated (API)
   ```

3. In **Logs**, run the funnel query (also in [02 - Observability](02-Observability.md)):

   ```kql
   customEvents
   | where name in ("CheckoutStarted", "CheckoutStepCompleted", "OrderCompleted")
   | summarize count() by name
   ```

**Talking point:**

> "An application can be technically healthy while customers are still unable to
> complete the business process. Business events tell us that story; requests and
> exceptions alone do not."

------------------------------------------------------------------------

## Demo 6: Answer a Real Developer Question with KQL (~6 min)

**Goal:** Show that developers can interrogate production directly. Two or three
queries — not a syntax lesson.

**Trainer flow:** Run these in **Logs**.

Slowest API operations:

```kql
requests
| where timestamp > ago(1h)
| summarize Requests = count(), AvgMs = avg(duration), P95Ms = percentile(duration, 95)
    by operation_Name
| order by P95Ms desc
```

Most common exceptions:

```kql
exceptions
| where timestamp > ago(1h)
| summarize Count = count() by type, outerMessage
| order by Count desc
```

Fulfillment mix (business signal from a real event):

```kql
customEvents
| where name == "DeliveryMethodSelected"
| extend method = tostring(customDimensions.method)
| summarize Count = count() by method
| order by Count desc
```

**Talking point:**

> "The value isn't the syntax — it's that a developer can ask a precise question
> of production and get an answer in seconds."

------------------------------------------------------------------------

## Demo 7: Take the Finding Back to Code with Copilot (~5 min)

**Goal:** The wow closer. AI helps fix a *proven* production problem — not invent
random code.

**Trainer flow:**
1. In the portal, point at the two back-to-back SQL dependencies visible on
   every checkout request in **Performance** → **End-to-end transaction**.
   Both hits come from `SaveChangesAsync` — one to insert the order, one
   to write the confirmation number back. That extra round-trip is the latency
   the customer felt.
2. In VS Code, open **`ginos-gelato/server/Services/OrderService.cs`** and
   scroll to the `// ── BEFORE (commented out)` block. The commented code is
   the original implementation Application Insights exposed. The live code
   below it is the fix already shipped — confirmation number is now generated
   before saving so one SQL round-trip handles everything.
3. Ask Copilot Chat with the file open:

   ```text
   The commented-out block shows our original CreateOrderAsync implementation.
   Application Insights showed two back-to-back SQL dependencies on every
   checkout. Explain exactly why the original caused that, confirm the current
   fix is correct and safe, and tell me which tests to run to validate it
   before deploying.
   ```

4. Copilot will explain the root cause (confirmation number depended on the
   DB-assigned Id, forcing a second round-trip) and confirm the fix. Then
   run the tests to show the validation step:

   ```powershell
   dotnet test ginos-gelato/server.Tests/GinosGelato.Tests.csproj
   ```

**Talking point:**

> "We didn't ask AI to guess. We showed it exactly what Application Insights
> found, and asked it to explain and validate what we already fixed. The tests
> are the last gate before it ships."

------------------------------------------------------------------------

## Demo 8: Alerts, Release Correlation, Recap (~2 min)

**Goal:** Land the "detect before the customer calls" idea and close.

**Trainer flow (keep it short):**
1. **Alerts:** describe one or two you would set — failure rate > 5%, or P95
   checkout duration > 3s. Show the Alerts blade briefly if configured.
2. **Release correlation (live):** every telemetry item — browser and API —
   carries the build identity (`application_Version`, plus `gitCommitSha`,
   `deploymentId`, `environment`), stamped by the release telemetry initializers
   (`ReleaseTelemetryInitializer` on the API and the client initializer in
   `src/services/appInsights.ts`; wired to the deploy in
   `.github/workflows/BuildDeploy.yml`). In **Logs**, compare failures across
   builds:

   ```kql
   requests
   | where timestamp > ago(1d)
   | summarize Requests = count(), Failures = countif(success == false)
       by application_Version
   | order by application_Version desc
   ```

   Show failures concentrated on one `application_Version` — the concrete "it
   started with this release" moment. Drill in with `gitCommitSha` to land on the
   exact commit.
3. **Frontend vs. backend:** remind them the browser can break while the API is
   healthy — demonstrated by `/fault?fault=browser-exception`, which surfaces as
   a client-side exception in App Insights.

**Talking point:**

> "We should detect this before a customer opens a support ticket. And because
> every signal is tagged with the build that produced it, we can prove whether a
> regression arrived with the last deploy — down to the commit."

------------------------------------------------------------------------

## Timing (55-minute agenda)

| Time | Segment |
|------|---------|
| 0:00–5:00 | Demo 0 — App, architecture, "already shipped" story |
| 5:00–10:00 | Demo 1 — Customer experience + visible symptom |
| 10:00–15:00 | Demo 2 — Health, Live Metrics, journey as code |
| 15:00–25:00 | Demo 3 — Slow request traced to SQL |
| 25:00–35:00 | Demo 4 — Failed request traced to exception |
| 35:00–42:00 | Demo 5 — Business telemetry + funnel |
| 42:00–48:00 | Demo 6 — KQL investigation |
| 48:00–53:00 | Demo 7 — Back to code with Copilot |
| 53:00–55:00 | Demo 8 — Alerts, release correlation, recap |

For a full 60 minutes, reserve the last five for questions or a backup demo.

------------------------------------------------------------------------

## The Five Strongest Demos

Prioritize these if time is short; everything else supports them:

1. **Slow checkout traced to SQL** (Demo 3)
2. **Failed checkout traced to a specific exception** (Demo 4)
3. **Browser, API, and SQL correlation** (Demos 3–4, shared operation ID)
4. **Business funnel showing where orders stall** (Demo 5)
5. **Copilot using real telemetry to explain and fix the issue** (Demo 7)

------------------------------------------------------------------------

## Setup Checklist

- [ ] Deployed storefront loads in a browser tab
- [ ] App Insights blades pinned: Live Metrics, App map, Failures, Performance, Transaction search, Logs
- [ ] Repo open in VS Code; journey + Checkout + OrderService files as tabs
- [ ] `npm ci` done at repo root; Playwright browsers installed
- [ ] Happy-path journey run once to seed a clean transaction
- [ ] `/fault` tab ready for the fault beats
- [ ] Copilot Chat signed in for Demo 7

------------------------------------------------------------------------

## Trainer Safety Net

**If portal telemetry lags:** lead with **Live Metrics** (near real-time) and
narrate over it, or trigger each scenario a couple of minutes before you present
it. The daily scheduled workflow means there is always recent history to fall
back on.

**If a fault does not fire:** confirm `GET /api/demo/status` reports
`faultsEnabled: true`, and that you used the exact `?fault=` value. The faults
are disabled by default in the UI and only run when explicitly selected.

**If live Playwright runs are slow or blocked:** you do not need them — every
scenario can be triggered by navigating to the `/fault?fault=...` URL in the
browser. The Playwright angle is a bonus ("the user flow is code"), not a
dependency.

**If asked "is this real or simulated?":** be candid. The faults are
deterministic simulators built for demos (documented in
[03 - Demo Readiness](03-Demo-Readiness.md)), but the telemetry, correlation,
tracing, and diagnosis workflow are exactly what you use on real incidents.

------------------------------------------------------------------------

## Closing Message

Remember the team we met in Demo 0. They were asked to add online ordering to
Gino's Gelato. Copilot helped them scaffold the feature, generate the API, wire
up the database, and build automated tests. The feature shipped.

Then checkout got slow. A customer noticed first.

Today we followed what happened next: the team opened Application Insights,
traced a slow request through the browser, the API, and down to a single SQL
dependency. They found the failed request and read the exception. They queried
the business funnel and saw where orders were stalling. And when they had a
proven finding — not a guess — they brought it back to VS Code, showed Copilot
the telemetry, and fixed the code. Then they ran the tests before it shipped.

That is the complete loop:

**Build the feature → ship it → watch what customers experience →
find failures across every layer → turn production telemetry into a
safe, tested change.**

> Copilot helped ship the feature on day one. Application Insights made sure it
> actually worked on day two — and every day after that. Shipping is only half
> the job.
