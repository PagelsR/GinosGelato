---
title: Azure Application Insights for Gino's Gelato
author: Randy Pagels
date: April 7, 2026
---

# Azure Application Insights

## Monitoring User Experience & Performance

---

## Agenda

- What is Application Insights?
- Setup & Configuration
- Error Monitoring Demo
- Operational Best Practices

---

# What is Application Insights?

---

## Azure Application Insights

**End-to-end application performance management (APM)**

- 📊 Real-time telemetry from frontend and backend
- 🔍 Automatic detection of performance issues
- 🚨 Proactive alerts when errors occur
- 📈 User behavior analytics
- 🔗 Distributed tracing across services

---

## What We Track

### Automatically Captured:
- **Page views & navigation** - Every time a user visits a page or navigates between routes
- **API calls & response times** - All HTTP requests to backend APIs with duration tracking
- **JavaScript errors & exceptions** - Unhandled errors in browser with full stack traces
- **User sessions & demographics** - Session duration, geographic location, user counts
- **Browser & device info** - Chrome/Safari/Edge, Windows/Mac/Mobile, screen resolution

### Custom Events:
- **Shopping cart actions** - Add to cart, remove items, clear cart with product details
- **Checkout flow completion** - Multi-step progress tracking from start to payment
- **Business metrics** - Order revenue, conversion rates, cart abandonment rates

---

# Setup & Configuration

---

## Step 1: Infrastructure (Bicep)

**Created Application Insights resources using Infrastructure as Code:**

**Key file:** `/iac/appInsights.bicep`

**What we deployed:**
- **Application Insights instance** - Main monitoring resource for collecting telemetry
- **Log Analytics Workspace** - 30-day data retention for logs and metrics
- **Alert rules & action groups** - Email notifications when errors exceed thresholds
- **Availability tests (ping tests)** - Automated health checks from 3 Azure regions every 5 minutes

**Integrated with existing infrastructure:**
- **Connected to App Service (backend)** - .NET API automatically instrumented for monitoring
- **Connected to Static Web App (frontend)** - React app sends browser telemetry
- **Automatic instrumentation via connection string** - No code changes needed for basic monitoring

---

## Step 2: Backend Integration

**App Service Configuration (Azure Portal & Bicep):**

**Environment variables automatically configured:**
- **APPLICATIONINSIGHTS_CONNECTION_STRING** - Securely connects API to Application Insights
- **ApplicationInsightsAgent_EXTENSION_VERSION = ~3** - Enables latest monitoring agent

**Automatic tracking (no code changes required):**
- **All HTTP requests** - Every API call to /api/flavors, /api/toppings, /api/orders
- **Database queries** - Entity Framework SQL queries with execution times
- **External dependencies** - HTTP calls to other services or APIs
- **Server-side exceptions** - ASP.NET Core unhandled exceptions with full details

**Benefit:** Backend monitoring configured without touching application code

---

## Step 3: Frontend Integration

**React App Setup (required packages):**

**NPM packages installed:**
- `@microsoft/applicationinsights-web` - Core JavaScript SDK for browser telemetry
- `@microsoft/applicationinsights-react-js` - React-specific routing and hooks

**Initialization code added:**
- Created `/src/services/appInsights.ts` to configure and initialize SDK
- Wrapped app with `AppInsightsContext.Provider` for React integration
- Called `appInsights.loadAppInsights()` on application startup

**Configuration in build pipeline:**
- **Connection string from Bicep deployment** - Output from infrastructure deployment
- **Injected as environment variable** - `VITE_APPINSIGHTS_CONNECTION_STRING` during build
- **Built into production bundle** - Becomes part of static JavaScript files deployed to Azure

**Result:** Frontend now sends telemetry from every user's browser to Application Insights

---

## Step 4: Custom Event Tracking

**Added telemetry throughout user journey (code modifications):**

