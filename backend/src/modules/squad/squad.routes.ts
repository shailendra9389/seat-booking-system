import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { UserRepository } from '../user/user.repository';
import { SeatRepository } from '../seat/seat.repository';
import { config } from '../../config';

const router = Router();
const userRepository = new UserRepository();
const seatRepository = new SeatRepository();

router.use(authMiddleware);

router.get(
    '/',
    asyncHandler(async (_req: Request, res: Response) => {
        const squads = [];
        for (let i = 1; i <= config.booking.totalSquads; i++) {
            const memberCount = await userRepository.countBySquad(i);
            const seats = await seatRepository.findBySquadId(i);
            squads.push({
                squadId: i,
                batchId: config.booking.batch1Squads.includes(i) ? 1 : 2,
                memberCount,
                seatCount: seats.length,
            });
        }
        res.status(200).json({
            success: true,
            data: { squads },
        });
    })
);

router.get(
    '/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const squadId = parseInt(req.params.id, 10);
        const members = await userRepository.findBySquadId(squadId);
        const seats = await seatRepository.findBySquadId(squadId);

        res.status(200).json({
            success: true,
            data: {
                squadId,
                batchId: config.booking.batch1Squads.includes(squadId) ? 1 : 2,
                members,
                seats,
            },
        });
    })
);

export default router;
