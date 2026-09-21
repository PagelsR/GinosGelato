# 03 - Demo Readiness

Presenter guide for demonstrating Gino's Gelato and generating realistic
Application Insights telemetry on demand.

> Authoritative context: [00 - Project Vision](00-Project-Vision.md) ·
> Telemetry reference: [02 - Observability](02-Observability.md)

## What This Milestone Adds

- **Feature-flagged demo faults** — deterministic, disabled by default, and
  independently selectable.
- **Daily customer journeys** (Playwright specs in `/e2e/`) that generate clean
  success telemetry and, on demand, fault telemetry.
- **Scheduled workflow** that runs the full Playwright suite (journeys, fault,
  and flaky specs) against the deployed Static Web App every day, producing a
  realistic mix of passing, failing, and flaky results plus telemetry.

## Customer Journeys

All journeys live in `/e2e/` and run against the deployed Static Web App
(`BASE_URL`, falling back to the deployed SWA). Each is independently selectable.

| # | Journey | Spec | Telemetry produced |
|---|---------|------|--------------------|
| 1 | Happy Path Pickup Order | `e2e/journey-1-happy-path-pickup.spec.ts` | Page views, route changes, `IceCreamCreated`, `CheckoutStarted`, `OrderCompleted`, `POST /api/orders`, server `OrderCreated` |
| 2 | Delivery Order Browse-to-Buy | `e2e/journey-2-delivery-browse-to-buy.spec.ts` | Flavors page view, delivery checkout path, delivery `OrderCompleted` |
| 3 | Info / Marketing Tour | `e2e/journey-3-info-marketing-tour.spec.ts` | Route-change + page-view telemetry across About / Flavors / Locations / Catering |
| 4 | Fault Demo Journey | `e2e/journey-4-fault-demo.spec.ts` | Slow SQL dependency, failed API request (503), unhandled browser exception |
| 5 | U.S. Shipping Orders | `e2e/journey-5-shipping-order.spec.ts` | Shipping fulfillment, $9.99 fee, `Shipping` order persisted; includes one intentional failing test (PO Box rule not implemented) |

Run one journey:

```powershell
npx playwright test e2e/journey-1-happy-path-pickup.spec.ts
```

Run all journeys:

```powershell
npx playwright test e2e/journey-*.spec.ts
```

Run the full suite (what the daily workflow does — journeys, fault, and flaky
specs, giving a mix of pass/fail/flaky results plus telemetry):

```powershell
npx playwright test
```

Target a specific environment:

```powershell
$env:BASE_URL = 'https://<your-static-web-app>.azurestaticapps.net/'
npx playwright test
```

## Demo Faults

Faults are **disabled by default**. They only activate when explicitly selected,
so normal customer journeys never emit fault telemetry. Each fault is
deterministic and repeatable.

### Selecting a fault (client)

Navigate to the **Fault Console** and pick a fault with the `?fault=` selector:

| Fault | URL | Result |
|-------|-----|--------|
| Slow SQL | `/fault?fault=slow-sql` | Deliberate ~3s Azure SQL dependency (`WAITFOR DELAY`) |
| SQL failure | `/fault?fault=sql-failure` | Deliberate failed Azure SQL dependency (`RAISERROR`) — red SQL node on the Application Map |
| API failure | `/fault?fault=api-failure` | API returns `503 Service Unavailable` |
| Browser exception | `/fault?fault=browser-exception` | Unhandled client-side exception |

You can also toggle a fault from the browser console:

```js
localStorage.setItem('DEMO_FAULT', 'slow-sql'); // or 'api-failure' / 'browser-exception'
localStorage.removeItem('DEMO_FAULT');          // disable
```

### Server endpoints (invoked only by the fault paths)

| Endpoint | Behavior |
|----------|----------|
| `GET /api/demo/status` | Reports whether faults are enabled and lists them |
| `GET /api/demo/slow-sql` | Runs a deterministic slow SQL query, returns `200` |
| `GET /api/demo/sql-failure` | Runs a deliberately failing SQL command (`RAISERROR`), returns `500` |
| `GET /api/demo/api-failure` | Returns `503` with problem details |

### Enabling / disabling faults per environment

The server honors the `DemoFaults:Enabled` configuration value (default `true`).
To lock the fault endpoints down in a specific environment, set the App Service
app setting:

```
DemoFaults__Enabled = false
```

When disabled, the fault endpoints return `404` and no fault telemetry is
produced.

## Daily Scheduled Workflow

`.github/workflows/playwright-testing.yml` runs the full Playwright suite daily
(06:00 EST / 11:00 UTC) and can be triggered manually via **workflow_dispatch**.
The run intentionally includes a mix of statuses — reliable journeys, the fault
journey, and the flaky/failing specs — so the trend dashboard stays realistic.
The step uses `continue-on-error`, so failing and flaky tests never block the
HTML report and trend dashboard that are published to GitHub Pages.

Because the suite runs against the live deployment, it continuously generates
realistic Application Insights telemetry. The fault journey (Journey 4) exercises
all three fault paths on every run, so slow-dependency, failed-request, and
exception telemetry appear daily without any manual step.

## Suggested Demo Flow

1. Show a happy-path pickup order (Journey 1) and correlate it in Application
   Insights using the KQL in [02 - Observability](02-Observability.md).
2. Run the delivery journey (Journey 2) and the info tour (Journey 3) to show
   telemetry breadth.
3. Trigger each fault (`/fault?fault=...`) and show the slow dependency, failed
   request, and exception appear in Application Insights.
4. Open the GitHub Pages trend dashboard to show the daily pass/fail/flaky mix.

## Exit Criteria (met)

- One daily workflow runs the Playwright suite and generates realistic telemetry
  against the deployed Static Web App.
- Every demo scenario (each journey and each fault) is independently selectable.
- Faults are deterministic, repeatable, and disabled by default.
- The daily run produces a realistic mix of passing, failing, and flaky results.
