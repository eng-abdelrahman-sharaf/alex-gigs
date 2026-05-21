import pool from '../config/db';

const testConnection = async () => {
  console.log('⏳ Attempting to connect to PostgreSQL database...');
  try {
    const start = Date.now();
    const res = await pool.query('SELECT NOW(), current_database(), current_user');
    const elapsed = Date.now() - start;
    
    console.log('✅ DATABASE CONNECTION SUCCESSFUL!');
    console.log(`⏱️  Roundtrip latency: ${elapsed}ms`);
    console.log(`💾 Connected database: ${res.rows[0].current_database}`);
    console.log(`👤 Database role: ${res.rows[0].current_user}`);
    console.log(`🕒 Database time: ${res.rows[0].now}`);
  } catch (error: any) {
    console.error('❌ DATABASE CONNECTION FAILED!');
    console.error('Error Code:', error.code || 'N/A');
    console.error('Message:', error.message);
    console.log('\n💡 Please check your DB credentials in the `.env` file and make sure the PostgreSQL service is active.');
  } finally {
    process.exit(0);
  }
};

testConnection();
