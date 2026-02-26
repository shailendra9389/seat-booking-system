import { Seat, ISeat } from './seat.model';

export class SeatRepository {
    async findById(id: string): Promise<ISeat | null> {
        return Seat.findById(id);
    }

    async findBySeatNumber(seatNumber: string): Promise<ISeat | null> {
        return Seat.findOne({ seatNumber });
    }

    async findBySquadId(squadId: number): Promise<ISeat[]> {
        return Seat.find({ squadId, isActive: true }).sort({ row: 1, column: 1 });
    }

    async findBufferSeats(): Promise<ISeat[]> {
        return Seat.find({ type: 'buffer', isActive: true }).sort({ row: 1, column: 1 });
    }

    async findAll(): Promise<ISeat[]> {
        return Seat.find({ isActive: true }).sort({ row: 1, column: 1 });
    }

    async findDesignatedSeats(): Promise<ISeat[]> {
        return Seat.find({ type: 'designated', isActive: true }).sort({ squadId: 1, row: 1, column: 1 });
    }

    async create(seatData: Partial<ISeat>): Promise<ISeat> {
        const seat = new Seat(seatData);
        return seat.save();
    }

    async createMany(seats: Partial<ISeat>[]): Promise<ISeat[]> {
        return Seat.insertMany(seats) as Promise<ISeat[]>;
    }

    async countByType(type: string): Promise<number> {
        return Seat.countDocuments({ type, isActive: true });
    }

    async countAll(): Promise<number> {
        return Seat.countDocuments({ isActive: true });
    }
}
