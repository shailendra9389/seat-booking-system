import { IBookingStrategy, BookingContext, BookingResult } from './booking.strategy';
import { Booking } from '../../modules/booking/booking.model';
import { Seat } from '../../modules/seat/seat.model';
import { Holiday } from '../../modules/holiday/holiday.model';
import { getBatchForDay, isWeekend, isWithinBookingWindow, dayjs } from '../utils/dateUtils';
import { BadRequestError, ConflictError } from '../utils/errors';

export class DesignatedBookingStrategy implements IBookingStrategy {
    getType(): string {
        return 'designated';
    }

    async validate(context: BookingContext): Promise<void> {
        const { user, seatId, date } = context;
        const bookingDate = dayjs(date);

        // Check weekend
        if (isWeekend(bookingDate)) {
            throw new BadRequestError('Cannot book on weekends');
        }

        // Check holiday
        const holiday = await Holiday.findOne({
            date: { $gte: bookingDate.startOf('day').toDate(), $lt: bookingDate.endOf('day').toDate() },
        });
        if (holiday) {
            throw new BadRequestError(`Cannot book on holiday: ${holiday.reason}`);
        }

        // Check booking window (14 days)
        if (!isWithinBookingWindow(bookingDate)) {
            throw new BadRequestError('Booking must be within the 14-day window');
        }

        // Check batch day
        const batchForDay = getBatchForDay(bookingDate);
        if (batchForDay !== user.batchId) {
            throw new BadRequestError(
                `This is not your batch day. Batch ${batchForDay} is scheduled for this date.`
            );
        }

        // Verify the seat is designated and belongs to user's squad
        const seat = await Seat.findById(seatId);
        if (!seat) {
            throw new BadRequestError('Seat not found');
        }
        if (seat.type !== 'designated') {
            throw new BadRequestError('This seat is not a designated seat. Use buffer booking.');
        }
        if (seat.squadId !== user.squadId) {
            throw new BadRequestError('This seat does not belong to your squad');
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
            throw new ConflictError('This seat is already booked for this date');
        }

        const booking = new Booking({
            userId: user._id,
            seatId,
            date: bookingDate,
            type: 'designated',
            status: 'booked',
        });

        await booking.save({ session });

        return {
            success: true,
            message: 'Designated seat booked successfully',
            booking,
        };
    }
}
