/**
 * Demo error simulation for Application Insights testing
 * 
 * DEMO MODE IS ON BY DEFAULT to showcase Application Insights error tracking!
 * 
 * To turn OFF demo mode (stop simulating errors):
 * localStorage.setItem('DEMO_ERRORS', 'false')
 */

export const isDemoMode = () => {
  // Default to true unless explicitly set to 'false'
  const setting = localStorage.getItem('DEMO_ERRORS');
  return setting !== 'false'; // Returns true by default, false only if explicitly disabled
};

export const shouldSimulateError = (errorRate: number = 0.05): boolean => {
  if (!isDemoMode()) return false;
  return Math.random() < errorRate;
};

export const simulateNetworkError = () => {
  const errors = [
    new Error('Network Error: Unable to reach backend API'),
    new Error('Connection refused: Backend service unavailable'),
    new Error('ERR_CONNECTION_REFUSED: Check if API server is running'),
  ];
  return errors[Math.floor(Math.random() * errors.length)];
};

export const simulateCorsError = () => {
  const error = new Error(
    'CORS policy: No Access-Control-Allow-Origin header is present on the requested resource'
  );
  error.name = 'CorsError';
  return error;
};

export const simulateTimeoutError = () => {
  const error = new Error('timeout of 30000ms exceeded');
  error.name = 'TimeoutError';
  return error;
};

export const simulateApiError = (statusCode: number = 500) => {
  const messages: Record<number, string> = {
    400: 'Bad Request: Invalid order data',
    404: 'Not Found: Resource does not exist',
    500: 'Internal Server Error: Database connection failed',
    503: 'Service Unavailable: API is temporarily down',
  };
  
  const error = new Error(messages[statusCode] || 'Unknown API Error');
  error.name = `ApiError${statusCode}`;
  return error;
};

/**
 * Enable demo mode in browser console:
 * Demo mode is ON by default!
 * 
 * To DISABLE demo mode (stop errors):
 * localStorage.setItem('DEMO_ERRORS', 'false')
 * 
 * To RE-ENABLE demo mode:
 * localStorage.removeItem('DEMO_ERRORS')
 * 
 * Check if enabled:
 * localStorage.getItem('DEMO_ERRORS')
 */
