import React, { useEffect, useState } from 'react';
import { useBookingStore } from '../stores/bookingStore';
import { holidayApi } from '../api';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
// import type { Holiday } from '../types';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { CalendarOff, Plus, Trash2, Calendar, X } from 'lucide-react';

export const HolidayManagementPage: React.FC = () => {
    const { holidays, loadHolidays } = useBookingStore();
    const [isLoading, setIsLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newReason, setNewReason] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const init = async () => {
            await loadHolidays();
            setIsLoading(false);
        };
        init();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDate || !newReason) return;
        setIsAdding(true);
        try {
            await holidayApi.add(newDate, newReason);
            toast.success('Holiday added');
            setNewDate('');
            setNewReason('');
            setShowAdd(false);
            await loadHolidays();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add holiday');
        }
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        try {
            await holidayApi.delete(id);
            toast.success('Holiday removed');
            await loadHolidays();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete holiday');
        }
    };

    const now = dayjs();
    const upcoming = holidays.filter((h) => dayjs(h.date).isAfter(now.subtract(1, 'day')));
    const past = holidays.filter((h) => dayjs(h.date).isBefore(now));

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CalendarOff className="text-primary-400" size={24} />
                        Holiday Management
                    </h1>
                    <p className="text-surface-400 text-sm mt-1">
                        Manage office holidays — bookings are blocked on holidays
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-sm hover:from-primary-500 hover:to-primary-400 transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20 self-start"
                >
                    {showAdd ? <X size={16} /> : <Plus size={16} />}
                    {showAdd ? 'Cancel' : 'Add Holiday'}
                </button>
            </div>

            {/* Add Holiday Form */}
            {showAdd && (
                <div className="glass-card p-6 slide-in-right">
                    <h3 className="text-lg font-semibold text-white mb-4">Add New Holiday</h3>
                    <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-surface-400 mb-1.5">Date</label>
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/60 border border-surface-700/50 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-sm [color-scheme:dark]"
                            />
                        </div>
                        <div className="flex-[2]">
                            <label className="block text-xs font-medium text-surface-400 mb-1.5">Reason</label>
                            <input
                                type="text"
                                value={newReason}
                                onChange={(e) => setNewReason(e.target.value)}
                                placeholder="e.g. Republic Day"
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/60 border border-surface-700/50 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-sm"
                            />
                        </div>
                        <div className="self-end">
                            <button
                                type="submit"
                                disabled={isAdding}
                                className="px-6 py-2.5 rounded-xl bg-success text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isAdding ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Add
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Upcoming Holidays */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-warning" />
                    Upcoming Holidays ({upcoming.length})
                </h2>

                {upcoming.length === 0 ? (
                    <EmptyState
                        icon={<CalendarOff size={48} />}
                        title="No upcoming holidays"
                        description="Add holidays to block bookings on those dates"
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {upcoming.map((holiday) => (
                            <div
                                key={holiday._id}
                                className="glass-card p-5 flex items-start justify-between gap-3 group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-warning/10 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-warning uppercase">
                                            {dayjs(holiday.date).format('MMM')}
                                        </span>
                                        <span className="text-lg font-bold text-white leading-none">
                                            {dayjs(holiday.date).format('D')}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{holiday.reason}</p>
                                        <p className="text-xs text-surface-500 mt-0.5">
                                            {dayjs(holiday.date).format('dddd, MMMM D, YYYY')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(holiday._id)}
                                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger/10 text-surface-500 hover:text-danger transition-all"
                                    title="Delete holiday"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Past Holidays */}
            {past.length > 0 && (
                <div className="opacity-60">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-surface-500" />
                        Past Holidays ({past.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {past.map((holiday) => (
                            <div key={holiday._id} className="glass-card p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-surface-700/50 flex flex-col items-center justify-center">
                                    <span className="text-[9px] font-bold text-surface-400 uppercase">
                                        {dayjs(holiday.date).format('MMM')}
                                    </span>
                                    <span className="text-sm font-bold text-surface-300 leading-none">
                                        {dayjs(holiday.date).format('D')}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-surface-300">{holiday.reason}</p>
                                    <p className="text-xs text-surface-600">{dayjs(holiday.date).format('ddd, MMM D, YYYY')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
