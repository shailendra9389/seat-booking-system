import { Booking, IBooking, BookingType, BookingStatus } from './booking.model';
import mongoose from 'mongoose';

export class BookingRepository {
    async findById(id: string): Promise<IBooking | null> {
        return Booking.findById(id).populate('seatId').populate('userId', 'name email squadId batchId');
    }

    async findByUserId(userId: string, page = 1, limit = 20): Promise<{ bookings: IBooking[]; total: number }> {
        const skip = (page - 1) * limit;
        const [bookings, total] = await Promise.all([
            Booking.find({ userId })
                .populate('seatId')
                .populate('userId', 'name email squadId batchId')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
            Booking.countDocuments({ userId }),
        ]);
        return { bookings, total };
    }

    async findByDate(date: Date): Promise<IBooking[]> {
        return Booking.find({ date, status: 'booked' })
            .populate('seatId')
            .populate('userId', 'name email squadId batchId');
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<IBooking[]> {
        return Booking.find({
            date: { $gte: startDate, $lte: endDate },
            status: 'booked',
        })
            .populate('seatId')
            .populate('userId', 'name email squadId batchId')
            .sort({ date: 1 });
    }

    async findUserBookingForDate(userId: string, date: Date): Promise<IBooking | null> {
        return Booking.findOne({
            userId,
            date,
            status: 'booked',
        });
    }

    async findSeatBookingForDate(seatId: string, date: Date): Promise<IBooking | null> {
        return Booking.findOne({
            seatId,
            date,
            status: 'booked',
        });
    }

    async releaseBooking(bookingId: string, session?: mongoose.ClientSession): Promise<IBooking | null> {
        return Booking.findByIdAndUpdate(
            bookingId,
            {
                status: 'released',
                releasedAt: new Date(),
            },
            { new: true, session }
        );
    }

    async cancelBooking(bookingId: string): Promise<IBooking | null> {
        return Booking.findByIdAndUpdate(
            bookingId,
            { status: 'cancelled' },
            { new: true }
        );
    }

    async getBookingStats(startDate: Date, endDate: Date): Promise<any> {
        return Booking.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: {
                        status: '$status',
                        type: '$type',
                    },
                    count: { $sum: 1 },
                },
            },
        ]);
    }

    async getSquadWiseBookings(startDate: Date, endDate: Date): Promise<any> {
        return Booking.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                    status: 'booked',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $group: {
                    _id: '$user.squadId',
                    totalBookings: { $sum: 1 },
                    designatedBookings: {
                        $sum: { $cond: [{ $eq: ['$type', 'designated'] }, 1, 0] },
                    },
                    bufferBookings: {
                        $sum: { $cond: [{ $eq: ['$type', 'buffer'] }, 1, 0] },
                    },
                    tempBufferBookings: {
                        $sum: { $cond: [{ $eq: ['$type', 'temp_buffer'] }, 1, 0] },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }

    async getDailyOccupancy(startDate: Date, endDate: Date): Promise<any> {
        return Booking.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                    status: 'booked',
                },
            },
            {
                $group: {
                    _id: '$date',
                    totalBookings: { $sum: 1 },
                    designatedBookings: {
                        $sum: { $cond: [{ $eq: ['$type', 'designated'] }, 1, 0] },
                    },
                    bufferBookings: {
                        $sum: { $cond: [{ $in: ['$type', ['buffer', 'temp_buffer']] }, 1, 0] },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }

    async countAll(): Promise<number> {
        return Booking.countDocuments();
    }

    async countByStatus(status: BookingStatus): Promise<number> {
        return Booking.countDocuments({ status });
    }
}