**Builder page events:**
- **BuilderPageVisit** - User lands on ice cream builder page
- **ContainerSelected** - User chooses cone or cup with type captured
- **IceCreamCreated** - Creation completed with flavor count, topping count, and total price

**Shopping cart events:**
- **AddToCart** - Item added with container type, flavors, toppings, and item count
- **RemoveFromCart** - Item removed with updated cart count
- **ClearCart** - All items removed with count of items cleared

**Checkout flow events:**
- **CheckoutStarted** - User begins checkout with cart total and item count
- **CheckoutStepCompleted** - Each step (Customer Info, Delivery, Payment) tracked
- **DeliveryMethodSelected** - Pickup vs delivery choice with fee amount
- **OrderCompleted** - Successful order with order number, revenue, delivery type, tax, subtotal

**Business metric:**
- **OrderRevenue** - Custom metric for revenue reporting and trending analysis

---

## Step 5: Availability Tests

**Configured ping tests from 3 Azure regions for redundancy:**

**Test locations:** Virginia, Illinois, California

**Endpoints monitored:**
- **GET /api/flavors** - Tests every 5 minutes, expects HTTP 200 response
- **GET /api/toppings** - Tests every 5 minutes, expects HTTP 200 response
- **Frontend homepage** - Tests every 5 minutes, validates page content contains "Gino"

**Additional validations:**
- SSL certificate validity checked on every request
- Response time measured and logged
- SSL certificate expiration warning at 7 days

**Alerts configured automatically for:**
- **Response time > 3 seconds** - Indicates performance degradation
- **Availability < 95%** - 2 or more test locations failing
- **Failed requests** - HTTP errors or timeout responses

**Benefit:** Proactive monitoring ensures we know about issues before users report them

---

# Error Monitoring Demo

---

## Demo Mode Configuration

**Realistic error simulation enabled by default**

Errors occur occasionally, not constantly:

| Error Type | Rate | Frequency |
|------------|------|-----------|
| Network failures | 5% | ~1 in 20 |
| CORS issues | 3% | ~1 in 33 |
| Timeouts | 2% | ~1 in 50 |
| Payment errors | 2% | ~1 in 50 |

**Purpose:** Showcase Application Insights capabilities without disrupting demos

---

## Error Types Tracked

### 1. Network Errors (Most Common in Production)
**Error message:**
```
Error: Unable to reach backend API
Context: api='getFlavors'
```

**Real-world causes:** 
- Backend App Service stopped or restarting
- Firewall blocking requests
- DNS resolution failures
- Virtual network connectivity issues

**Impact:** Users cannot load ice cream flavors, page appears broken

---

## Error Types Tracked (cont.)

### 2. CORS Policy Errors
**Error message:**
```
Error: No Access-Control-Allow-Origin header
Context: api='getToppings'
```

**Real-world causes:** 
- Frontend domain not added to App Service CORS allowed origins
- Misconfigured CORS policy after deployment
- Using HTTP instead of HTTPS
- Wildcard CORS removed for security

**Impact:** API calls blocked by browser security, features don't work

### 3. Timeout Errors
**Error message:**
```
Error: timeout of 30000ms exceeded
Context: api='createOrder', orderTotal=$45.99
```

**Real-world causes:** 
- Database query taking too long (missing indexes)
- External payment gateway slow to respond
- App Service under heavy load (CPU/memory maxed)
- Network latency between services

**Impact:** Orders fail to submit, frustrated users abandon checkout

### 4. Payment Processing Errors
**Error message:**
```
Error: Payment gateway temporarily unavailable
Context: step='OrderProcessing'
```

**Real-world causes:** 
- Third-party payment service (Stripe, Square) experiencing outage
- Invalid API credentials or expired keys
- Rate limiting from payment provider
- Network issues reaching external service

**Impact:** Users cannot complete purchase, lost revenue

---

## Demo Controls

**Toggle Demo Mode:**

