import React, { useEffect, useState } from 'react';
import { bookingApi } from '../api';
import { CardSkeleton } from '../components/ui/Skeleton';
import type { Analytics } from '../types';
import dayjs from 'dayjs';
import {
    BarChart3,
    TrendingUp,
    Users,
    Armchair,
    AlertTriangle,
    Download,
    Calendar,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from 'recharts';

// const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#84cc16'];

export const AdminAnalyticsPage: React.FC = () => {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    });

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await bookingApi.getAnalytics(dateRange.startDate, dateRange.endDate);
            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Failed to load analytics', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadAnalytics();
    }, [dateRange]);

    const exportCSV = () => {
        if (!analytics) return;
        const csvRows = [
            ['Squad', 'Total Bookings', 'Designated', 'Buffer', 'Temp Buffer'],
            ...analytics.squadWise.map((s) => [
                `Squad ${s._id}`,
                s.totalBookings,
                s.designatedBookings,
                s.bufferBookings,
                s.tempBufferBookings,
            ]),
        ];
        const csv = csvRows.map((row) => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${dateRange.startDate}_${dateRange.endDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (!analytics) return null;

    const squadData = analytics.squadWise.map((s) => ({
        name: `S${s._id}`,
        designated: s.designatedBookings,
        buffer: s.bufferBookings,
        tempBuffer: s.tempBufferBookings,
        total: s.totalBookings,
    }));

    const occupancyData = analytics.dailyOccupancy.map((d) => ({
        date: dayjs(d._id).format('MMM D'),
        total: d.totalBookings,
        designated: d.designatedBookings,
        buffer: d.bufferBookings,
    }));

    const pieData = [
        { name: 'Designated', value: analytics.totalBooked - analytics.bufferUsed, color: '#6366f1' },
        { name: 'Buffer', value: analytics.bufferUsed, color: '#f59e0b' },
        { name: 'Released', value: analytics.totalReleased, color: '#ef4444' },
    ].filter((d) => d.value > 0);

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BarChart3 className="text-primary-400" size={24} />
                        Analytics Dashboard
                    </h1>
                    <p className="text-surface-400 text-sm mt-1">Occupancy and booking insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="glass-card flex items-center gap-2 p-1.5">
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                            className="bg-transparent text-white text-sm px-2 py-1 focus:outline-none [color-scheme:dark]"
                        />
                        <span className="text-surface-500 text-xs">to</span>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                            className="bg-transparent text-white text-sm px-2 py-1 focus:outline-none [color-scheme:dark]"
                        />
                    </div>
                    <button
                        onClick={exportCSV}
                        className="px-4 py-2 rounded-xl bg-surface-700/50 hover:bg-surface-700 text-surface-300 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 count-up">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Occupancy</p>
                            <p className="text-3xl font-bold text-white mt-2">{analytics.occupancyPercent}%</p>
                            <p className="text-xs text-surface-500 mt-1">
                                {analytics.totalSeats} total seats
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
                            <TrendingUp className="text-primary-400" size={20} />
                        </div>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-700"
                            style={{ width: `${Math.min(analytics.occupancyPercent, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="glass-card p-5 count-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Buffer Usage</p>
                            <p className="text-3xl font-bold text-white mt-2">{analytics.bufferUsagePercent}%</p>
                            <p className="text-xs text-surface-500 mt-1">
                                {analytics.bufferUsed} of {analytics.bufferSeats} buffer seats
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
                            <Armchair className="text-warning" size={20} />
                        </div>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-700"
                            style={{ width: `${Math.min(analytics.bufferUsagePercent, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="glass-card p-5 count-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Total Bookings</p>
                            <p className="text-3xl font-bold text-white mt-2">{analytics.totalBooked}</p>
                            <p className="text-xs text-surface-500 mt-1">In selected period</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                            <Calendar className="text-success" size={20} />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-5 count-up" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Released / No-Show</p>
                            <p className="text-3xl font-bold text-white mt-2">{analytics.noShowCount}</p>
                            <p className="text-xs text-surface-500 mt-1">
                                Seats released
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-danger/15 flex items-center justify-center">
                            <AlertTriangle className="text-danger" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Squad-wise Bookings */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Users size={18} className="text-primary-400" />
                        Squad-wise Bookings
                    </h3>
                    {squadData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={squadData} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(148,163,184,0.2)',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                    }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend />
                                <Bar dataKey="designated" fill="#6366f1" radius={[4, 4, 0, 0]} name="Designated" />
                                <Bar dataKey="buffer" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Buffer" />
                                <Bar dataKey="tempBuffer" fill="#f97316" radius={[4, 4, 0, 0]} name="Temp Buffer" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-surface-500 text-center py-8 text-sm">No data for selected period</p>
                    )}
                </div>

                {/* Booking Distribution Pie */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-primary-400" />
                        Booking Distribution
                    </h3>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(148,163,184,0.2)',
                                        borderRadius: '12px',
                                    }}
                                />
                                <Legend
                                    formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-surface-500 text-center py-8 text-sm">No data for selected period</p>
                    )}
                </div>

                {/* Daily Occupancy Trend */}
                <div className="glass-card p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart3 size={18} className="text-primary-400" />
                        Daily Occupancy Trend
                    </h3>
                    {occupancyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={occupancyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(148,163,184,0.2)',
                                        borderRadius: '12px',
                                    }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#6366f1"
                                    strokeWidth={2.5}
                                    dot={{ fill: '#6366f1', r: 3 }}
                                    name="Total"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="designated"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ fill: '#10b981', r: 3 }}
                                    name="Designated"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="buffer"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    dot={{ fill: '#f59e0b', r: 3 }}
                                    name="Buffer"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-surface-500 text-center py-8 text-sm">No data for selected period</p>
                    )}
                </div>
            </div>
        </div>
    );
};
