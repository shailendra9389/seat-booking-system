import mongoose from 'mongoose';
import { IUser } from '../../modules/user/user.model';

export interface BookingContext {
    user: IUser;
    seatId: string;
    date: Date;
    session?: mongoose.ClientSession;
}

export interface BookingResult {
    success: boolean;
    message: string;
    booking?: any;
}

export interface IBookingStrategy {
    validate(context: BookingContext): Promise<void>;
    execute(context: BookingContext): Promise<BookingResult>;
    getType(): string;
}
