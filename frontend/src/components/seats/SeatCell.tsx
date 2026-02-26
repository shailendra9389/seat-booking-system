import React from 'react';
import type { SeatAvailability } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import clsx from 'clsx';

interface SeatCellProps {
    seat: SeatAvailability;
    onSelect: (seat: SeatAvailability) => void;
    selectedSeatId?: string;
}

export const SeatCell: React.FC<SeatCellProps> = ({ seat, onSelect, selectedSeatId }) => {
    const { user } = useAuthStore();

    const isMyBooking =
        seat.booking &&
        typeof seat.booking.userId === 'object' &&
        seat.booking.userId._id === user?._id;

    const isMySquad = seat.squadId === user?.squadId;
    const isSelected = selectedSeatId === seat._id;

    const getStatusColor = () => {
        if (isSelected) return 'ring-2 ring-primary-400 ring-offset-2 ring-offset-surface-900';
        if (isMyBooking) return 'bg-seat-mine shadow-lg shadow-blue-500/30';
        if (seat.status === 'booked') return 'bg-seat-booked opacity-80';
        if (seat.status === 'temp_buffer') return 'bg-seat-temp-buffer';
        if (seat.status === 'buffer') return 'bg-seat-buffer';
        if (seat.status === 'available') return 'bg-seat-available seat-available';
        return 'bg-seat-disabled opacity-50';
    };

    const getTooltip = () => {
        const parts = [seat.seatNumber];
        if (seat.type === 'designated' && seat.squadId) parts.push(`Squad ${seat.squadId}`);
        if (seat.type === 'buffer') parts.push('Buffer');
        if (isMyBooking) parts.push('(Your Seat)');
        else if (seat.status === 'booked' && seat.booking) {
            const bookedUser = typeof seat.booking.userId === 'object' ? seat.booking.userId.name : '';
            if (bookedUser) parts.push(`Booked by ${bookedUser}`);
        }
        if (seat.status === 'available') parts.push('Available');
        if (seat.status === 'temp_buffer') parts.push('Temp Buffer (Released)');
        return parts.join(' · ');
    };

    const isClickable = ['available', 'buffer', 'temp_buffer'].includes(seat.status) && !isMyBooking;

    return (
        <button
            onClick={() => isClickable && onSelect(seat)}
            disabled={!isClickable}
            title={getTooltip()}
            className={clsx(
                'seat-cell relative w-11 h-11 rounded-lg flex items-center justify-center text-[10px] font-bold text-white',
                getStatusColor(),
                isClickable ? 'cursor-pointer' : 'cursor-default',
                isMySquad && seat.status !== 'booked' && 'border-2 border-primary-300/30'
            )}
        >
            <span className="relative z-10">{seat.seatNumber.split('-')[1]}</span>
            {isMyBooking && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-blue-500" />
            )}
        </button>
    );
};