```javascript
// Disable error simulation
localStorage.setItem('DEMO_ERRORS', 'false')

// Re-enable (default)
localStorage.removeItem('DEMO_ERRORS')
```

All demo errors tagged with `demoMode: true` for easy filtering

---

# View Application Insights

---

## Azure Portal Navigation

**Application Insights → Overview**

1. Live Metrics - Real-time stream
2. Failures - Exception analysis
3. Performance - Response times
4. Usage - Page views & events
5. Availability - Ping test results
6. Logs - Query telemetry data

---

## Live Metrics Stream

**Real-time monitoring dashboard (updates every second):**

**Key metrics displayed:**
- **Incoming requests per second** - Current load on the application
- **Failed requests** - Errors happening right now
- **Server response time** - Average duration of API calls
- **CPU & memory usage** - Resource consumption on App Service
- **Live exceptions as they occur** - See errors the moment they happen

**Perfect for:** 
- Deployment validation - watch metrics during release
- Load testing - observe behavior under stress
- Incident response - diagnose issues in real-time
- Performance tuning - see immediate impact of changes

---

## Failures Dashboard

**Exception tracking & analysis:**

**What you can see:**
- **Exception count over time** - Trend chart showing error spikes by day/hour
- **Top failing operations** - Which API endpoints fail most frequently
- **Full stack traces** - Exact line of code where error occurred
- **Custom properties** - Business context like orderTotal, itemCount, userLocation
- **Filter capabilities** - By operation name, HTTP status code (404, 500), error type

**Example filters:**
- Show only 500 errors from `/api/orders` endpoint
- Filter to `demoMode = true` to exclude simulated errors
- See errors from specific geographic region
- View only errors affecting checkout flow

**Actions you can take:**
- Click exception to see full details and stack trace
- Group similar errors to find patterns
- Set up alerts when error count exceeds threshold
- Download data for offline analysis

---

## Custom Events

**Business intelligence from user behavior:**

**Queries you can run:**

1. **Most common containers:** 
   - Query: `customEvents | where name == "ContainerSelected"`
   - Insight: Are users preferring cones or cups? (affects inventory planning)

2. **Popular flavors:** 
   - Query: Track which flavors appear most in `IceCreamCreated` events
   - Insight: Which flavors to keep in stock, which to discontinue

3. **Cart abandonment rate:** 
   - Query: Count `CheckoutStarted` events without corresponding `OrderCompleted`
   - Insight: How many users start but don't finish checkout? Why?

4. **Revenue tracking:** 
   - Query: Sum `OrderRevenue` metric by day/week/month
   - Insight: Daily sales trends, seasonal patterns, growth metrics

5. **User flow analysis:** 
   - Query: Follow sequence `BuilderPageVisit` → `AddToCart` → `CheckoutStarted` → `OrderCompleted`
   - Insight: Where do users drop off? What's the conversion rate at each step?

**Business value:** Make data-driven decisions about product, pricing, and UX

---

## Availability Results

**Synthetic monitoring:**

- Uptime percentage per endpoint
- Response time trends
- Alert history
- Geographic test locations
- SSL certificate expiration warnings

**SLA tracking:** 99.9% uptime target

---

# Operational Best Practices

---

## 1. Triage & Prioritize Errors

**Error severity classification framework:**

- 🔴 **Critical (Fix immediately within 1 hour):** 
  - Payment processing failures (losing revenue)
  - Data loss or corruption (user data at risk)
  - Complete site outage (no one can access)

- 🟠 **High (Fix within 4-8 hours):** 
  - Major feature not working (shopping cart broken)
  - Widespread errors affecting >10% of users
  - Performance degradation (site very slow)

- 🟡 **Medium (Fix within 1-2 days):** 
  - Intermittent issues (works sometimes)
  - Minor feature degradation (toppings selector glitchy)
  - Affecting small user segment (<5%)

- 🟢 **Low (Fix in next sprint):** 
  - Edge cases (rare browser version)
  - Minor UI issues (button alignment)
  - Cosmetic problems (icon wrong color)

