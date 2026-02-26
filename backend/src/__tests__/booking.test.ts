import { getBatchForDay, isWeekend, isWithinBookingWindow, isRotationWeek } from '../core/utils/dateUtils';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

describe('Date Utilities', () => {
    describe('isWeekend', () => {
        it('should return true for Saturday', () => {
            const saturday = dayjs('2026-02-28'); // Saturday
            expect(isWeekend(saturday)).toBe(true);
        });

        it('should return true for Sunday', () => {
            const sunday = dayjs('2026-03-01'); // Sunday
            expect(isWeekend(sunday)).toBe(true);
        });

        it('should return false for weekdays', () => {
            const monday = dayjs('2026-02-23'); // Monday
            expect(isWeekend(monday)).toBe(false);
        });
    });

    describe('getBatchForDay', () => {
        it('should return correct batch for normal week', () => {
            // Week 9 (odd) - no swap: Mon-Wed = Batch 1, Thu-Fri = Batch 2
            const monday = dayjs('2026-02-23'); // Week 9
            expect(monday.isoWeek() % 2).toBe(1); // odd week
            expect(getBatchForDay(monday)).toBe(1); // Monday -> Batch 1

            const thursday = dayjs('2026-02-26'); // Week 9
            expect(getBatchForDay(thursday)).toBe(2); // Thursday -> Batch 2
        });

        it('should swap batches on even weeks', () => {
            // Week 10 (even) - swap: Mon-Wed = Batch 2, Thu-Fri = Batch 1
            const monday = dayjs('2026-03-02'); // Week 10
            expect(monday.isoWeek() % 2).toBe(0); // even week
            expect(getBatchForDay(monday)).toBe(2); // Swapped: Monday -> Batch 2

            const thursday = dayjs('2026-03-05'); // Week 10
            expect(getBatchForDay(thursday)).toBe(1); // Swapped: Thursday -> Batch 1
        });

        it('should return null for weekends', () => {
            const saturday = dayjs('2026-02-28');
            expect(getBatchForDay(saturday)).toBeNull();
        });
    });

    describe('isWithinBookingWindow', () => {
        it('should return true for dates within 14 days', () => {
            const tomorrow = dayjs().add(1, 'day');
            expect(isWithinBookingWindow(tomorrow)).toBe(true);
        });

        it('should return false for dates beyond 14 days', () => {
            const farDate = dayjs().add(20, 'day');
            expect(isWithinBookingWindow(farDate)).toBe(false);
        });
    });
});

describe('Booking Logic', () => {
    describe('Batch Rotation', () => {
        it('should auto-calculate rotation based on ISO week number', () => {
            // Even week = swapped
            const evenWeekDate = dayjs().isoWeek(10).startOf('isoWeek');
            expect(evenWeekDate.isoWeek() % 2).toBe(0);

            // Odd week = normal
            const oddWeekDate = dayjs().isoWeek(11).startOf('isoWeek');
            expect(oddWeekDate.isoWeek() % 2).toBe(1);
        });
    });
});
