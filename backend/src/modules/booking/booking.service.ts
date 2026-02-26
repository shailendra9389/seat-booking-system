import mongoose from 'mongoose';
import { BookingRepository } from './booking.repository';
import { BookingStrategyFactory, BookingStrategyType } from '../../core/strategies/bookingFactory';
import { IUser } from '../user/user.model';
import { IBooking } from './booking.model';
import { SeatRepository } from '../seat/seat.repository';
import { normalizeDate, dayjs, getWeekDates, getBatchForDay } from '../../core/utils/dateUtils';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../core/utils/errors';
import { Seat } from '../seat/seat.model';
import { Booking } from './booking.model';

const bookingRepository = new BookingRepository();
const seatRepository = new SeatRepository();

export class BookingService {
    async createBooking(
        user: IUser,
        seatId: string,
        date: string,
        type: BookingStrategyType
    ): Promise<any> {
        const normalizedDate = normalizeDate(date);
        const strategy = BookingStrategyFactory.getStrategy(type);

        // Validate first (outside transaction)
        await strategy.validate({
            user,
            seatId,
            date: normalizedDate,
        });

        // Execute within transaction for concurrency control
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const result = await strategy.execute({
                user,
                seatId,
                date: normalizedDate,
                session,
            });

            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async releaseBooking(user: IUser, bookingId: string): Promise<IBooking> {
        const booking = await bookingRepository.findById(bookingId);

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        if (booking.userId._id.toString() !== user._id.toString() && user.role !== 'admin') {
            throw new ForbiddenError('You can only release your own bookings');
        }

        if (booking.status !== 'booked') {
            throw new BadRequestError('Only active bookings can be released');
        }

        const bookingDate = dayjs(booking.date);
        if (bookingDate.isBefore(dayjs().startOf('day'))) {
            throw new BadRequestError('Cannot release past bookings');
        }

        const released = await bookingRepository.releaseBooking(bookingId);
        if (!released) {
            throw new BadRequestError('Failed to release booking');
        }

        return released;
    }

    async cancelBooking(user: IUser, bookingId: string): Promise<IBooking> {
        const booking = await bookingRepository.findById(bookingId);

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        if (booking.userId._id.toString() !== user._id.toString() && user.role !== 'admin') {
            throw new ForbiddenError('You can only cancel your own bookings');
        }

        if (booking.status !== 'booked') {
            throw new BadRequestError('Only active bookings can be cancelled');
        }

        const cancelled = await bookingRepository.cancelBooking(bookingId);
        if (!cancelled) {
            throw new BadRequestError('Failed to cancel booking');
        }

        return cancelled;
    }

    async getUserBookings(userId: string, page = 1, limit = 20) {
        return bookingRepository.findByUserId(userId, page, limit);
    }

    async getBookingsByDate(date: string) {
        const normalizedDate = normalizeDate(date);
        return bookingRepository.findByDate(normalizedDate);
    }

    async getWeeklyBookings(weekStart?: string) {
        const dates = getWeekDates(weekStart);
        const startDate = dates[0].startOf('day').toDate();
        const endDate = dates[dates.length - 1].endOf('day').toDate();
        const bookings = await bookingRepository.findByDateRange(startDate, endDate);

        const weeklyData = dates.map((d) => {
            const dateStr = d.format('YYYY-MM-DD');
            const dayBookings = bookings.filter(
                (b) => dayjs(b.date).format('YYYY-MM-DD') === dateStr
            );
            return {
                date: dateStr,
                dayOfWeek: d.format('dddd'),
                batchScheduled: getBatchForDay(d),
                bookings: dayBookings,
                totalBooked: dayBookings.length,
            };
        });

        return weeklyData;
    }

    async getAnalytics(startDate: string, endDate: string) {
        const start = normalizeDate(startDate);
        const end = normalizeDate(endDate);

        const totalSeats = await seatRepository.countAll();
        const designatedSeats = await seatRepository.countByType('designated');
        const bufferSeats = await seatRepository.countByType('buffer');

        const [stats, squadWise, dailyOccupancy] = await Promise.all([
            bookingRepository.getBookingStats(start, end),
            bookingRepository.getSquadWiseBookings(start, end),
            bookingRepository.getDailyOccupancy(start, end),
        ]);

        let totalBooked = 0;
        let totalReleased = 0;
        let bufferUsed = 0;

        stats.forEach((s: any) => {
            if (s._id.status === 'booked') totalBooked += s.count;
            if (s._id.status === 'released') totalReleased += s.count;
            if (s._id.status === 'booked' && (s._id.type === 'buffer' || s._id.type === 'temp_buffer')) {
                bufferUsed += s.count;
            }
        });

        const workDays = dailyOccupancy.length || 1;
        const avgOccupancy = totalBooked / workDays;
        const occupancyPercent = Math.round((avgOccupancy / totalSeats) * 100);
        const bufferUsagePercent = bufferSeats > 0
            ? Math.round((bufferUsed / (bufferSeats * workDays)) * 100)
            : 0;

        return {
            totalSeats,
            designatedSeats,
            bufferSeats,
            totalBooked,
            totalReleased,
            bufferUsed,
            occupancyPercent,
            bufferUsagePercent,
            noShowCount: totalReleased,
            squadWise,
            dailyOccupancy,
        };
    }
}