**Prioritization rule:** Focus on (High frequency × High impact) errors first before rare edge cases

---

## 2. Investigate Root Cause

**Use Application Insights tools to diagnose:**

**Investigation steps:**

1. **End-to-end transaction view** 
   - See complete request flow from browser → frontend → API → database
   - Identify which component is slow or failing
   - Example: Request took 5 seconds, 4.8s was database query

2. **Dependencies tab** 
   - Identify slow external calls to databases, APIs, storage
   - See which dependencies fail most often
   - Example: Payment gateway timing out 20% of the time

3. **Custom properties** 
   - Get business context about the error
   - Example: Error only happens on orders >$100 or with 3+ items
   - Filter by user location, device type, browser version

4. **Stack traces** 
   - See exact code file and line number where error occurred
   - Jump directly to problematic code in your repository
   - Example: NullReferenceException at OrderController.cs line 42

5. **Time correlation** 
   - Group related failures that happened at same time
   - Identify if error was part of larger incident
   - Example: All errors started after deployment at 2:15 PM

**Example diagnosis:** CORS errors → Check App Service CORS configuration → Add missing allowed origin

---

## 3. Fix & Validate

**Development workflow for resolving issues:**

**Step-by-step process:**

1. **Reproduce error locally** 
   - Use demo mode to trigger error on-demand
   - Or set up local environment matching production conditions
   - Confirm you can see the error happening

2. **Implement fix** 
   - Write code to resolve root cause
   - Add unit tests to prevent regression
   - Update error handling if needed

3. **Deploy to staging environment** 
   - Test fix in non-production Azure environment first
   - Run automated tests and manual validation
   - Ensure fix doesn't introduce new issues

4. **Monitor Application Insights for 24-48 hours** 
   - Watch Failures dashboard for error rate
   - Check if error still appears or has decreased
   - Look for any new errors introduced by fix

5. **Verify error rate decreased to acceptable level** 
   - Compare before/after error counts
   - Ensure <1% failure rate or within SLA
   - Get stakeholder approval if needed

6. **Deploy to production with confidence** 
   - Roll out during low-traffic window if possible
   - Have rollback plan ready
   - Monitor Live Metrics during deployment

**Validation metrics to check:**
- Error rate dropped from 5% to <1%
- No new related exceptions appeared
- Response time and performance metrics stable
- User-reported issues resolved

---

## 4. Set Up Proactive Alerts

**Configure alert rules to get notified before users complain:**

**Recommended alert rules:**
- **Error rate > threshold** - Alert when >5% of requests fail (indicates widespread issue)
- **Response time > 3 seconds** - Performance degradation alerting (user experience suffers)
- **Availability < 99%** - Ping tests failing (site may be down in some regions)
- **Custom metric thresholds** - Business-specific like revenue drops suddenly

**Action groups (how you get notified):**
- **Email notifications** - Send to ops-team@company.com distribution list
- **SMS alerts** - Text message to on-call engineer for critical issues
- **Webhook integrations** - Post to Microsoft Teams channel or Slack #alerts
- **Azure Logic Apps** - Trigger automated workflows like creating incident ticket

**Example alert configuration:**
```
Rule: "High Error Rate"
Condition: Failed requests > 50 in last 5 minutes
Severity: High (2)
Action: Email ops team + Post to Teams #incidents channel
```

**Best practice:** Start with a few critical alerts, expand over time as you learn normal patterns

---

## 5. Regular Review Cadence

**Establish monitoring routine at different intervals:**

**Daily monitoring (10-15 minutes each morning):**
- Check Live Metrics for current health status
- Review any critical alerts that fired overnight
- Scan Failures dashboard for new error patterns

**Weekly review (30-45 minutes in team meeting):** 
- **Review failure trends** - Are errors increasing or decreasing over past 7 days?
- **Analyze top errors** - What are the 3 most frequent failures? Do we have plans to fix?
- **Check availability results** - Did we meet our 99.9% uptime SLA?
- **Review custom events** - Any concerning user behavior patterns (high cart abandonment)?

