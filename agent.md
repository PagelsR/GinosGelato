# Gino's Gelato Agent Instructions

## Project Context
- React frontend with TypeScript and Vite
- .NET 8 backend API with Entity Framework
- Playwright for E2E testing
- Ice cream ordering application
- Ports: Frontend (5173), Backend (5000)

## Testing Guidelines
- Use modern Playwright with TypeScript
- Test complete user journeys (container → flavors → toppings → checkout)
- Include mobile and desktop viewports
- Use `@playwright/test` import syntax
- Focus on reliable selectors (see Selector Best Practices below)
- Always run the tests with browser in headed mode for debugging

### Playwright Selector Best Practices

**Selector Priority (Most to Least Reliable):**
1. `getByRole()` - Preferred for buttons, textboxes, links
2. `getByText()` - Good for exact text matching
3. `getByPlaceholder()` - Use only when role selectors fail
4. `locator().filter()` - For complex element filtering

**Form Field Guidelines:**
- Prefer `getByRole('textbox', { name: 'Field Label' })` over `getByPlaceholder()`
- Role-based selectors are more stable across UI changes
- Use exact text matching for form labels when possible

**Navigation Patterns:**
- Check actual button text including special characters (arrows, emojis)
- Multi-step flows may have different button text patterns
- Wait for success notifications before proceeding to next step

**Dynamic Content Handling:**
- Use regex patterns for dynamic pricing: `{ name: /Complete Order/ }`
- Filter complex elements: `locator('div').filter({ hasText: /pattern/ }).first()`
- Account for multiple matches with `.first()` or `.last()`

**Debugging Strategies:**
- Use `--headed` flag for visual debugging during development
- Add explicit waits for page state changes
- Verify element visibility before interaction

### Testing Workflow Patterns
- Navigation → Selection → Interaction → Verification
- Always wait for state changes (loading, success messages)
- Test with consistent but varied data sets
- Include both positive and negative test scenarios

## Code Standards
- TypeScript strict mode enabled
- React 18 with functional components and hooks
- TailwindCSS for styling
- RESTful API patterns
- Async/await for all API calls
