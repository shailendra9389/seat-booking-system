import { Holiday, IHoliday } from './holiday.model';
import { normalizeDate } from '../../core/utils/dateUtils';

export class HolidayRepository {
    async findAll(): Promise<IHoliday[]> {
        return Holiday.find().sort({ date: 1 });
    }

    async findByDate(date: Date): Promise<IHoliday | null> {
        return Holiday.findOne({ date });
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<IHoliday[]> {
        return Holiday.find({
            date: { $gte: startDate, $lte: endDate },
        }).sort({ date: 1 });
    }

    async create(data: { date: string; reason: string }): Promise<IHoliday> {
        const holiday = new Holiday({
            date: normalizeDate(data.date),
            reason: data.reason,
        });
        return holiday.save();
    }

    async delete(id: string): Promise<IHoliday | null> {
        return Holiday.findByIdAndDelete(id);
    }

    async isHoliday(date: Date): Promise<boolean> {
        const holiday = await Holiday.findOne({ date });
        return !!holiday;
    }
}
