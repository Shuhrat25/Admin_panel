const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/user_management';
const schema = process.env.DB_SCHEMA || 'public';
if (!/^[a-z_][a-z0-9_]*$/.test(schema)) throw new Error('Invalid DB_SCHEMA');

const pool = new Pool({
  connectionString,
  options: `-c search_path=${schema}`,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.initialize = async () => {
  if (process.env.AUTO_INIT_DB !== 'true') return;
  await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'unverified',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
};

module.exports = pool;
