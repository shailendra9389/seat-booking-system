import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { UserRepository } from '../user/user.repository';
import { IUser } from '../user/user.model';
import { BadRequestError, UnauthorizedError, ConflictError } from '../../core/utils/errors';

const userRepository = new UserRepository();

export class AuthService {
    async register(data: {
        name: string;
        email: string;
        password: string;
        squadId: number;
        batchId: number;
        role?: 'admin' | 'user';
    }): Promise<{ user: Partial<IUser>; accessToken: string; refreshToken: string }> {
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new ConflictError('Email already registered');
        }

        // Validate squad-batch mapping
        const { batch1Squads, batch2Squads } = config.booking;
        if (data.batchId === 1 && !batch1Squads.includes(data.squadId)) {
            throw new BadRequestError(`Squad ${data.squadId} does not belong to Batch 1`);
        }
        if (data.batchId === 2 && !batch2Squads.includes(data.squadId)) {
            throw new BadRequestError(`Squad ${data.squadId} does not belong to Batch 2`);
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        const user = await userRepository.create({
            ...data,
            password: hashedPassword,
        });

        const { accessToken, refreshToken } = this.generateTokens(user);
        await userRepository.updateRefreshToken(user._id.toString(), refreshToken);

        return {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                squadId: user.squadId,
                batchId: user.batchId,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }

    async login(
        email: string,
        password: string
    ): Promise<{ user: Partial<IUser>; accessToken: string; refreshToken: string }> {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const { accessToken, refreshToken } = this.generateTokens(user);
        await userRepository.updateRefreshToken(user._id.toString(), refreshToken);

        return {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                squadId: user.squadId,
                batchId: user.batchId,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }

    async refreshAccessToken(
        refreshToken: string
    ): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
                userId: string;
            };

            const user = await userRepository.findByEmail('');
            const userWithToken = await userRepository.findByRefreshToken(refreshToken);

            if (!userWithToken) {
                throw new UnauthorizedError('Invalid refresh token');
            }

            const tokens = this.generateTokens(userWithToken);
            await userRepository.updateRefreshToken(
                userWithToken._id.toString(),
                tokens.refreshToken
            );

            return tokens;
        } catch (error) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }
    }

    async logout(userId: string): Promise<void> {
        await userRepository.updateRefreshToken(userId, null);
    }

    private generateTokens(user: IUser): {
        accessToken: string;
        refreshToken: string;
    } {
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            config.jwt.accessSecret,
            { expiresIn: config.jwt.accessExpiry as any }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            config.jwt.refreshSecret,
            { expiresIn: config.jwt.refreshExpiry as any }
        );

        return { accessToken, refreshToken };
    }
}
