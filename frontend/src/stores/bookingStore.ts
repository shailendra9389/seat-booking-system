import { create } from 'zustand';
import { seatApi, bookingApi, batchApi, holidayApi } from '../api';
import type { SeatAvailability, Booking, WeeklyBooking, BatchSchedule, Holiday } from '../types';
import dayjs from 'dayjs';

interface BookingState {
    seats: SeatAvailability[];
    myBookings: Booking[];
    weeklyBookings: WeeklyBooking[];
    batchSchedule: BatchSchedule[];
    holidays: Holiday[];
    selectedDate: string;
    currentWeek: number;
    isRotationWeek: boolean;
    isLoading: boolean;
    bookingsTotal: number;

    setSelectedDate: (date: string) => void;
    loadSeats: (date: string) => Promise<void>;
    loadMyBookings: (page?: number) => Promise<void>;
    loadWeeklyBookings: (weekStart?: string) => Promise<void>;
    loadBatchSchedule: (weekStart?: string) => Promise<void>;
    loadHolidays: () => Promise<void>;
    createBooking: (seatId: string, date: string, type: string) => Promise<void>;
    releaseBooking: (id: string) => Promise<void>;
    cancelBooking: (id: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
    seats: [],
    myBookings: [],
    weeklyBookings: [],
    batchSchedule: [],
    holidays: [],
    selectedDate: dayjs().format('YYYY-MM-DD'),
    currentWeek: 0,
    isRotationWeek: false,
    isLoading: false,
    bookingsTotal: 0,

    setSelectedDate: (date: string) => set({ selectedDate: date }),

    loadSeats: async (date: string) => {
        set({ isLoading: true });
        try {
            const response = await seatApi.getAvailability(date);
            set({ seats: response.data.data.seats, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    loadMyBookings: async (page = 1) => {
        set({ isLoading: true });
        try {
            const response = await bookingApi.getMyBookings(page);
            set({
                myBookings: response.data.data.bookings,
                bookingsTotal: response.data.data.total,
                isLoading: false,
            });
        } catch {
            set({ isLoading: false });
        }
    },

    loadWeeklyBookings: async (weekStart?: string) => {
        set({ isLoading: true });
        try {
            const response = await bookingApi.getWeekly(weekStart);
            set({ weeklyBookings: response.data.data.weekly, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    loadBatchSchedule: async (weekStart?: string) => {
        try {
            const response = await batchApi.getSchedule(weekStart);
            set({
                batchSchedule: response.data.data.schedule,
                currentWeek: response.data.data.currentWeek,
                isRotationWeek: response.data.data.isRotationWeek,
            });
        } catch { }
    },

    loadHolidays: async () => {
        try {
            const response = await holidayApi.getAll();
            set({ holidays: response.data.data.holidays });
        } catch { }
    },

    createBooking: async (seatId: string, date: string, type: string) => {
        await bookingApi.create({ seatId, date, type });
        // Refresh seat data
        await get().loadSeats(date);
        await get().loadMyBookings();
    },

    releaseBooking: async (id: string) => {
        await bookingApi.release(id);
        await get().loadMyBookings();
        await get().loadSeats(get().selectedDate);
    },

    cancelBooking: async (id: string) => {
        await bookingApi.cancel(id);
        await get().loadMyBookings();
        await get().loadSeats(get().selectedDate);
    },
}));
