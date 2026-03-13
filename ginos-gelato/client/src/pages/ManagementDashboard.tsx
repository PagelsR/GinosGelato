import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    getQueueStats,
    getPeakHours,
    getHistoricalMetrics,
    exportOrdersCsv,
    updateOrderStatus,
} from '../services/api';
import type { QueueStats, PeakHourData, DailyMetrics, ActiveOrderInfo, OrderStatus } from '../types';

const STATUS_COLORS: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    InProgress: 'bg-blue-100 text-blue-800 border border-blue-300',
    Completed: 'bg-green-100 text-green-800 border border-green-300',
    Cancelled: 'bg-red-100 text-red-800 border border-red-300',
};

const AUTO_REFRESH_INTERVAL_MS = 30_000;

const STATUS_EMOJI: Record<string, string> = {
    Pending: '⏳',
    InProgress: '🍦',
    Completed: '✅',
    Cancelled: '❌',
};

const EXPORT_RANGE_OPTIONS = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
];

function formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
}

function PeakHoursChart({ data }: { data: PeakHourData[] }) {
    const maxCount = Math.max(...data.map(d => d.orderCount), 1);
    const businessHours = data.filter(d => d.hour >= 9 && d.hour <= 21);

    return (
        <div className="overflow-x-auto">
            <div className="flex items-end gap-1 h-40 min-w-[420px]">
                {businessHours.map(d => {
                    const heightPct = (d.orderCount / maxCount) * 100;
                    const isPeak = d.orderCount === maxCount && maxCount > 0;
                    return (
                        <div key={d.hour} className="flex flex-col items-center flex-1 group relative">
                            <div
                                className={`w-full rounded-t transition-all duration-300 cursor-default ${
                                    isPeak
                                        ? 'bg-gradient-to-t from-orange-500 to-yellow-400'
                                        : 'bg-gradient-to-t from-pink-400 to-pink-300'
                                } group-hover:opacity-80`}
                                style={{ height: `${Math.max(heightPct, d.orderCount > 0 ? 5 : 0)}%` }}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10">
                                <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                    {d.orderCount} orders
                                    {d.averageWaitMinutes > 0 && (
                                        <span className="ml-1">· {d.averageWaitMinutes}m avg</span>
                                    )}
                                </div>
                                <div className="w-2 h-2 bg-gray-800 rotate-45 -mt-1" />
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1 -rotate-45 origin-left whitespace-nowrap">
                                {formatHour(d.hour)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ActiveOrderRow({
    order,
    onStatusChange,
}: {
    order: ActiveOrderInfo;
    onStatusChange: (id: number, status: OrderStatus) => void;
}) {
    const statusClass = STATUS_COLORS[order.status] ?? '';

    return (
        <tr className="border-b hover:bg-pink-50 transition-colors">
            <td className="px-4 py-3 font-medium text-gray-700">#{order.orderId}</td>
            <td className="px-4 py-3">{order.customerName || '—'}</td>
            <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass}`}>
                    {STATUS_EMOJI[order.status]} {order.status}
                </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">{order.orderType}</td>
            <td className="px-4 py-3 text-sm font-mono">{order.elapsedMinutes} min</td>
            <td className="px-4 py-3 text-sm text-gray-600">{order.iceCreamCount} item(s)</td>
            <td className="px-4 py-3">
                <div className="flex gap-1">
                    {order.status === 'Pending' && (
                        <button
                            onClick={() => onStatusChange(order.orderId, 'InProgress')}
                            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                        >
                            Start
                        </button>
                    )}
                    {order.status === 'InProgress' && (
                        <button
                            onClick={() => onStatusChange(order.orderId, 'Completed')}
                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors"
                        >
                            Complete
                        </button>
                    )}
                    {(order.status === 'Pending' || order.status === 'InProgress') && (
                        <button
                            onClick={() => onStatusChange(order.orderId, 'Cancelled')}
                            className="text-xs bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

const ManagementDashboard: React.FC = () => {
    const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
    const [peakHours, setPeakHours] = useState<PeakHourData[]>([]);
    const [history, setHistory] = useState<DailyMetrics[]>([]);
    const [historyDays, setHistoryDays] = useState(30);
    const [peakDays, setPeakDays] = useState(7);
    const [exportDays, setExportDays] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const loadData = useCallback(async () => {
        try {
            setError(null);
            const [stats, peaks, hist] = await Promise.all([
                getQueueStats(),
                getPeakHours(peakDays),
                getHistoricalMetrics(historyDays),
            ]);
            setQueueStats(stats);
            setPeakHours(peaks);
            setHistory(hist);
            setLastRefresh(new Date());
        } catch {
            setError('Unable to load dashboard data. Is the backend running?');
        } finally {
            setLoading(false);
        }
    }, [peakDays, historyDays]);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, AUTO_REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [loadData]);

    const handleStatusChange = async (orderId: number, status: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, status);
            await loadData();
        } catch {
            setError('Failed to update order status.');
        }
    };

    const todayRevenue = useMemo(() => {
        const todayPrefix = new Date().toISOString().slice(0, 10);
        return history.find(d => d.date.startsWith(todayPrefix))?.totalRevenue ?? 0;
    }, [history]);

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportOrdersCsv(exportDays);
        } catch {
            setError('CSV export failed.');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="text-5xl animate-bounce mb-4">🍦</div>
                    <p className="text-gray-600 font-medium">Loading dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 p-4 md:p-8">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        📊 Management Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Last updated: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 30s
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={loadData}
                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm shadow-sm transition-colors"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* KPI Cards */}
            {queueStats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm p-5 border border-pink-100">
                        <p className="text-sm text-gray-500 mb-1">In Queue</p>
                        <p className="text-4xl font-bold text-pink-600">{queueStats.totalInQueue}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            {queueStats.pendingCount} pending · {queueStats.inProgressCount} in progress
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-5 border border-orange-100">
                        <p className="text-sm text-gray-500 mb-1">Avg Prep Time</p>
                        <p className="text-4xl font-bold text-orange-500">
                            {queueStats.averagePrepTimeMinutes}
                            <span className="text-lg font-normal ml-1">min</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Last 24 hours</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-5 border border-yellow-100">
                        <p className="text-sm text-gray-500 mb-1">Est. Wait (new)</p>
                        <p className="text-4xl font-bold text-yellow-600">
                            {queueStats.estimatedWaitMinutes}
                            <span className="text-lg font-normal ml-1">min</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Based on current queue</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-5 border border-green-100">
                        <p className="text-sm text-gray-500 mb-1">Today's Revenue</p>
                        <p className="text-4xl font-bold text-green-600">
                            ${todayRevenue.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Completed orders</p>
                    </div>
                </div>
            )}

            {/* Active Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">🍦 Active Order Queue</h2>
                    {queueStats && (
                        <span className="text-sm text-gray-500">
                            {queueStats.totalInQueue} order(s)
                        </span>
                    )}
                </div>
                {queueStats && queueStats.activeOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Order</th>
                                    <th className="px-4 py-3 text-left">Customer</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-left">Elapsed</th>
                                    <th className="px-4 py-3 text-left">Items</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queueStats.activeOrders.map(order => (
                                    <ActiveOrderRow
                                        key={order.orderId}
                                        order={order}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-10 text-center text-gray-400">
                        <div className="text-4xl mb-2">🎉</div>
                        <p>No active orders right now!</p>
                    </div>
                )}
            </div>

            {/* Peak Hours Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">📈 Peak Hours</h2>
                    <select
                        value={peakDays}
                        onChange={e => setPeakDays(Number(e.target.value))}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={14}>Last 14 days</option>
                        <option value={30}>Last 30 days</option>
                    </select>
                </div>
                {peakHours.length > 0 ? (
                    <PeakHoursChart data={peakHours} />
                ) : (
                    <p className="text-gray-400 text-center py-8">No data available yet.</p>
                )}
                <p className="text-xs text-gray-400 mt-3 text-center">
                    🟠 Peak hour highlighted in orange
                </p>
            </div>

            {/* Historical Metrics Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">📅 Historical Performance</h2>
                    <select
                        value={historyDays}
                        onChange={e => setHistoryDays(Number(e.target.value))}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                </div>
                {history.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-right">Total Orders</th>
                                    <th className="px-4 py-3 text-right">Completed</th>
                                    <th className="px-4 py-3 text-right">Avg Prep (min)</th>
                                    <th className="px-4 py-3 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(day => (
                                    <tr key={day.date} className="border-b hover:bg-pink-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-700">
                                            {new Date(day.date).toLocaleDateString(undefined, {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">{day.totalOrders}</td>
                                        <td className="px-4 py-3 text-right text-green-600">{day.completedOrders}</td>
                                        <td className="px-4 py-3 text-right">
                                            {day.averagePrepTimeMinutes > 0 ? `${day.averagePrepTimeMinutes}` : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-green-700">
                                            ${day.totalRevenue.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">No historical data available.</p>
                )}
            </div>

            {/* CSV Export */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">📤 Export Report</h2>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <select
                        value={exportDays}
                        onChange={e => setExportDays(Number(e.target.value))}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700"
                    >
                        {EXPORT_RANGE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                    >
                        {exporting ? '⏳ Exporting…' : '⬇️ Download CSV'}
                    </button>
                    <p className="text-xs text-gray-400">
                        Includes order ID, customer, status, prep time and revenue data.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ManagementDashboard;
