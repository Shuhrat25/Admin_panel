# Admin Workspace — управление пользователями

Учебное full-stack приложение с регистрацией, входом и таблицей пользователей. Демонстрирует фильтрацию, сортировку, пагинацию и массовую блокировку, разблокировку и удаление учётных записей.

[Открыть демо](https://admin-panel-seven-gold.vercel.app/)

## Стек и функции

React / Vite, React Router, React Bootstrap; Node.js / Express, PostgreSQL и bcrypt. Интерфейс поддерживает светлую и тёмную тему, выбор строк, поиск по имени/email и проверку статуса аккаунта при работе с API.

## Статус

Это учебная демонстрация. Текущая проверка пользователя передаёт `x-user-id`; она не заменяет защищённую серверную сессию или подписанный токен. Приложение не позиционируется как готовая защищённая корпоративная система. Для демо используйте вымышленные данные.

## Локальный запуск

Нужны Node.js/npm и PostgreSQL. Создайте локальную базу и таблицу:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL, 
    status VARCHAR(20) DEFAULT 'unverified',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
```

В окружении backend задайте `DATABASE_URL` своей базы. Затем:

```bash
cd backend
npm install
node server.js
```

Во втором терминале:

```bash
cd frontend
npm install
npm run dev
```

Backend использует `PORT` или `3000`. Адрес API на frontend задаётся через `VITE_API_URL` (по умолчанию используется опубликованный demo backend). Для локальной разработки установите `VITE_API_URL=http://localhost:3000` в `frontend/.env.local`.

Бесплатный Render backend может запускаться с задержкой после простоя. Постоянная база и полноценная модель авторизации требуют отдельной настройки перед реальным использованием.

## Отдельная схема demo-базы

На публичном демо используется отдельная схема `admin_workspace` в демонстрационной PostgreSQL-базе Render. `DB_SCHEMA` задаёт схему (по умолчанию `public`), а `AUTO_INIT_DB=true` создаёт отсутствующую схему и таблицу без очистки существующих строк. Это удобство запуска учебного прототипа; отдельные схемы не заменяют изоляцию прав production-приложений. Бесплатная demo-база имеет ограниченный срок действия и может потребовать переноса или повторного создания.
