import { Pool, PoolClient } from 'pg';
import { env } from './env';

const pool = new Pool({
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Log pool errors to prevent crashes
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (env.NODE_ENV === 'development') {
    // console.log('executed query', { text, duration, rows: res.rowCount });
  }
  return res;
};

export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export default pool;
