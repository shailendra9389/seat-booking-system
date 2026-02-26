import React, { useEffect, useState } from 'react';
import { useBookingStore } from '../stores/bookingStore';
import { useAuthStore } from '../stores/authStore';
import { SeatGrid } from '../components/seats/SeatGrid';
import { useCountdown } from '../hooks/useCountdown';
import type { SeatAvailability } from '../types';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import toast from 'react-hot-toast';

dayjs.extend(isoWeek);
import {
    ChevronLeft,
    ChevronRight,
    Armchair,
    Info,
    X,
    CheckCircle,
    ArrowRightLeft,
    Timer,
} from 'lucide-react';

export const SeatLayoutPage: React.FC = () => {
    const { user } = useAuthStore();
    const {
        seats,
        selectedDate,
        setSelectedDate,
        loadSeats,
        createBooking,
        batchSchedule,
        isRotationWeek,
        loadBatchSchedule,
        isLoading,
    } = useBookingStore();

    const [selectedSeat, setSelectedSeat] = useState<SeatAvailability | null>(null);
    const [booking, setBooking] = useState(false);
    const { timeLeft, isUnlocked } = useCountdown(15);

    useEffect(() => {
        loadSeats(selectedDate);
        // Load batch schedule for the selected date's week, not current week
        const weekStart = dayjs(selectedDate).startOf('isoWeek').format('YYYY-MM-DD');
        loadBatchSchedule(weekStart);
    }, [selectedDate]);

    const handleDateChange = (offset: number) => {
        const newDate = dayjs(selectedDate).add(offset, 'day');
        const dayOfWeek = newDate.day();
        // Skip weekends
        if (dayOfWeek === 0) {
            setSelectedDate(newDate.add(offset > 0 ? 1 : -2, 'day').format('YYYY-MM-DD'));
        } else if (dayOfWeek === 6) {
            setSelectedDate(newDate.add(offset > 0 ? 2 : -1, 'day').format('YYYY-MM-DD'));
        } else {
            setSelectedDate(newDate.format('YYYY-MM-DD'));
        }
    };

    const todaySchedule = batchSchedule.find((s) => s.date === selectedDate);
    const batchForDay = todaySchedule?.batch;
    const isMyBatchDay = batchForDay === user?.batchId;

    const handleSeatSelect = (seat: SeatAvailability) => {
        setSelectedSeat(seat);
    };

    const handleBook = async () => {
        if (!selectedSeat) return;
        setBooking(true);

        let type: string;
        if (selectedSeat.type === 'designated' && isMyBatchDay) {
            // Your batch day + your squad's designated seat → designated booking
            type = 'designated';
        } else if (selectedSeat.type === 'designated' && !isMyBatchDay) {
            // Designated seat on a non-batch day → not allowed directly
            toast.error('You can only book designated seats on your batch day. Use buffer seats for off-batch days.');
            setBooking(false);
            return;
        } else if (selectedSeat.status === 'temp_buffer') {
            // Released designated seat available as temp buffer
            type = 'temp_buffer';
        } else if (selectedSeat.type === 'buffer') {
            // Buffer seat
            type = 'buffer';
        } else {
            type = 'buffer';
        }

        try {
            await createBooking(selectedSeat._id, selectedDate, type);
            toast.success('Seat booked successfully!');
            setSelectedSeat(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to book seat');
        } finally {
            setBooking(false);
        }
    };

    const today = dayjs().format('YYYY-MM-DD');
    const isPast = dayjs(selectedDate).isBefore(dayjs().startOf('day'));

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Armchair className="text-primary-400" size={24} />
                        Seat Layout
                    </h1>
                    <p className="text-surface-400 text-sm mt-1">
                        Select a date and click on an available seat to book
                    </p>
                </div>

                {isRotationWeek && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/15 text-warning text-xs font-semibold">
                        <ArrowRightLeft size={14} />
                        Rotation Week — Batches Swapped
                    </span>
                )}
            </div>

            {/* Date Picker & Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="glass-card flex items-center gap-1 p-1.5">
                    <button
                        onClick={() => handleDateChange(-1)}
                        className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent text-white font-medium text-sm px-3 py-1 focus:outline-none [color-scheme:dark]"
                    />
                    <button
                        onClick={() => handleDateChange(1)}
                        className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-white transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                    {selectedDate !== today && (
                        <button
                            onClick={() => setSelectedDate(today)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-primary-500/15 text-primary-400 hover:bg-primary-500/25 font-medium transition-colors"
                        >
                            Today
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {batchForDay && (
                        <span
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${batchForDay === 1
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-cyan-500/15 text-cyan-400'
                                }`}
                        >
                            Batch {batchForDay} Day
                        </span>
                    )}
                    {isMyBatchDay !== undefined && (
                        <span
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${isMyBatchDay
                                ? 'bg-success/15 text-success'
                                : 'bg-warning/15 text-warning'
                                }`}
                        >
                            {isMyBatchDay ? '✓ Your batch day' : '○ Off-batch day'}
                        </span>
                    )}
                    {!isMyBatchDay && (
                        <div className="flex items-center gap-1.5 text-xs text-surface-400">
                            <Timer size={14} className={isUnlocked ? 'text-success' : 'text-warning'} />
                            <span className={isUnlocked ? 'text-success font-semibold' : ''}>
                                {timeLeft}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {isPast && (
                <div className="glass-card p-4 border-l-4 border-warning flex items-center gap-3">
                    <Info size={18} className="text-warning shrink-0" />
                    <p className="text-sm text-surface-300">You are viewing a past date. Bookings cannot be made for past dates.</p>
                </div>
            )}

            {/* Seat Grid */}
            <SeatGrid
                seats={seats}
                isLoading={isLoading}
                onSeatSelect={handleSeatSelect}
                selectedSeatId={selectedSeat?._id}
            />

            {/* Booking Confirmation Panel */}
            {selectedSeat && !isPast && (
                <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 p-4 slide-in-right">
                    <div className="glass-card p-5 max-w-2xl mx-auto shadow-2xl border-t-2 border-primary-500/50">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                                    {selectedSeat.seatNumber}
                                </div>
                                <div>
                                    <p className="text-white font-semibold">
                                        Book {selectedSeat.seatNumber}
                                    </p>
                                    <p className="text-xs text-surface-400">
                                        {selectedSeat.type === 'buffer' ? 'Buffer Seat' :
                                            selectedSeat.status === 'temp_buffer' ? 'Temp Buffer (Released Seat)' :
                                                `Squad ${selectedSeat.squadId} — Designated`}
                                        {' · '}
                                        {dayjs(selectedDate).format('ddd, MMM D')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedSeat(null)}
                                    className="p-2 rounded-xl bg-surface-700/50 hover:bg-surface-700 text-surface-400 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                                <button
                                    onClick={handleBook}
                                    disabled={booking}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-sm hover:from-primary-500 hover:to-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20"
                                >
                                    {booking ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle size={16} />
                                            Confirm Booking
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
