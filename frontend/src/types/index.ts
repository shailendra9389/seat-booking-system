export interface User {
    _id: string;
    name: string;
    email: string;
    squadId: number;
    batchId: number;
    role: 'admin' | 'user';
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface Seat {
    _id: string;
    seatNumber: string;
    type: 'designated' | 'buffer';
    squadId: number | null;
    row: number;
    column: number;
    floor: number;
    isActive: boolean;
}

export interface SeatAvailability extends Seat {
    status: 'available' | 'booked' | 'buffer' | 'temp_buffer';
    booking: {
        _id: string;
        userId: User;
        type: string;
        status: string;
    } | null;
    batchForDay: number | null;
}

export interface Booking {
    _id: string;
    userId: User | string;
    seatId: Seat | string;
    date: string;
    type: 'designated' | 'buffer' | 'temp_buffer';
    status: 'booked' | 'released' | 'cancelled' | 'expired';
    createdAt: string;
    updatedAt: string;
}

export interface Holiday {
    _id: string;
    date: string;
    reason: string;
}

export interface BatchSchedule {
    date: string;
    dayOfWeek: string;
    batch: number | null;
}

export interface BatchInfo {
    batch1: {
        id: number;
        squads: number[];
        defaultDays: string[];
    };
    batch2: {
        id: number;
        squads: number[];
        defaultDays: string[];
    };
    rotationRule: string;
    currentWeek: number;
    isRotationWeek: boolean;
}

export interface WeeklyBooking {
    date: string;
    dayOfWeek: string;
    batchScheduled: number | null;
    bookings: Booking[];
    totalBooked: number;
}

export interface Analytics {
    totalSeats: number;
    designatedSeats: number;
    bufferSeats: number;
    totalBooked: number;
    totalReleased: number;
    bufferUsed: number;
    occupancyPercent: number;
    bufferUsagePercent: number;
    noShowCount: number;
    squadWise: SquadStat[];
    dailyOccupancy: DailyOccupancy[];
}

export interface SquadStat {
    _id: number;
    totalBookings: number;
    designatedBookings: number;
    bufferBookings: number;
    tempBufferBookings: number;
}

export interface DailyOccupancy {
    _id: string;
    totalBookings: number;
    designatedBookings: number;
    bufferBookings: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface SquadInfo {
    squadId: number;
    batchId: number;
    memberCount: number;
    seatCount: number;
}
