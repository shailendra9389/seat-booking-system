import { IBookingStrategy, BookingContext, BookingResult } from './booking.strategy';
import { Booking } from '../../modules/booking/booking.model';
import { Seat } from '../../modules/seat/seat.model';
import { Holiday } from '../../modules/holiday/holiday.model';
import { getBatchForDay, isWeekend, isBufferBookingTimeValid, dayjs } from '../utils/dateUtils';
import { BadRequestError, ConflictError } from '../utils/errors';

export class BufferBookingStrategy implements IBookingStrategy {
    getType(): string {
        return 'buffer';
    }

    async validate(context: BookingContext): Promise<void> {
        const { user, seatId, date } = context;
        const bookingDate = dayjs(date);

        // Check weekend
        if (isWeekend(bookingDate)) {
            throw new BadRequestError('Cannot book buffer seat on weekends');
        }

        // Check holiday
        const holiday = await Holiday.findOne({
            date: { $gte: bookingDate.startOf('day').toDate(), $lt: bookingDate.endOf('day').toDate() },
        });
        if (holiday) {
            throw new BadRequestError(`Cannot book on holiday: ${holiday.reason}`);
        }

        // Buffer can only be booked on NON-batch day
        const batchForDay = getBatchForDay(bookingDate);
        if (batchForDay === user.batchId) {
            throw new BadRequestError(
                'Buffer seats can only be booked on non-batch days. Use designated booking for your batch day.'
            );
        }

        // Can only book 1 day before, after 3 PM
        if (!isBufferBookingTimeValid(bookingDate)) {
            throw new BadRequestError(
                'Buffer seats can only be booked 1 day in advance, after 3:00 PM'
            );
        }

        // Verify the seat is a buffer seat
        const seat = await Seat.findById(seatId);
        if (!seat) {
            throw new BadRequestError('Seat not found');
        }
        if (seat.type !== 'buffer') {
            throw new BadRequestError('This seat is not a buffer seat');
        }
    }

    async execute(context: BookingContext): Promise<BookingResult> {
        const { user, seatId, date, session } = context;
        const bookingDate = dayjs(date).startOf('day').toDate();

        // Check if user already has a booking for this date
        const existingUserBooking = await Booking.findOne({
            userId: user._id,
            date: bookingDate,
            status: 'booked',
        }).session(session || null);

        if (existingUserBooking) {
            throw new ConflictError('You already have a booking for this date');
        }

        // Check if seat is available
        const existingSeatBooking = await Booking.findOne({
            seatId,
            date: bookingDate,
            status: 'booked',
        }).session(session || null);

        if (existingSeatBooking) {
            throw new ConflictError('This buffer seat is already booked for this date');
        }

        const booking = new Booking({
            userId: user._id,
            seatId,
            date: bookingDate,
            type: 'buffer',
            status: 'booked',
        });

        await booking.save({ session });

        return {
            success: true,
            message: 'Buffer seat booked successfully',
            booking,
        };
    }
}
