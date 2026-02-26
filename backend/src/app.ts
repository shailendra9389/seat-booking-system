import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './core/middlewares/error.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import seatRoutes from './modules/seat/seat.routes';
import bookingRoutes from './modules/booking/booking.routes';
import holidayRoutes from './modules/holiday/holiday.routes';
import batchRoutes from './modules/batch/batch.routes';
import squadRoutes from './modules/squad/squad.routes';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Seat Booking API is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes (versioned)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/seats', seatRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/holidays', holidayRoutes);
app.use('/api/v1/batches', batchRoutes);
app.use('/api/v1/squads', squadRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handler
app.use(errorHandler);

export default app;
