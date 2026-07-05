const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, status",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'Registration successful', user: newUser.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'E-mail already exists' });
    }
    console.error('Ошибка регистрации:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account is blocked' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);

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

const checkUserStatus = async (req, res, next) => {
  const userId = req.headers['x-user-id']; 
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query("SELECT status FROM users WHERE id = $1", [userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User deleted', redirect: true });
    }
    
    if (result.rows[0].status === 'blocked') {
      return res.status(403).json({ error: 'User blocked', redirect: true });
    }

    next();
  } catch (err) {
    console.error('Ошибка проверки статуса:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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

app.put('/api/users/block', checkUserStatus, async (req, res) => {
  const { userIds } = req.body; 
  if (!userIds || userIds.length === 0) return res.status(400).json({ error: 'No users selected' });

  try {
    await pool.query("UPDATE users SET status = 'blocked' WHERE id = ANY($1::int[])", [userIds]);
    res.json({ message: 'Users blocked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to block users' });
  }
});

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

app.delete('/api/users/delete', checkUserStatus, async (req, res) => {
  const { userIds } = req.body;
  if (!userIds || userIds.length === 0) return res.status(400).json({ error: 'No users selected' });

  try {
    await pool.query("DELETE FROM users WHERE id = ANY($1::int[])", [userIds]);
    res.json({ message: 'Users deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete users' });
  }
});
app.listen(PORT, () => {
  console.log(`Бэкенд сервер успешно запущен на http://localhost:${PORT}`);
});