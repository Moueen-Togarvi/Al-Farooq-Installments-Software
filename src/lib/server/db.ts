import pg from 'pg';
import { env } from '$env/dynamic/private';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function healthCheck() {
  const client = await pool.connect();
  try {
    const result = await client.query('select now() as now');
    return result.rows[0];
  } finally {
    client.release();
  }
}
