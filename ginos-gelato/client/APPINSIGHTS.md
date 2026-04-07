# Application Insights Integration

This React app is configured to send telemetry to Azure Application Insights for monitoring user interactions and client-side performance.

## What Gets Tracked Automatically

✅ **Page Views** - Every page navigation  
✅ **Route Changes** - SPA route transitions  
✅ **AJAX Calls** - All API requests (axios/fetch)  
✅ **Performance Metrics** - Load times, render performance  
✅ **Unhandled Exceptions** - JavaScript errors  
✅ **CORS Correlation** - Links frontend requests to backend API calls  

## Demo Mode - Simulate Errors for Testing

**Demo mode is ON by default** to showcase Application Insights error tracking!

Errors will be simulated **occasionally** when you use the app:
- Network errors when fetching flavors (5% chance - about 1 in 20)
- CORS errors when fetching toppings (3% chance - about 1 in 33)
- Timeout errors when creating orders (2% chance - about 1 in 50)
- Payment gateway errors during checkout (2% chance - about 1 in 50)

This creates a realistic demo experience with occasional errors, not constant failures.

### To Turn OFF Demo Mode:

```javascript
// Disable error simulation
localStorage.setItem('DEMO_ERRORS', 'false')

// Refresh the page - no more simulated errors
```

### To Turn Demo Mode Back ON:

```javascript
// Re-enable error simulation
localStorage.removeItem('DEMO_ERRORS')

// Refresh the page
```

### Simulated Errors in Demo Mode:

1. **Network Errors** - "Unable to reach backend API"
2. **CORS Errors** - "No Access-Control-Allow-Origin header"
3. **Timeout Errors** - "timeout of 30000ms exceeded"
4. **API Service Errors** - "Payment gateway temporarily unavailable"

All errors are tracked in Application Insights with a `demoMode: true` property so you can filter them out if needed.  

## Custom Event Tracking

Use the `useAppInsights` hook to track custom events:

```tsx
import { useAppInsights } from '../hooks/useAppInsights';

const MyComponent = () => {
  const { trackEvent, trackException } = useAppInsights();

  const handleAddToCart = (item: IceCream) => {
    // Track custom event
    trackEvent('AddToCart', {
      container: item.container,
      flavorCount: item.flavors.length,
      toppingCount: item.toppings.length,
      price: item.price
    });
    
    // ... rest of your logic
  };

  const handleCheckout = async () => {
    try {
      await processOrder();
      trackEvent('CheckoutComplete', { orderTotal: cartTotal });
    } catch (error) {
      trackException(error as Error, { step: 'checkout' });
    }
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
};
```

## Available Methods

```typescript
const {
  trackEvent,      // Track user actions
  trackException,  // Log errors
  trackMetric,     // Record custom metrics
  trackTrace,      // Add diagnostic logs
} = useAppInsights();
```

## Example Events to Track

- `AddToCart` - When user adds item to cart
- `RemoveFromCart` - When user removes item
- `CheckoutStart` - User begins checkout
- `CheckoutComplete` - Order submitted successfully
- `FlavorSelected` - Flavor choice made
- `ToppingAdded` - Topping added to creation

## Viewing Data in Azure Portal

1. Navigate to Azure Portal → Application Insights resource
2. **Performance** → See page load times and AJAX calls
3. **Usage** → Page views, users, sessions
4. **Events** → Custom events you tracked
5. **Failures** → Exceptions and failed requests
6. **Live Metrics** → Real-time telemetry stream

## Local Development

Application Insights won't initialize in development if the connection string is missing. Check browser console for:
- ✅ `Application Insights initialized` - Working
- ⚠️ `Application Insights connection string not found` - Running without telemetry (expected in dev)

## Environment Variables

The connection string is automatically injected during build:
- `VITE_APPINSIGHTS_CONNECTION_STRING` - Set by GitHub Actions during deployment
