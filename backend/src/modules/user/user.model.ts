import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    squadId: number;
    batchId: number;
    role: 'admin' | 'user';
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
        },
        squadId: {
            type: Number,
            required: [true, 'Squad ID is required'],
            min: 1,
            max: 10,
        },
        batchId: {
            type: Number,
            required: [true, 'Batch ID is required'],
            enum: [1, 2],
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
        refreshToken: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.index({ squadId: 1 });
UserSchema.index({ batchId: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
