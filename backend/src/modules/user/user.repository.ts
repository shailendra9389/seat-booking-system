import { User, IUser } from './user.model';
import mongoose from 'mongoose';

export class UserRepository {
    async findById(id: string): Promise<IUser | null> {
        return User.findById(id).select('-password -refreshToken');
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email });
    }

    async findBySquadId(squadId: number): Promise<IUser[]> {
        return User.find({ squadId }).select('-password -refreshToken');
    }

    async findByBatchId(batchId: number): Promise<IUser[]> {
        return User.find({ batchId }).select('-password -refreshToken');
    }

    async findAll(page = 1, limit = 20): Promise<{ users: IUser[]; total: number }> {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find().select('-password -refreshToken').skip(skip).limit(limit).sort({ squadId: 1 }),
            User.countDocuments(),
        ]);
        return { users, total };
    }

    async create(userData: Partial<IUser>): Promise<IUser> {
        const user = new User(userData);
        return user.save();
    }

    async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
        await User.findByIdAndUpdate(userId, { refreshToken });
    }

    async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
        return User.findOne({ refreshToken });
    }

    async countBySquad(squadId: number): Promise<number> {
        return User.countDocuments({ squadId });
    }

    async countAll(): Promise<number> {
        return User.countDocuments();
    }
}