**Monthly analysis (1-2 hours with full team):**
- **Performance baselines** - Establish what "normal" looks like for response times
- **Capacity planning** - Based on traffic trends, do we need to scale up?
- **Cost optimization** - Review Application Insights data ingestion costs, adjust sampling
- **Update alert thresholds** - Based on learned patterns, tune sensitivity of alerts

**Quarterly business review:**
- Revenue trends from OrderRevenue metric
- User growth and retention patterns
- ROI of monitoring investment

**Key principle:** Continuous improvement through consistent monitoring and learning from data

---

## Common Error Patterns

### Network Failures
**Symptoms:** "Unable to reach backend API", "Connection refused", "ERR_CONNECTION_REFUSED"

**How to fix:**
- **Step 1:** Verify App Service is running in Azure Portal (not stopped/restarting)
- **Step 2:** Check DNS resolution - can you ping the domain?
- **Step 3:** Test connectivity from your machine using curl or Postman
- **Step 4:** Review NSG (Network Security Group) rules if using VNet
- **Step 5:** Check App Service logs for startup errors

### CORS Errors
**Symptoms:** "No Access-Control-Allow-Origin header", blocked by browser, works in Postman but not browser

**How to fix:**
- **Step 1:** Go to Azure Portal → App Service → CORS settings
- **Step 2:** Add Static Web App URL to allowed origins list
- **Step 3:** Ensure using correct protocol (https:// not http://)
- **Step 4:** Update Bicep file `appService.bicep` CORS configuration
- **Step 5:** Redeploy infrastructure to persist changes

### Timeouts
**Symptoms:** "timeout of 30000ms exceeded", slow responses, requests eventually fail

**How to fix:**
- **Step 1:** Use Application Insights to identify slow database queries (check Dependencies tab)
- **Step 2:** Add missing database indexes on frequently queried columns
- **Step 3:** Implement caching for commonly requested data (Redis Cache)
- **Step 4:** Scale up App Service to higher tier if CPU/memory maxed
- **Step 5:** Optimize N+1 query patterns in code

### Dependency Failures
**Symptoms:** External API calls failing, third-party service errors, intermittent failures

**How to fix:**
- **Step 1:** Implement retry logic with exponential backoff for transient failures
- **Step 2:** Add circuit breaker pattern to "fail fast" when service is down
- **Step 3:** Implement fallback behavior (cached data, degraded mode)
- **Step 4:** Set up separate monitoring for external dependencies
- **Step 5:** Consider alternative providers or redundancy

---

## Performance Optimization

**Application Insights reveals bottlenecks:**

**What the data shows you:**

1. **Slowest API endpoints** 
   - Example: `GET /api/orders` averaging 2.5 seconds (too slow)
   - Drill into Dependencies to see database query taking 2.4s
   - Fix: Add index on Orders.CustomerId column

2. **Most expensive database queries** 
   - Example: Loading all orders instead of paginated results
   - N+1 query pattern loading related entities one at a time
   - Fix: Use eager loading with `.Include()` or implement GraphQL

3. **Large payload responses** 
   - Example: Returning full product catalog (500KB JSON) when only need names
   - Sending unnecessary fields in API response
   - Fix: Implement pagination and field selection

4. **Client-side rendering bottlenecks** 
   - Example: React component re-rendering 50 times per user action
   - Large JavaScript bundle size (>1MB) causing slow initial load
   - Fix: Use React.memo(), code splitting, lazy loading

**Actions to take based on insights:**
- **Add response caching** - Cache GET /api/flavors for 1 hour (rarely changes)
- **Optimize queries with indexes** - 10x speed improvement on complex queries
- **Implement pagination** - Return 20 items at a time instead of thousands
- **Use CDN for static assets** - Serve images/CSS from edge locations globally

**Result:** Faster app = better user experience = higher conversion rates

---

## Cost Management

**Application Insights pricing model:**

**How billing works:**
- **Based on data ingestion per GB** - You pay for telemetry data sent to Application Insights
- **Default: 5 GB/month free tier** - Good for small apps, included with Azure subscription
- **Overage pricing: ~$2.30 per GB** - After free 5GB, charges apply
- **Data retention: 90 days included** - Older data archived at lower cost

**Cost optimization best practices:**

1. **Enable sampling for high-volume applications**
   - 90% sampling = keep 10% of telemetry = 10% of cost
   - Still get statistically significant insights
   - Example: 50GB/month → sample at 10% → 5GB/month (free tier!)
   - Configure in `appInsights.ts` or Portal

2. **Set daily cap to prevent overruns**
   - Portal → Application Insights → Usage and estimated costs
   - Set cap at $10/day or 5GB/day
   - Prevents surprises from sudden traffic spike

3. **Archive older data to cheaper storage**
   - Export telemetry to Azure Storage (Blob)
   - Storage cost: ~$0.02/GB vs $2.30/GB in App Insights
   - Keep last 30 days hot, archive older for compliance

4. **Filter unnecessary telemetry**
   - Exclude health check pings (if you have monitoring probes)
   - Remove verbose trace logging from production
   - Don't log personally identifiable information (PII)

**Cost vs value trade-off:** $50/month for monitoring is cheap insurance compared to lost revenue from undetected production issues

---

# Key Takeaways

---

## Benefits Delivered

✅ **Visibility into production** 
   - Know exactly what users experience in real-time
   - See errors the moment they occur, not days later from support tickets
   - Understand user behavior patterns with actual data

✅ **Proactive issue detection** 
   - Catch issues before users report them via automated availability tests
   - Get notified immediately when errors spike or performance degrades
   - Fix problems during business hours instead of 3 AM emergencies

✅ **Data-driven decision making** 
   - Make product decisions based on actual usage, not assumptions
   - Identify which features users love (high engagement) vs ignore
   - Optimize based on real performance bottlenecks, not guesses

✅ **Business metrics tracking** 
   - Track revenue, conversion rates, cart abandonment in real-time
   - Correlate technical issues with business impact (error = lost sales)
   - Report to stakeholders with concrete numbers

✅ **DevOps integration ready** 
   - Integrates seamlessly with GitHub Actions CI/CD pipeline
   - Automates monitoring setup via Infrastructure as Code
   - No manual configuration needed for new deployments

---

## Next Steps

**Immediate actions to take:**

1. **Review errors daily (10 minutes)** 
   - Open Failures dashboard every morning
   - Triage new errors and assign to team members
   - Track resolution progress

2. **Set up critical alerts (1 hour)** 
   - Configure email notifications for error rate >5%
   - Set up Teams/Slack integration for incident channel
   - Test alerts to ensure they work

3. **Track business KPIs (ongoing)** 
   - Create custom dashboard with OrderRevenue, conversion rate
   - Set goals and track progress weekly
   - Share metrics with stakeholders

4. **Optimize performance (monthly)** 
   - Review slowest endpoints and fix top 3
   - Use data to prioritize engineering work
   - Measure improvement after changes

5. **Expand monitoring coverage (quarterly)** 
   - Add more custom events for new features
   - Instrument additional user journeys
   - Implement more sophisticated alerting rules

---

## Resources

**Documentation:**
- [Application Insights Overview](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Gino's Gelato Setup Guide](APPINSIGHTS.md)

**Our Implementation:**
- Infrastructure: `/iac/appInsights.bicep`
- Frontend: `/ginos-gelato/client/src/services/appInsights.ts`
- Custom Events: Search codebase for `trackEvent`

---

# Questions?

## Thank You!

**Gino's Gelato - Azure Application Insights Demo**

randy.pagels@xebia.com
