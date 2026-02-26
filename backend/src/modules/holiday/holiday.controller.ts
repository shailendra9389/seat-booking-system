import { Request, Response } from 'express';
import { HolidayService } from './holiday.service';
import { asyncHandler } from '../../core/utils/asyncHandler';

const holidayService = new HolidayService();

export class HolidayController {
    getAllHolidays = asyncHandler(async (_req: Request, res: Response) => {
        const holidays = await holidayService.getAllHolidays();
        res.status(200).json({
            success: true,
            data: { holidays },
        });
    });

    addHoliday = asyncHandler(async (req: Request, res: Response) => {
        const { date, reason } = req.body;
        const holiday = await holidayService.addHoliday(date, reason);
        res.status(201).json({
            success: true,
            message: 'Holiday added successfully',
            data: { holiday },
        });
    });

    deleteHoliday = asyncHandler(async (req: Request, res: Response) => {
        await holidayService.deleteHoliday(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Holiday deleted successfully',
        });
    });

    checkHoliday = asyncHandler(async (req: Request, res: Response) => {
        const { date } = req.query;
        if (!date || typeof date !== 'string') {
            res.status(400).json({ success: false, message: 'Date is required' });
            return;
        }
        const isHoliday = await holidayService.isHoliday(date);
        res.status(200).json({
            success: true,
            data: { isHoliday },
        });
    });
}
