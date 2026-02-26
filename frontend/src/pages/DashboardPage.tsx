import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useBookingStore } from '../stores/bookingStore';
import { useCountdown } from '../hooks/useCountdown';
import { CardSkeleton } from '../components/ui/Skeleton';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import {
    Users,
    Calendar,
    Clock,
    Armchair,
    ArrowRightLeft,
    BookOpen,
    Timer,
} from 'lucide-react';

dayjs.extend(isoWeek);

export const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const {
        batchSchedule,
        isRotationWeek,
        currentWeek,
        myBookings,
        loadBatchSchedule,
        loadMyBookings,
        loadHolidays,
        holidays,
    } = useBookingStore();
    const { timeLeft, isUnlocked } = useCountdown(15);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await Promise.all([
                loadBatchSchedule(),
                loadMyBookings(),
                loadHolidays(),
            ]);
            setLoading(false);
        };
        init();
    }, []);

    const today = dayjs();
    const todayStr = today.format('YYYY-MM-DD');
    const todaySchedule = batchSchedule.find((s) => s.date === todayStr);
    const isMyBatchDay = todaySchedule?.batch === user?.batchId;

    const upcomingBookings = myBookings.filter(
        (b) => b.status === 'booked' && dayjs(b.date).isAfter(today.startOf('day').subtract(1, 'day'))
    );

    const upcomingHolidays = holidays.filter((h) =>
        dayjs(h.date).isAfter(today.subtract(1, 'day'))
    ).slice(0, 3);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">
                        Good {today.hour() < 12 ? 'morning' : today.hour() < 17 ? 'afternoon' : 'evening'},{' '}
                        <span className="bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                            {user?.name?.split(' ')[0]}
                        </span>
                    </h1>
                    <p className="text-surface-400 mt-1 text-sm">
                        {today.format('dddd, MMMM D, YYYY')} · Week {currentWeek}
                        {isRotationWeek && (
                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/15 text-warning text-xs font-medium">
                                <ArrowRightLeft size={12} />
                                Rotation Week
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Batch Info */}
                <div className="glass-card p-5 count-up">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Your Batch</p>
                            <p className="text-3xl font-bold text-white mt-2">Batch {user?.batchId}</p>
                            <p className="text-xs text-surface-500 mt-1">Squad {user?.squadId}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
                            <Users className="text-primary-400" size={20} />
                        </div>
                    </div>
                </div>

                {/* Today's Status */}
                <div className="glass-card p-5 count-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Today</p>
                            <p className={`text-lg font-bold mt-2 ${isMyBatchDay ? 'text-success' : 'text-warning'}`}>
                                {isMyBatchDay ? 'Your Batch Day' : 'Off-Batch Day'}
                            </p>
                            <p className="text-xs text-surface-500 mt-1">
                                {todaySchedule ? `Batch ${todaySchedule.batch} scheduled` : 'No schedule'}
                            </p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMyBatchDay ? 'bg-success/15' : 'bg-warning/15'}`}>
                            <Calendar className={isMyBatchDay ? 'text-success' : 'text-warning'} size={20} />
                        </div>
                    </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="glass-card p-5 count-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Upcoming</p>
                            <p className="text-3xl font-bold text-white mt-2">{upcomingBookings.length}</p>
                            <p className="text-xs text-surface-500 mt-1">Active bookings</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center">
                            <BookOpen className="text-info" size={20} />
                        </div>
                    </div>
                </div>

                {/* Buffer Timer */}
                <div className="glass-card p-5 count-up" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Buffer Status</p>
                            <p className={`text-sm font-bold mt-2 ${isUnlocked ? 'text-success' : 'text-warning'}`}>
                                {timeLeft}
                            </p>
                            <p className="text-xs text-surface-500 mt-1">
                                {isUnlocked ? 'Book buffer seats now' : 'Opens at 3:00 PM'}
                            </p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUnlocked ? 'bg-success/15' : 'bg-warning/15'}`}>
                            <Timer className={isUnlocked ? 'text-success' : 'text-warning'} size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Schedule */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-primary-400" />
                        This Week's Schedule
                    </h2>
                    <div className="space-y-2">
                        {batchSchedule.map((day) => {
                            const isToday = day.date === todayStr;
                            const isPast = dayjs(day.date).isBefore(today.startOf('day'));
                            const isBatchDay = day.batch === user?.batchId;

                            return (
                                <div
                                    key={day.date}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${isToday
                                        ? 'bg-primary-500/10 border border-primary-500/20'
                                        : isPast
                                            ? 'opacity-50'
                                            : 'bg-surface-800/30 border border-surface-700/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm font-semibold w-8 ${isToday ? 'text-primary-400' : 'text-surface-400'}`}>
                                            {dayjs(day.date).format('dd')}
                                        </span>
                                        <span className={`text-sm ${isToday ? 'text-white font-medium' : 'text-surface-300'}`}>
                                            {dayjs(day.date).format('MMM D')}
                                        </span>
                                        {isToday && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary-500 text-white uppercase">
                                                Today
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${day.batch === 1
                                                ? 'bg-emerald-500/15 text-emerald-400'
                                                : day.batch === 2
                                                    ? 'bg-cyan-500/15 text-cyan-400'
                                                    : 'bg-surface-700 text-surface-400'
                                                }`}
                                        >
                                            {day.batch ? `Batch ${day.batch}` : 'Off'}
                                        </span>
                                        {isBatchDay && (
                                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Holidays & Quick Actions */}
                <div className="space-y-6">
                    {/* Recent Bookings */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Armchair size={18} className="text-primary-400" />
                            Your Upcoming Bookings
                        </h2>
                        {upcomingBookings.length === 0 ? (
                            <p className="text-surface-500 text-sm py-4 text-center">No upcoming bookings</p>
                        ) : (
                            <div className="space-y-2">
                                {upcomingBookings.slice(0, 5).map((booking) => {
                                    const seat = typeof booking.seatId === 'object' ? booking.seatId : null;
                                    return (
                                        <div
                                            key={booking._id}
                                            className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30 border border-surface-700/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${booking.type === 'designated'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : booking.type === 'buffer'
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : 'bg-orange-500/20 text-orange-400'
                                                        }`}
                                                >
                                                    {seat?.seatNumber?.split('-')[1] || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-surface-200 font-medium">
                                                        {seat?.seatNumber || 'Seat'}
                                                    </p>
                                                    <p className="text-xs text-surface-500">{booking.type}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-surface-400">
                                                {dayjs(booking.date).format('MMM D')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Holidays */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-warning" />
                            Upcoming Holidays
                        </h2>
                        {upcomingHolidays.length === 0 ? (
                            <p className="text-surface-500 text-sm py-4 text-center">No upcoming holidays</p>
                        ) : (
                            <div className="space-y-2">
                                {upcomingHolidays.map((holiday) => (
                                    <div
                                        key={holiday._id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30 border border-surface-700/20"
                                    >
                                        <span className="text-sm text-surface-300">{holiday.reason}</span>
                                        <span className="text-xs text-surface-500 font-mono">
                                            {dayjs(holiday.date).format('MMM D')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
