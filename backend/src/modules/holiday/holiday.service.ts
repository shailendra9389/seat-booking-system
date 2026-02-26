import { HolidayRepository } from './holiday.repository';
import { IHoliday } from './holiday.model';
import { ConflictError, NotFoundError } from '../../core/utils/errors';
import { normalizeDate } from '../../core/utils/dateUtils';

const holidayRepository = new HolidayRepository();

export class HolidayService {
    async getAllHolidays(): Promise<IHoliday[]> {
        return holidayRepository.findAll();
    }

    async getHolidaysByDateRange(startDate: string, endDate: string): Promise<IHoliday[]> {
        return holidayRepository.findByDateRange(
            normalizeDate(startDate),
            normalizeDate(endDate)
        );
    }

    async addHoliday(date: string, reason: string): Promise<IHoliday> {
        const existing = await holidayRepository.findByDate(normalizeDate(date));
        if (existing) {
            throw new ConflictError('A holiday already exists for this date');
        }
        return holidayRepository.create({ date, reason });
    }

    async deleteHoliday(id: string): Promise<void> {
        const holiday = await holidayRepository.delete(id);
        if (!holiday) {
            throw new NotFoundError('Holiday not found');
        }
    }

    async isHoliday(date: string): Promise<boolean> {
        return holidayRepository.isHoliday(normalizeDate(date));
    }
}
