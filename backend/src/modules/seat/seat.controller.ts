import { Request, Response } from 'express';
import { SeatService } from './seat.service';
import { asyncHandler } from '../../core/utils/asyncHandler';

const seatService = new SeatService();

export class SeatController {
    getAllSeats = asyncHandler(async (_req: Request, res: Response) => {
        const seats = await seatService.getAllSeats();
        res.status(200).json({
            success: true,
            data: { seats },
        });
    });

    getSeatsBySquad = asyncHandler(async (req: Request, res: Response) => {
        const squadId = parseInt(req.params.squadId, 10);
        const seats = await seatService.getSeatsBySquad(squadId);
        res.status(200).json({
            success: true,
            data: { seats },
        });
    });

    getBufferSeats = asyncHandler(async (_req: Request, res: Response) => {
        const seats = await seatService.getBufferSeats();
        res.status(200).json({
            success: true,
            data: { seats },
        });
    });

    getSeatAvailability = asyncHandler(async (req: Request, res: Response) => {
        const { date } = req.query;
        if (!date || typeof date !== 'string') {
            res.status(400).json({ success: false, message: 'Date query parameter is required' });
            return;
        }
        const availability = await seatService.getSeatAvailability(date);
        res.status(200).json({
            success: true,
            data: { seats: availability },
        });
    });
}
