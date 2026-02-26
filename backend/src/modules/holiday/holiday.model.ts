import mongoose, { Schema, Document } from 'mongoose';

export interface IHoliday extends Document {
    _id: mongoose.Types.ObjectId;
    date: Date;
    reason: string;
    createdAt: Date;
    updatedAt: Date;
}

const HolidaySchema = new Schema<IHoliday>(
    {
        date: {
            type: Date,
            required: [true, 'Holiday date is required'],
            unique: true,
        },
        reason: {
            type: String,
            required: [true, 'Holiday reason is required'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);


export const Holiday = mongoose.model<IHoliday>('Holiday', HolidaySchema);
