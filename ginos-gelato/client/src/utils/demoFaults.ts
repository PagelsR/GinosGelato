/**
 * Deterministic, feature-flagged demo faults for Application Insights demos.
 *
 * Faults are DISABLED BY DEFAULT. A fault only activates when it is explicitly
 * selected via the `?fault=` query string or the `DEMO_FAULT` localStorage key,
 * so normal customer journeys never trigger fault telemetry.
 *
 * Selection (independently selectable, deterministic):
 *   /fault?fault=slow-sql           -> slow Azure SQL dependency
 *   /fault?fault=api-failure        -> failed API request (503)
 *   /fault?fault=browser-exception  -> unhandled browser exception
 *
 * Or, from the browser console:
 *   localStorage.setItem('DEMO_FAULT', 'slow-sql')
 *   localStorage.removeItem('DEMO_FAULT')   // disable
 */

export type DemoFault = 'slow-sql' | 'api-failure' | 'browser-exception';

export const DEMO_FAULTS: readonly DemoFault[] = [
  'slow-sql',
  'api-failure',
  'browser-exception',
] as const;

const STORAGE_KEY = 'DEMO_FAULT';

const isDemoFault = (value: string | null): value is DemoFault =>
  value !== null && (DEMO_FAULTS as readonly string[]).includes(value);

/**
 * Returns the currently selected demo fault, or null when faults are disabled.
 * The `?fault=` query string takes precedence over the localStorage flag.
 */
export const getActiveFault = (
  search: string = typeof window !== 'undefined' ? window.location.search : ''
): DemoFault | null => {
  const fromQuery = new URLSearchParams(search).get('fault');
  if (isDemoFault(fromQuery)) {
    return fromQuery;
  }

  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (isDemoFault(fromStorage)) {
      return fromStorage;
    }
  } catch {
    // localStorage may be unavailable; treat as disabled.
  }

  return null;
};
