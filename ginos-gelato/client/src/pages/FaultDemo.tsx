import React, { useEffect, useState } from 'react';
import { getActiveFault, DemoFault } from '../utils/demoFaults';
import { triggerSlowSql, triggerApiFailure } from '../services/api';
import { appInsights } from '../services/appInsights';

/**
 * Fault demo page. Drives the feature-flagged, deterministic demo faults so
 * failed-dependency and exception telemetry appear in Application Insights on
 * demand. Faults are DISABLED BY DEFAULT and only run when explicitly selected
 * via `?fault=` or the `DEMO_FAULT` localStorage flag.
 *
 * Selectable faults (independently runnable):
 *   /fault?fault=slow-sql
 *   /fault?fault=api-failure
 *   /fault?fault=browser-exception
 */
const FaultDemo: React.FC = () => {
    const [fault, setFault] = useState<DemoFault | null>(null);
    const [status, setStatus] = useState<string>('No fault selected. Faults are disabled by default.');
    const [state, setState] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');

    useEffect(() => {
        const active = getActiveFault();
        setFault(active);

        if (!active) {
            return;
        }

        let cancelled = false;

        const run = async () => {
            setState('running');
            setStatus(`Fault: ${active} — running`);
            appInsights.trackEvent({ name: 'DemoFaultStarted' }, { fault: active });

            if (active === 'slow-sql') {
                try {
                    const result = await triggerSlowSql();
                    if (cancelled) return;
                    setState('completed');
                    setStatus(`Fault: slow-sql — completed after ~${result.delaySeconds}s slow SQL dependency`);
                } catch (error) {
                    if (cancelled) return;
                    setState('failed');
                    setStatus(`Fault: slow-sql — error: ${(error as Error).message}`);
                }
                return;
            }

            if (active === 'api-failure') {
                try {
                    await triggerApiFailure();
                    if (cancelled) return;
                    setState('completed');
                    setStatus('Fault: api-failure — endpoint did not fail (faults disabled?)');
                } catch (error) {
                    if (cancelled) return;
                    // Expected: the API deliberately returned 503.
                    setState('failed');
                    setStatus(`Fault: api-failure — failed as expected (${(error as Error).message})`);
                }
                return;
            }

            if (active === 'browser-exception') {
                const error = new Error('Demo browser exception: deliberate unhandled client-side error.');
                error.name = 'DemoBrowserException';
                appInsights.trackException(
                    { exception: error },
                    { fault: 'browser-exception', demo: 'true' }
                );
                setState('completed');
                setStatus('Fault: browser-exception — thrown (see Application Insights exceptions)');
                // Rethrow asynchronously so it surfaces as an unhandled window
                // error and is auto-collected, without breaking React rendering.
                setTimeout(() => {
                    throw error;
                }, 0);
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-blue-50 px-6 py-12">
            <div className="container mx-auto max-w-3xl">
                <div className="gelato-card bg-white/90">
                    <h1 className="text-3xl md:text-4xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 mb-4">
                        🧪 Demo Fault Console
                    </h1>
                    <p className="text-gray-700 mb-4">
                        Deterministic, feature-flagged fault scenarios for Application Insights demos.
                        Faults are disabled by default and only run when explicitly selected.
                    </p>

                    <div
                        data-testid="fault-status"
                        data-fault={fault ?? 'none'}
                        data-state={state}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-800"
                    >
                        {status}
                    </div>

                    <div className="mt-6 space-y-2 text-sm text-gray-600">
                        <p className="font-semibold text-gray-800">Selectable faults:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><code>/fault?fault=slow-sql</code> — slow Azure SQL dependency</li>
                            <li><code>/fault?fault=api-failure</code> — failed API request (503)</li>
                            <li><code>/fault?fault=browser-exception</code> — unhandled browser exception</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaultDemo;
