import app from './app';
import { env } from './config/env';
import pool from './config/db';

const startServer = async () => {
  try {
    console.log('🚀 Booting Alex Gigs Backend Server...');

    // 1. Check database connection
    console.log('⏳ Connecting to PostgreSQL database...');
    const client = await pool.connect();
    console.log('✅ PostgreSQL database connection established successfully.');
    
    // Release client back to pool
    client.release();

    // 2. Start HTTP Listener
    const PORT = env.PORT;
    app.listen(PORT, () => {
      console.log(`✅ Server is successfully listening on port ${PORT} in [${env.NODE_ENV}] mode.`);
      console.log(`🔗 Health check endpoint: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to boot the server:', error);
    process.exit(1);
  }
};

startServer();
