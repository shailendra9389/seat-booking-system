import { Router } from 'express';
import { UserRepository } from './user.repository';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { roleMiddleware } from '../../core/middlewares/role.middleware';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { Request, Response } from 'express';

const router = Router();
const userRepository = new UserRepository();

router.use(authMiddleware);

router.get(
    '/',
    roleMiddleware('admin'),
    asyncHandler(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const result = await userRepository.findAll(page, limit);
        res.status(200).json({
            success: true,
            data: result,
        });
    })
);

router.get(
    '/squad/:squadId',
    asyncHandler(async (req: Request, res: Response) => {
        const squadId = parseInt(req.params.squadId, 10);
        const users = await userRepository.findBySquadId(squadId);
        res.status(200).json({
            success: true,
            data: { users },
        });
    })
);

router.get(
    '/batch/:batchId',
    asyncHandler(async (req: Request, res: Response) => {
        const batchId = parseInt(req.params.batchId, 10);
        const users = await userRepository.findByBatchId(batchId);
        res.status(200).json({
            success: true,
            data: { users },
        });
    })
);

export default router;
