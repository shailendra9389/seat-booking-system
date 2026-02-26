import { z } from 'zod';

export const createHolidaySchema = z.object({
    body: z.object({
        date: z.string().min(1),
        reason: z.string().min(1).max(200),
    }),
});
