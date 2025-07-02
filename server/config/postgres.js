import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

export const pgClient = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

export const testPgConnection = async () => {
  try {
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL');
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
  }
};
