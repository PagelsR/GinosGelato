---
agent: agent
description: 'Demo 2 Part B: explore the live app with Playwright MCP, then write and run e2e/demo-empty-cart.spec.ts until it passes.'
tools: ['playwright/*', 'execute', 'read', 'edit', 'search']
---

Follow the rules in [playwright.prompt.md](./playwright.prompt.md) and the
repo's `ginos-gelato-playwright` skill.

Scenario: a customer opens the Gino's Gelato site, goes directly to the Cart
without adding anything, and should see the empty-cart state.

1. Explore the live app first with the Playwright MCP tools. Do not guess the UI.
2. Create `e2e/demo-empty-cart.spec.ts`, following the conventions in
   `e2e/journey-1-happy-path-pickup.spec.ts`.
3. Assert the actual empty-cart message you observe.
4. Run only this file and iterate until it passes:
   `npx playwright test e2e/demo-empty-cart.spec.ts`
