const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db'); // Наш файл подключения к PostgreSQL

const app = express();
const PORT = 3000;

// Настройка Middleware
app.use(cors()); // Разрешаем фронтенду (порт 5173) делать запросы к бэкенду (порт 3000)
app.use(express.json()); // Учим сервер понимать JSON-данные из React

// --- 1. Эндпоинт Регистрации ---
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Хэшируем пароль для безопасности (даже если он из 1 символа)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Пытаемся записать пользователя в БД
    // Если email уже существует, PostgreSQL САМА заблокирует запись благодаря нашему уникальному индексу
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, status",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'Registration successful', user: newUser.rows[0] });
  } catch (err) {
    // Код 23505 в PostgreSQL — это ошибка нарушения уникальности (Unique Violation)
    if (err.code === '23505') {
      return res.status(400).json({ error: 'E-mail already exists' });
    }
    console.error('Ошибка регистрации:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- 2. Эндпоинт Авторизации (Login) ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Ищем пользователя по email
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Проверяем, не заблокирован ли пользователь
    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account is blocked' });
    }

    // Сверяем пароли
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Обновляем время последнего входа (last_login)
    await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);

    // Возвращаем данные пользователя (без пароля!)
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Ошибка входа:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Промежуточное ПО (Middleware) для проверки статуса пользователя ---
// Оно будет выполняться перед каждым запросом к панели управления
const checkUserStatus = async (req, res, next) => {
  // Для простоты мы будем передавать ID текущего пользователя в заголовках
  const userId = req.headers['x-user-id']; 
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query("SELECT status FROM users WHERE id = $1", [userId]);
    
    // Если пользователя удалили из БД
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User deleted', redirect: true });
    }
    
    // Если пользователя заблокировали
    if (result.rows[0].status === 'blocked') {
      return res.status(403).json({ error: 'User blocked', redirect: true });
    }

    // Если всё хорошо — пропускаем запрос дальше
    next();
  } catch (err) {
    console.error('Ошибка проверки статуса:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- 3. Получение списка всех пользователей ---
app.get('/api/users', checkUserStatus, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, status, last_login FROM users ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// --- 4. Блокировка пользователей ---
app.put('/api/users/block', checkUserStatus, async (req, res) => {
  const { userIds } = req.body; // Массив ID пользователей, которых нужно заблокировать
  if (!userIds || userIds.length === 0) return res.status(400).json({ error: 'No users selected' });

  try {
    await pool.query("UPDATE users SET status = 'blocked' WHERE id = ANY($1::int[])", [userIds]);
    res.json({ message: 'Users blocked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to block users' });
  }
});

// --- 5. Разблокировка пользователей ---
app.put('/api/users/unblock', checkUserStatus, async (req, res) => {
  const { userIds } = req.body;
  if (!userIds || userIds.length === 0) return res.status(400).json({ error: 'No users selected' });

  try {
    await pool.query("UPDATE users SET status = 'active' WHERE id = ANY($1::int[])", [userIds]);
    res.json({ message: 'Users unblocked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unblock users' });
  }
});

// --- 6. Удаление пользователей ---
app.delete('/api/users/delete', checkUserStatus, async (req, res) => {
  const { userIds } = req.body;
  if (!userIds || userIds.length === 0) return res.status(400).json({ error: 'No users selected' });

  try {
    // В задании сказано: Deleted users should be deleted, not "marked". 
    // Поэтому используем физическое удаление DELETE, а не UPDATE.
    await pool.query("DELETE FROM users WHERE id = ANY($1::int[])", [userIds]);
    res.json({ message: 'Users deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Бэкенд сервер успешно запущен на http://localhost:${PORT}`);
});