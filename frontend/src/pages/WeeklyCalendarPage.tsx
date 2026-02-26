import React, { useEffect, useState } from 'react';
import { useBookingStore } from '../stores/bookingStore';
import { useAuthStore } from '../stores/authStore';
import { CardSkeleton } from '../components/ui/Skeleton';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Calendar, ChevronLeft, ChevronRight, ArrowRightLeft, Users } from 'lucide-react';

dayjs.extend(isoWeek);

export const WeeklyCalendarPage: React.FC = () => {
    const { user } = useAuthStore();
    const {
        weeklyBookings,
        loadWeeklyBookings,
        loadBatchSchedule,
        isRotationWeek,
        isLoading,
    } = useBookingStore();

    const [weekOffset, setWeekOffset] = useState(0);

    useEffect(() => {
        const weekStart = dayjs().startOf('isoWeek').add(weekOffset, 'week').format('YYYY-MM-DD');
        loadWeeklyBookings(weekStart);
        loadBatchSchedule(weekStart);
    }, [weekOffset]);

    const handleWeekChange = (offset: number) => {
        setWeekOffset((prev) => prev + offset);
    };

    const startOfWeek = dayjs().startOf('isoWeek').add(weekOffset, 'week');
    const endOfWeek = startOfWeek.add(4, 'day');

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Calendar className="text-primary-400" size={24} />
                        Weekly Calendar
                    </h1>
                    <p className="text-surface-400 text-sm mt-1">
                        Overview of bookings for the week
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isRotationWeek && weekOffset === 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/15 text-warning text-xs font-semibold">
                            <ArrowRightLeft size={14} />
                            Rotation Week
                        </span>
                    )}
                </div>
            </div>

            {/* Week Navigation */}
            <div className="glass-card flex items-center justify-between p-3">
                <button
                    onClick={() => handleWeekChange(-1)}
                    className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <p className="text-white font-semibold">
                        {startOfWeek.format('MMM D')} — {endOfWeek.format('MMM D, YYYY')}
                    </p>
                    <p className="text-surface-500 text-xs">
                        Week {startOfWeek.isoWeek()}
                        {weekOffset === 0 && ' (Current)'}
                    </p>
                </div>
                <button
                    onClick={() => handleWeekChange(1)}
                    className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-white transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {weekOffset !== 0 && (
                <button
                    onClick={() => setWeekOffset(0)}
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                    ← Back to current week
                </button>
            )}

            {/* Calendar Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {weeklyBookings.map((day) => {
                        const isToday = day.date === dayjs().format('YYYY-MM-DD');
                        const isPast = dayjs(day.date).isBefore(dayjs().startOf('day'));
                        const isBatchDay = day.batchScheduled === user?.batchId;

                        return (
                            <div
                                key={day.date}
                                className={`glass-card overflow-hidden transition-all duration-200 ${isToday ? 'ring-2 ring-primary-500/40' : ''
                                    } ${isPast ? 'opacity-60' : ''}`}
                            >
                                {/* Day Header */}
                                <div
                                    className={`p-4 border-b border-surface-700/30 ${isToday ? 'bg-primary-500/10' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-surface-400 uppercase">
                                            {day.dayOfWeek}
                                        </span>
                                        {isToday && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary-500 text-white">
                                                TODAY
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-lg font-bold text-white">
                                        {dayjs(day.date).format('MMM D')}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${day.batchScheduled === 1
                                                ? 'bg-emerald-500/15 text-emerald-400'
                                                : day.batchScheduled === 2
                                                    ? 'bg-cyan-500/15 text-cyan-400'
                                                    : 'bg-surface-700 text-surface-400'
                                                }`}
                                        >
                                            {day.batchScheduled ? `Batch ${day.batchScheduled}` : 'Off'}
                                        </span>
                                        {isBatchDay && (
                                            <span className="text-[10px] text-success">Your day</span>
                                        )}
                                    </div>
                                </div>

                                {/* Bookings */}
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users size={14} className="text-surface-500" />
                                        <span className="text-xs text-surface-400">
                                            <span className="text-white font-semibold">{day.totalBooked}</span> seats booked
                                        </span>
                                    </div>

                                    {day.bookings.length > 0 ? (
                                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                            {day.bookings.slice(0, 8).map((booking) => {
                                                const bookingUser = typeof booking.userId === 'object' ? booking.userId : null;
                                                const seat = typeof booking.seatId === 'object' ? booking.seatId : null;
                                                const isMe = bookingUser?._id === user?._id;

                                                return (
                                                    <div
                                                        key={booking._id}
                                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${isMe
                                                            ? 'bg-blue-500/10 border border-blue-500/20'
                                                            : 'bg-surface-800/40'
                                                            }`}
                                                    >
                                                        <div
                                                            className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${booking.type === 'designated'
                                                                ? 'bg-blue-500/20 text-blue-400'
                                                                : 'bg-yellow-500/20 text-yellow-400'
                                                                }`}
                                                        >
                                                            {seat?.seatNumber?.split('-')[1] || '?'}
                                                        </div>
                                                        <span className={`truncate ${isMe ? 'text-blue-300 font-medium' : 'text-surface-400'}`}>
                                                            {isMe ? 'You' : bookingUser?.name?.split(' ')[0] || 'User'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                            {day.bookings.length > 8 && (
                                                <p className="text-[10px] text-surface-500 text-center py-1">
                                                    +{day.bookings.length - 8} more
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-surface-600 text-center py-3">No bookings</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
