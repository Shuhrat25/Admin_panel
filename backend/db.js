const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/user_management';

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.connect((err) => {
  if (err) console.error('Ошибка подключения к БД:', err.message);
  else console.log('Успешное подключение к PostgreSQL!');
});

module.exports = pool;