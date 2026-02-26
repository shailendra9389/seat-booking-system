import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ForbiddenError } from '../utils/errors';

export const roleMiddleware = (...roles: string[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            next(new ForbiddenError('Authentication required'));
            return;
        }

        if (!roles.includes(req.user.role)) {
            next(new ForbiddenError('Insufficient permissions'));
            return;
        }

        next();
    };
};
