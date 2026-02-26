import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

const authService = new AuthService();

export class AuthController {
    register = asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.register(req.body);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result,
        });
    });

    login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    });

    refreshToken = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        const result = await authService.refreshAccessToken(refreshToken);
        res.status(200).json({
            success: true,
            message: 'Token refreshed',
            data: result,
        });
    });

    logout = asyncHandler(async (req: AuthRequest, res: Response) => {
        if (req.user) {
            await authService.logout(req.user._id.toString());
        }
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    });

    getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
        res.status(200).json({
            success: true,
            data: {
                user: req.user,
            },
        });
    });
}
