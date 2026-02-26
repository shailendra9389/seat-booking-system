import api from './client';
import type { ApiResponse, AuthResponse, User, Seat, SeatAvailability, Booking, Holiday, BatchSchedule, BatchInfo, WeeklyBooking, Analytics, SquadInfo } from '../types';

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

    register: (data: { name: string; email: string; password: string; squadId: number; batchId: number; role?: string }) =>
        api.post<ApiResponse<AuthResponse>>('/auth/register', data),

    getProfile: () =>
        api.get<ApiResponse<{ user: User }>>('/auth/profile'),

    logout: () =>
        api.post('/auth/logout'),

    refreshToken: (refreshToken: string) =>
        api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh-token', { refreshToken }),
};

// Seat API
export const seatApi = {
    getAll: () =>
        api.get<ApiResponse<{ seats: Seat[] }>>('/seats'),

    getAvailability: (date: string) =>
        api.get<ApiResponse<{ seats: SeatAvailability[] }>>(`/seats/availability?date=${date}`),

    getBySquad: (squadId: number) =>
        api.get<ApiResponse<{ seats: Seat[] }>>(`/seats/squad/${squadId}`),

    getBuffer: () =>
        api.get<ApiResponse<{ seats: Seat[] }>>('/seats/buffer'),
};

// Booking API
export const bookingApi = {
    create: (data: { seatId: string; date: string; type: string }) =>
        api.post<ApiResponse<{ booking: Booking }>>('/bookings', data),

    getMyBookings: (page = 1, limit = 20) =>
        api.get<ApiResponse<{ bookings: Booking[]; total: number }>>(`/bookings/my?page=${page}&limit=${limit}`),

    getByDate: (date: string) =>
        api.get<ApiResponse<{ bookings: Booking[] }>>(`/bookings/date?date=${date}`),

    getWeekly: (weekStart?: string) =>
        api.get<ApiResponse<{ weekly: WeeklyBooking[] }>>(`/bookings/weekly${weekStart ? `?weekStart=${weekStart}` : ''}`),

    release: (id: string) =>
        api.patch<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/release`),

    cancel: (id: string) =>
        api.patch<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/cancel`),

    getAnalytics: (startDate: string, endDate: string) =>
        api.get<ApiResponse<Analytics>>(`/bookings/analytics?startDate=${startDate}&endDate=${endDate}`),
};

// Holiday API
export const holidayApi = {
    getAll: () =>
        api.get<ApiResponse<{ holidays: Holiday[] }>>('/holidays'),

    add: (date: string, reason: string) =>
        api.post<ApiResponse<{ holiday: Holiday }>>('/holidays', { date, reason }),

    delete: (id: string) =>
        api.delete(`/holidays/${id}`),

    check: (date: string) =>
        api.get<ApiResponse<{ isHoliday: boolean }>>(`/holidays/check?date=${date}`),
};

// Batch API
export const batchApi = {
    getSchedule: (weekStart?: string) =>
        api.get<ApiResponse<{ schedule: BatchSchedule[]; currentWeek: number; isRotationWeek: boolean }>>(`/batches/schedule${weekStart ? `?weekStart=${weekStart}` : ''}`),

    getInfo: () =>
        api.get<ApiResponse<BatchInfo>>('/batches/info'),
};

// Squad API
export const squadApi = {
    getAll: () =>
        api.get<ApiResponse<{ squads: SquadInfo[] }>>('/squads'),

    getById: (id: number) =>
        api.get<ApiResponse<{ squadId: number; batchId: number; members: User[]; seats: Seat[] }>>(`/squads/${id}`),
};

// User API
export const userApi = {
    getAll: (page = 1, limit = 20) =>
        api.get<ApiResponse<{ users: User[]; total: number }>>(`/users?page=${page}&limit=${limit}`),

    getBySquad: (squadId: number) =>
        api.get<ApiResponse<{ users: User[] }>>(`/users/squad/${squadId}`),
};
