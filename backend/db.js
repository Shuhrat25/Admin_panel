const { Pool } = require('pg');

// Настройки подключения к твоей локальной базе PostgreSQL
const pool = new Pool({
  user: 'postgres',         // стандартный пользователь
  host: 'localhost',
  database: 'user_management', // имя базы, которую мы создали
  password: '1234',   // замени на пароль из шага установки
  port: 5432,               // стандартный порт
});

// Проверка подключения
pool.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к PostgreSQL:', err.message);
  } else {
    console.log('Успешное подключение к базе данных PostgreSQL!');
  }
});

module.exports = pool;