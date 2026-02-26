import { Router } from 'express';
import { SeatController } from './seat.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';

const router = Router();
const seatController = new SeatController();

router.use(authMiddleware);

router.get('/', seatController.getAllSeats);
router.get('/availability', seatController.getSeatAvailability);
router.get('/buffer', seatController.getBufferSeats);
router.get('/squad/:squadId', seatController.getSeatsBySquad);

export default router;
