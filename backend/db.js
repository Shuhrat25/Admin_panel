const { Pool } = require('pg');

// Если есть ссылка из облака (DATABASE_URL), используем её. Иначе - локальную базу.
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/user_management';

const pool = new Pool({
  connectionString,
  // SSL нужен для подключения к облачным базам данных
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.connect((err) => {
  if (err) console.error('Ошибка подключения к БД:', err.message);
  else console.log('Успешное подключение к PostgreSQL!');
});

module.exports = pool;