import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        password: z.string().min(6),
        squadId: z.number().int().min(1).max(10),
        batchId: z.number().int().min(1).max(2),
        role: z.enum(['admin', 'user']).optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
    }),
});

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string(),
    }),
});
