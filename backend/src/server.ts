import app from './app';
import { config } from './config';
import { connectDatabase } from './database/connection';

const startServer = async (): Promise<void> => {
    await connectDatabase();

    app.listen(config.port, () => {
        console.log(`🚀 Server is running on port ${config.port}`);
        console.log(`📍 Environment: ${config.nodeEnv}`);
        console.log(`🔗 API: http://localhost:${config.port}/api/v1`);
    });
};

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
