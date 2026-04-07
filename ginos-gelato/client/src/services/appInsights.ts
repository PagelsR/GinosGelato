import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

// React plugin for route change tracking
const reactPlugin = new ReactPlugin();

// Get connection string from environment variable (set during build)
const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;

// Initialize Application Insights
const appInsights = new ApplicationInsights({
  config: {
    connectionString: connectionString,
    enableAutoRouteTracking: true, // Automatically track route changes
    enableCorsCorrelation: true, // Track dependencies across CORS boundaries
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    enableAjaxPerfTracking: true,
    maxAjaxCallsPerView: 500,
    disableFetchTracking: false,
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: {
        // Optional: React plugin configuration
      }
    }
  }
});

// Only initialize if connection string is available
if (connectionString) {
  appInsights.loadAppInsights();
  appInsights.trackPageView(); // Track initial page view
  
  console.log('✅ Application Insights initialized');
} else {
  console.warn('⚠️ Application Insights connection string not found. Running without telemetry.');
}

// Check and log demo mode status
import('../utils/demoErrors').then(({ isDemoMode }) => {
  if (isDemoMode()) {
    console.log('🎭 DEMO MODE: ON - Simulated errors will appear in Application Insights');
    console.log('💡 To disable: localStorage.setItem("DEMO_ERRORS", "false")');
  }
});

export { appInsights, reactPlugin };
