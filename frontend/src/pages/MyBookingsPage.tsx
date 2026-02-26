import React, { useEffect } from 'react';
import { useBookingStore } from '../stores/bookingStore';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import {
    BookOpen,
    Armchair,
    Calendar,
    X,
    RotateCcw,
    CheckCircle,
    AlertCircle,
    Clock,
} from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
    const { myBookings, loadMyBookings, releaseBooking, cancelBooking, isLoading, bookingsTotal } =
        useBookingStore();

    useEffect(() => {
        loadMyBookings();
    }, []);

    const handleRelease = async (id: string) => {
        try {
            await releaseBooking(id);
            toast.success('Seat released. It is now available as a temporary buffer.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to release booking');
        }
    };

    const handleCancel = async (id: string) => {
        try {
            await cancelBooking(id);
            toast.success('Booking cancelled');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const now = dayjs();
    const upcoming = myBookings.filter(
        (b) => b.status === 'booked' && dayjs(b.date).isAfter(now.startOf('day').subtract(1, 'day'))
    );
    const past = myBookings.filter(
        (b) => b.status !== 'booked' || dayjs(b.date).isBefore(now.startOf('day'))
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'booked':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success">
                        <CheckCircle size={10} />
                        Booked
                    </span>
                );
            case 'released':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning/15 text-warning">
                        <RotateCcw size={10} />
                        Released
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-danger/15 text-danger">
                        <X size={10} />
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-600 text-surface-300">
                        <AlertCircle size={10} />
                        {status}
                    </span>
                );
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'designated':
                return (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400">
                        Designated
                    </span>
                );
            case 'buffer':
                return (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-500/15 text-yellow-400">
                        Buffer
                    </span>
                );
            case 'temp_buffer':
                return (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/15 text-orange-400">
                        Temp Buffer
                    </span>
                );
            default:
                return null;
        }
    };

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
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="text-primary-400" size={24} />
                    My Bookings
                </h1>
                <p className="text-surface-400 text-sm mt-1">
                    Manage your seat reservations · {bookingsTotal} total
                </p>
            </div>

            {/* Upcoming Bookings */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-success" />
                    Upcoming ({upcoming.length})
                </h2>

                {upcoming.length === 0 ? (
                    <EmptyState
                        icon={<Armchair size={48} />}
                        title="No upcoming bookings"
                        description="Head to the Seat Layout to book your next seat"
                    />
                ) : (
                    <div className="space-y-3">
                        {upcoming.map((booking) => {
                            const seat = typeof booking.seatId === 'object' ? booking.seatId : null;
                            const bookingDate = dayjs(booking.date);
                            const isFuture = bookingDate.isAfter(now);

                            return (
                                <div
                                    key={booking._id}
                                    className="glass-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 slide-in-right"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
                                            <span className="text-primary-400 font-bold text-lg">
                                                {seat?.seatNumber || '?'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-white font-semibold">
                                                    {bookingDate.format('dddd, MMM D, YYYY')}
                                                </p>
                                                {getStatusBadge(booking.status)}
                                                {getTypeBadge(booking.type)}
                                            </div>
                                            <p className="text-xs text-surface-500 mt-1">
                                                Booked on {dayjs(booking.createdAt).format('MMM D, h:mm A')}
                                                {seat?.squadId && ` · Squad ${seat.squadId}`}
                                            </p>
                                        </div>
                                    </div>
                                    {booking.status === 'booked' && isFuture && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => handleRelease(booking._id)}
                                                className="px-4 py-2 rounded-xl bg-warning/10 text-warning text-sm font-medium hover:bg-warning/20 transition-colors flex items-center gap-1.5"
                                            >
                                                <RotateCcw size={14} />
                                                Release
                                            </button>
                                            <button
                                                onClick={() => handleCancel(booking._id)}
                                                className="px-4 py-2 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors flex items-center gap-1.5"
                                            >
                                                <X size={14} />
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Past Bookings */}
            {past.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 opacity-75">
                        <Calendar size={18} className="text-surface-400" />
                        Past & Completed ({past.length})
                    </h2>
                    <div className="space-y-2 opacity-75">
                        {past.map((booking) => {
                            const seat = typeof booking.seatId === 'object' ? booking.seatId : null;
                            return (
                                <div
                                    key={booking._id}
                                    className="glass-card p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-surface-700/50 flex items-center justify-center text-surface-400 text-sm font-bold">
                                            {seat?.seatNumber?.split('-')[1] || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm text-surface-300">
                                                {dayjs(booking.date).format('ddd, MMM D, YYYY')}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {getStatusBadge(booking.status)}
                                                {getTypeBadge(booking.type)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
