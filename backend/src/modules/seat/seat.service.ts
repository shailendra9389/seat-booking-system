import { SeatRepository } from './seat.repository';
import { Booking } from '../booking/booking.model';
import { ISeat } from './seat.model';
import { dayjs, normalizeDate, getBatchForDay } from '../../core/utils/dateUtils';

const seatRepository = new SeatRepository();

export class SeatService {
    async getAllSeats(): Promise<ISeat[]> {
        return seatRepository.findAll();
    }

    async getSeatsBySquad(squadId: number): Promise<ISeat[]> {
        return seatRepository.findBySquadId(squadId);
    }

    async getBufferSeats(): Promise<ISeat[]> {
        return seatRepository.findBufferSeats();
    }

    async getSeatAvailability(date: string): Promise<any[]> {
        const targetDate = normalizeDate(date);
        const seats = await seatRepository.findAll();

        const bookings = await Booking.find({
            date: targetDate,
            status: 'booked',
        }).populate('userId', 'name email squadId');

        const releasedBookings = await Booking.find({
            date: targetDate,
            status: 'released',
        });

        const bookingMap = new Map<string, any>();
        bookings.forEach((b) => {
            bookingMap.set(b.seatId.toString(), b);
        });

        const releasedMap = new Set<string>();
        releasedBookings.forEach((b) => {
            releasedMap.add(b.seatId.toString());
        });

        const batchForDay = getBatchForDay(dayjs(date));

        return seats.map((seat) => {
            const booking = bookingMap.get(seat._id.toString());
            const isReleased = releasedMap.has(seat._id.toString());

            let status: string;
            if (booking) {
                status = 'booked';
            } else if (isReleased) {
                status = 'temp_buffer';
            } else if (seat.type === 'buffer') {
                status = 'buffer';
            } else {
                status = 'available';
            }

            return {
                _id: seat._id,
                seatNumber: seat.seatNumber,
                type: seat.type,
                squadId: seat.squadId,
                row: seat.row,
                column: seat.column,
                floor: seat.floor,
                status,
                booking: booking
                    ? {
                        _id: booking._id,
                        userId: booking.userId,
                        type: booking.type,
                        status: booking.status,
                    }
                    : null,
                batchForDay,
            };
        });
    }

    async getSeatById(id: string): Promise<ISeat | null> {
        return seatRepository.findById(id);
    }
}
