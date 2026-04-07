import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

/**
 * Custom hook for tracking events, metrics, and exceptions in Application Insights
 * 
 * @example
 * const { trackEvent, trackException } = useAppInsights();
 * 
 * // Track a custom event
 * trackEvent('AddToCart', { flavor: 'Chocolate', topping: 'Sprinkles' });
 * 
 * // Track an exception
 * try {
 *   // some code
 * } catch (error) {
 *   trackException(error, { context: 'CheckoutPage' });
 * }
 */
export const useAppInsights = () => {
  const appInsights = useAppInsightsContext();

  const trackEvent = (name: string, properties?: Record<string, any>) => {
    if (appInsights) {
      appInsights.trackEvent({ name }, properties || {});
    }
  };

  const trackException = (error: Error, properties?: Record<string, any>) => {
    if (appInsights) {
      appInsights.trackException({ exception: error }, properties || {});
    }
  };

  const trackMetric = (name: string, value: number, properties?: Record<string, any>) => {
    if (appInsights) {
      appInsights.trackMetric({ name, average: value }, properties || {});
    }
  };

  const trackTrace = (message: string, properties?: Record<string, any>) => {
    if (appInsights) {
      appInsights.trackTrace({ message }, properties || {});
    }
  };

  return {
    trackEvent,
    trackException,
    trackMetric,
    trackTrace,
  };
};
