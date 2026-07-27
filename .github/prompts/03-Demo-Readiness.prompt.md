---
name: ginos-demo-readiness
description: Add controlled Application Insights demonstration scenarios
agent: agent
---

# 03 - Demo Readiness

## Read First
Read and follow the authoritative project specification: [00 - Project Vision](../docs/ai/00-Project-Vision.md)

Treat that document as the source of truth for:

- Product scope
- Application architecture
- Azure standards
- Security requirements
- Engineering principles
- Explicitly prohibited approaches

## Objective
Prepare the application for conference demonstrations.

## Implement
- Feature-flagged demo failures
- Slow SQL scenario (exercised by a dedicated Playwright fault journey)
- API failure scenario (exercised by a dedicated Playwright fault journey)
- Browser exception scenario (exercised by a dedicated Playwright fault journey)
- Daily Playwright customer journeys (in `/e2e/`) that generate telemetry
- Scheduled (daily) GitHub workflow that runs the customer journeys
- Demo data reset scripts
- Presenter documentation

## Customer Journeys
Author Playwright specs in `/e2e/` so the scheduled workflow runs them automatically
against the deployed Static Web App. Each journey is an independently selectable spec
that exercises real user flows and emits Application Insights telemetry (page views,
route changes, dependency calls, and custom events such as `IceCreamCreated` and
`CheckoutStarted`).

1. **Happy Path Pickup Order** - Home -> Builder (container + flavors + toppings) ->
   Cart -> Checkout (pickup) -> order confirmation. Produces clean success telemetry.
2. **Delivery Order Browse-to-Buy** - Our Flavors -> Builder -> Cart ->
   Checkout (delivery) -> order confirmation. Adds page-view breadth and a second
   checkout path.
3. **Info / Marketing Tour** - About -> Flavors -> Locations -> Catering. Generates
   route-change and page-view telemetry across the informational pages.
4. **Fault Demo Journey** - Drives the feature-flagged slow-SQL, API-failure, and
   browser-exception paths so failed-dependency and exception telemetry appear on
   demand.

## Requirements
All demo scenarios must be deterministic, repeatable, and disabled by default.

## Validation
- One daily workflow runs the customer journeys and generates realistic telemetry.
- Demo scenarios (including each customer journey) are independently selectable.
- Cleanup restores the environment.

## Exit Criteria
The application is presentation-ready and capable of generating realistic Application
Insights data on demand, including a daily Playwright workflow that runs the customer
journeys against the deployed Static Web App.
