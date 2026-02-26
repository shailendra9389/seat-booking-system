import { z } from 'zod';

export const createBookingSchema = z.object({
    body: z.object({
        seatId: z.string().min(1),
        date: z.string().min(1),
        type: z.enum(['designated', 'buffer', 'temp_buffer']),
    }),
});

export const dateQuerySchema = z.object({
    query: z.object({
        date: z.string().min(1),
    }),
});

export const analyticsQuerySchema = z.object({
    query: z.object({
        startDate: z.string().min(1),
        endDate: z.string().min(1),
    }),
});
