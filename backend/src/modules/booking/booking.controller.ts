import { Request, Response } from 'express';
import { BookingService } from './booking.service';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

const bookingService = new BookingService();

export class BookingController {
    createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { seatId, date, type } = req.body;
        const result = await bookingService.createBooking(req.user!, seatId, date, type);
        res.status(201).json({
            success: true,
            message: result.message,
            data: { booking: result.booking },
        });
    });

    releaseBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const booking = await bookingService.releaseBooking(req.user!, id);
        res.status(200).json({
            success: true,
            message: 'Booking released successfully. Seat is now available as temporary buffer.',
            data: { booking },
        });
    });

    cancelBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const booking = await bookingService.cancelBooking(req.user!, id);
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: { booking },
        });
    });

    getMyBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const result = await bookingService.getUserBookings(
            req.user!._id.toString(),
            page,
            limit
        );
        res.status(200).json({
            success: true,
            data: result,
        });
    });

    getBookingsByDate = asyncHandler(async (req: Request, res: Response) => {
        const { date } = req.query;
        if (!date || typeof date !== 'string') {
            res.status(400).json({ success: false, message: 'Date parameter is required' });
            return;
        }
        const bookings = await bookingService.getBookingsByDate(date);
        res.status(200).json({
            success: true,
            data: { bookings },
        });
    });

    getWeeklyBookings = asyncHandler(async (req: Request, res: Response) => {
        const weekStart = req.query.weekStart as string | undefined;
        const weeklyData = await bookingService.getWeeklyBookings(weekStart);
        res.status(200).json({
            success: true,
            data: { weekly: weeklyData },
        });
    });

    getAnalytics = asyncHandler(async (req: Request, res: Response) => {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
            res.status(400).json({
                success: false,
                message: 'startDate and endDate query parameters are required',
            });
            return;
        }
        const analytics = await bookingService.getAnalytics(startDate, endDate);
        res.status(200).json({
            success: true,
            data: analytics,
        });
    });
}
