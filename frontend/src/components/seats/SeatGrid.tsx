import React, { useMemo } from 'react';
import type { SeatAvailability } from '../../types';
import { SeatCell } from './SeatCell';
import { SeatSkeleton } from '../ui/Skeleton';

interface SeatGridProps {
    seats: SeatAvailability[];
    isLoading: boolean;
    onSeatSelect: (seat: SeatAvailability) => void;
    selectedSeatId?: string;
}

export const SeatGrid: React.FC<SeatGridProps> = ({
    seats,
    isLoading,
    onSeatSelect,
    selectedSeatId,
}) => {
    const { designatedSeats, bufferSeats } = useMemo(() => {
        const designated = seats.filter((s) => s.type === 'designated');
        const buffer = seats.filter((s) => s.type === 'buffer');
        return { designatedSeats: designated, bufferSeats: buffer };
    }, [seats]);

    if (isLoading) return <SeatSkeleton />;

    // Group designated seats by row
    const rows: Record<number, SeatAvailability[]> = {};
    designatedSeats.forEach((seat) => {
        if (!rows[seat.row]) rows[seat.row] = [];
        rows[seat.row].push(seat);
    });

    // Sort columns within each row
    Object.values(rows).forEach((row) => row.sort((a, b) => a.column - b.column));

    const squadColors: Record<number, string> = {
        1: 'border-emerald-500/30',
        2: 'border-cyan-500/30',
        3: 'border-violet-500/30',
        4: 'border-amber-500/30',
        5: 'border-rose-500/30',
        6: 'border-teal-500/30',
        7: 'border-indigo-500/30',
        8: 'border-orange-500/30',
        9: 'border-pink-500/30',
        10: 'border-lime-500/30',
    };

    return (
        <div className="space-y-6">
            {/* Office Floor Plan */}
            <div className="glass-card p-6 overflow-x-auto">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-2 rounded-full bg-primary-400" />
                    <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
                        Office Floor Plan — Designated Seats
                    </h3>
                </div>

                <div className="space-y-2 min-w-fit">
                    {Object.entries(rows)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([rowNum, rowSeats]) => {
                            // Group by squad for visual separation
                            const squads: Record<number, SeatAvailability[]> = {};
                            rowSeats.forEach((s) => {
                                const sq = s.squadId || 0;
                                if (!squads[sq]) squads[sq] = [];
                                squads[sq].push(s);
                            });

                            return (
                                <div key={rowNum} className="flex items-center gap-1">
                                    <span className="text-[10px] text-surface-500 w-8 text-right mr-2 font-mono">
                                        R{rowNum}
                                    </span>
                                    <div className="flex gap-1 flex-wrap">
                                        {Object.entries(squads).map(([squadId, squadSeats]) => (
                                            <div
                                                key={squadId}
                                                className={`flex gap-1 px-1.5 py-1 rounded-lg border ${squadColors[Number(squadId)] || 'border-surface-700'
                                                    } bg-surface-800/30`}
                                            >
                                                {squadSeats.map((seat) => (
                                                    <SeatCell
                                                        key={seat._id}
                                                        seat={seat}
                                                        onSelect={onSeatSelect}
                                                        selectedSeatId={selectedSeatId}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-surface-600 ml-2">
                                        {Object.keys(squads).map((sq) => `S${sq}`).join(' / ')}
                                    </span>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* Buffer Seats */}
            {bufferSeats.length > 0 && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-2 h-2 rounded-full bg-warning" />
                        <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
                            Buffer Seats
                        </h3>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {bufferSeats.map((seat) => (
                            <SeatCell
                                key={seat._id}
                                seat={seat}
                                onSelect={onSeatSelect}
                                selectedSeatId={selectedSeatId}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap gap-4 justify-center text-xs text-surface-400">
                    {[
                        { color: 'bg-seat-available', label: 'Available' },
                        { color: 'bg-seat-booked', label: 'Booked' },
                        { color: 'bg-seat-mine', label: 'My Seat' },
                        { color: 'bg-seat-buffer', label: 'Buffer' },
                        { color: 'bg-seat-temp-buffer', label: 'Temp Buffer' },
                        { color: 'bg-seat-disabled', label: 'Disabled' },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded ${item.color}`} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
