import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { config } from '../../config';
import { getBatchForDay, getWeekDates, isRotationWeek, getCurrentWeekNumber, dayjs } from '../../core/utils/dateUtils';

const router = Router();

router.use(authMiddleware);

router.get(
    '/schedule',
    asyncHandler(async (req: Request, res: Response) => {
        const weekStart = req.query.weekStart as string | undefined;
        const dates = getWeekDates(weekStart);

        const schedule = dates.map((d) => ({
            date: d.format('YYYY-MM-DD'),
            dayOfWeek: d.format('dddd'),
            batch: getBatchForDay(d),
        }));

        res.status(200).json({
            success: true,
            data: {
                schedule,
                currentWeek: getCurrentWeekNumber(),
                isRotationWeek: isRotationWeek(),
                batch1Squads: config.booking.batch1Squads,
                batch2Squads: config.booking.batch2Squads,
            },
        });
    })
);

router.get(
    '/info',
    asyncHandler(async (_req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            data: {
                batch1: {
                    id: 1,
                    squads: config.booking.batch1Squads,
                    defaultDays: ['Monday', 'Tuesday', 'Wednesday'],
                },
                batch2: {
                    id: 2,
                    squads: config.booking.batch2Squads,
                    defaultDays: ['Thursday', 'Friday'],
                },
                rotationRule: 'Batches swap every alternate week (ISO week % 2 == 0)',
                currentWeek: getCurrentWeekNumber(),
                isRotationWeek: isRotationWeek(),
            },
        });
    })
);

export default router;
