import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '5001', 10),
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/seat-booking',
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    },
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    booking: {
        totalSquads: 10,
        membersPerSquad: 8,
        totalBufferSeats: 10,
        bookingWindowDays: 14,
        bufferBookingAdvanceDays: 1,
        bufferBookingOpenHour: 15, // 3 PM
        batch1Squads: [1, 2, 3, 4, 5],
        batch2Squads: [6, 7, 8, 9, 10],
        defaultBatch1Days: [1, 2, 3], // Monday, Tuesday, Wednesday (dayjs day of week: 1=Monday)
        defaultBatch2Days: [4, 5], // Thursday, Friday
    },
};
