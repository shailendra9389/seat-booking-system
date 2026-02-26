import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { UnauthorizedError } from '../utils/errors';
import { User, IUser } from '../../modules/user/user.model';

export interface AuthRequest extends Request {
    user?: IUser;
}

export const authMiddleware = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, config.jwt.accessSecret) as {
            userId: string;
            role: string;
        };

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            next(error);
        } else {
            next(new UnauthorizedError('Invalid or expired token'));
        }
    }
};
