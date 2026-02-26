import { Router } from 'express';
import { HolidayController } from './holiday.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { roleMiddleware } from '../../core/middlewares/role.middleware';
import { validate } from '../../core/middlewares/validate.middleware';
import { createHolidaySchema } from './holiday.validator';

const router = Router();
const holidayController = new HolidayController();

router.use(authMiddleware);

router.get('/', holidayController.getAllHolidays);
router.get('/check', holidayController.checkHoliday);
router.post('/', roleMiddleware('admin'), validate(createHolidaySchema), holidayController.addHoliday);
router.delete('/:id', roleMiddleware('admin'), holidayController.deleteHoliday);

export default router;
