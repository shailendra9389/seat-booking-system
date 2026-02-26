import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
import { config } from '../../config';

dayjs.extend(isoWeek);
dayjs.extend(isBetween);

export const getBatchForDay = (date: dayjs.Dayjs): number | null => {
    const dayOfWeek = date.isoWeekday(); // 1=Monday, 7=Sunday

    // No booking on weekends
    if (dayOfWeek === 6 || dayOfWeek === 7) return null;

    const weekNumber = date.isoWeek();
    const isSwapped = weekNumber % 2 === 0;

    const { defaultBatch1Days, defaultBatch2Days } = config.booking;

    if (!isSwapped) {
        if (defaultBatch1Days.includes(dayOfWeek)) return 1;
        if (defaultBatch2Days.includes(dayOfWeek)) return 2;
    } else {
        // Swapped: Batch 2 gets Mon-Wed, Batch 1 gets Thu-Fri
        if (defaultBatch1Days.includes(dayOfWeek)) return 2;
        if (defaultBatch2Days.includes(dayOfWeek)) return 1;
    }

    return null;
};

export const isWeekend = (date: dayjs.Dayjs): boolean => {
    const day = date.isoWeekday();
    return day === 6 || day === 7;
};

export const isWithinBookingWindow = (date: dayjs.Dayjs): boolean => {
    const today = dayjs().startOf('day');
    const targetDate = date.startOf('day');
    const maxDate = today.add(config.booking.bookingWindowDays, 'day');
    return targetDate.isAfter(today.subtract(1, 'day')) && targetDate.isBefore(maxDate.add(1, 'day'));
};

export const isBufferBookingTimeValid = (bookingDate: dayjs.Dayjs): boolean => {
    const now = dayjs();
    const targetDate = bookingDate.startOf('day');
    const tomorrow = now.add(1, 'day').startOf('day');

    // Can only book 1 day before
    if (!targetDate.isSame(tomorrow, 'day')) return false;

    // Booking opens after 3 PM
    if (now.hour() < config.booking.bufferBookingOpenHour) return false;

    return true;
};

export const normalizeDate = (date: string | Date): Date => {
    return dayjs(date).startOf('day').toDate();
};

export const getWeekDates = (referenceDate?: string): dayjs.Dayjs[] => {
    const ref = referenceDate ? dayjs(referenceDate) : dayjs();
    const startOfWeek = ref.startOf('isoWeek');
    const dates: dayjs.Dayjs[] = [];

    for (let i = 0; i < 5; i++) {
        dates.push(startOfWeek.add(i, 'day'));
    }

    return dates;
};

export const getCurrentWeekNumber = (): number => {
    return dayjs().isoWeek();
};

export const isRotationWeek = (): boolean => {
    return dayjs().isoWeek() % 2 === 0;
};

export { dayjs };
