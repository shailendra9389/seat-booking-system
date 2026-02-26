import mongoose, { Schema, Document } from 'mongoose';

export type BookingType = 'designated' | 'buffer' | 'temp_buffer';
export type BookingStatus = 'booked' | 'released' | 'cancelled' | 'expired';

export interface IBooking extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    seatId: mongoose.Types.ObjectId;
    date: Date;
    type: BookingType;
    status: BookingStatus;
    releasedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        seatId: {
            type: Schema.Types.ObjectId,
            ref: 'Seat',
            required: [true, 'Seat ID is required'],
        },
        date: {
            type: Date,
            required: [true, 'Booking date is required'],
        },
        type: {
            type: String,
            enum: ['designated', 'buffer', 'temp_buffer'],
            required: [true, 'Booking type is required'],
        },
        status: {
            type: String,
            enum: ['booked', 'released', 'cancelled', 'expired'],
            default: 'booked',
        },
        releasedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index: one booking per user per date
BookingSchema.index({ userId: 1, date: 1 }, { unique: true });
BookingSchema.index({ date: 1 });
BookingSchema.index({ seatId: 1 });
BookingSchema.index({ seatId: 1, date: 1, status: 1 });
BookingSchema.index({ status: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
