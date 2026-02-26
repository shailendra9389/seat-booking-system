import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { config } from '../../config';

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(config.nodeEnv === 'development' && { stack: err.stack }),
        });
        return;
    }

    // MongoDB duplicate key error
    if ((err as any).code === 11000) {
        const field = Object.keys((err as any).keyValue || {})[0];
        res.status(409).json({
            success: false,
            message: `Duplicate value for ${field || 'field'}. This booking may already exist.`,
        });
        return;
    }

    // MongoDB validation error
    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            message: err.message,
        });
        return;
    }

    console.error('Unhandled error:', err);

    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
};
