import { IBookingStrategy } from './booking.strategy';
import { DesignatedBookingStrategy } from './designated.strategy';
import { BufferBookingStrategy } from './buffer.strategy';
import { TempBufferStrategy } from './tempBuffer.strategy';
import { BadRequestError } from '../utils/errors';

export type BookingStrategyType = 'designated' | 'buffer' | 'temp_buffer';

export class BookingStrategyFactory {
    private static strategies: Map<BookingStrategyType, IBookingStrategy> = new Map();

    static {
        BookingStrategyFactory.strategies.set('designated', new DesignatedBookingStrategy());
        BookingStrategyFactory.strategies.set('buffer', new BufferBookingStrategy());
        BookingStrategyFactory.strategies.set('temp_buffer', new TempBufferStrategy());
    }

    static getStrategy(type: BookingStrategyType): IBookingStrategy {
        const strategy = BookingStrategyFactory.strategies.get(type);
        if (!strategy) {
            throw new BadRequestError(`Invalid booking type: ${type}`);
        }
        return strategy;
    }
}
