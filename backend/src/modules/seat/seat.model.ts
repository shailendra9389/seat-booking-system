import mongoose, { Schema, Document } from 'mongoose';

export type SeatType = 'designated' | 'buffer';

export interface ISeat extends Document {
    _id: mongoose.Types.ObjectId;
    seatNumber: string;
    type: SeatType;
    squadId: number | null;
    floor: number;
    row: number;
    column: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SeatSchema = new Schema<ISeat>(
    {
        seatNumber: {
            type: String,
            required: [true, 'Seat number is required'],
            unique: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['designated', 'buffer'],
            required: [true, 'Seat type is required'],
        },
        squadId: {
            type: Number,
            default: null,
            min: 1,
            max: 10,
        },
        floor: {
            type: Number,
            default: 1,
        },
        row: {
            type: Number,
            required: true,
        },
        column: {
            type: Number,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

SeatSchema.index({ type: 1 });
SeatSchema.index({ squadId: 1 });

export const Seat = mongoose.model<ISeat>('Seat', SeatSchema);
