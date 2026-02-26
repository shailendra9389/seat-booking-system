import { Router } from 'express';
import { BookingController } from './booking.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { roleMiddleware } from '../../core/middlewares/role.middleware';
import { validate } from '../../core/middlewares/validate.middleware';
import { createBookingSchema } from './booking.validator';

const router = Router();
const bookingController = new BookingController();

router.use(authMiddleware);

router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.patch('/:id/release', bookingController.releaseBooking);
router.patch('/:id/cancel', bookingController.cancelBooking);
router.get('/my', bookingController.getMyBookings);
router.get('/date', bookingController.getBookingsByDate);
router.get('/weekly', bookingController.getWeeklyBookings);
router.get('/analytics', roleMiddleware('admin'), bookingController.getAnalytics);

export default router;
