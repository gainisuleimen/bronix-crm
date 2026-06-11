# CRM Diplom (Fullstack)

Простой каркас fullstack CRM-системы для дипломной работы.

## Стек

- Frontend: React + Vite + TypeScript + Tailwind CSS + React Router + Axios
- Backend: FastAPI + SQLAlchemy + JWT (каркас) 
- Database: PostgreSQL

## Структура

```text
crm-diplom/
  backend/
    app/
      api/
      core/
      db/
      models/
      schemas/
    .env.example
    main.py
    database.py
    requirements.txt
  frontend/
    src/
      api/
      routes/
    .env.example
    index.html
    package.json
    postcss.config.js
    tailwind.config.js
    tsconfig.json
    vite.config.ts
```

## Запуск PostgreSQL локально (без Docker)

1) Установите PostgreSQL и создайте БД:
- database: `crm_diplom`
- user/password: любые (по умолчанию в примере `postgres/postgres`)

2) Обновите строку подключения:
- `backend/.env` (создайте из `backend/.env.example`)

Пример:

```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/crm_diplom
JWT_SECRET=change_me_in_real_env
JWT_ALGORITHM=HS256
```

## Запуск backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell:
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn main:app --reload
```

Проверка: `GET http://127.0.0.1:8000/health`

Документация API: `http://127.0.0.1:8000/docs`

## Авторизация (JWT)

При старте backend автоматически:
- создаёт таблицы в PostgreSQL;
- добавляет роли `admin` и `manager`.

### Эндпоинты

| Метод | URL | Доступ |
|-------|-----|--------|
| POST | `/auth/register` | публичный |
| POST | `/auth/login` | публичный |
| GET | `/auth/me` | JWT (Bearer) |
| GET | `/api/profile` | JWT + middleware |
| GET | `/api/manager/dashboard` | роль admin или manager |
| GET | `/api/admin/dashboard` | только admin |

### Пример регистрации

```json
POST /auth/register
{
  "email": "manager@crm.local",
  "password": "secret12",
  "full_name": "Иван Менеджер",
  "role": "manager"
}
```

### Пример логина

```json
POST /auth/login
{
  "email": "manager@crm.local",
  "password": "secret12"
}
```

Ответ:

```json
{
  "access_token": "...",
  "token_type": "bearer"
}
```

### Защищённые запросы

Заголовок:

```http
Authorization: Bearer <access_token>
```

## Клиенты (CRUD)

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/clients?search=текст` | Список + поиск |
| GET | `/api/clients/{id}` | Один клиент |
| POST | `/api/clients` | Создание |
| PUT | `/api/clients/{id}` | Редактирование |
| DELETE | `/api/clients/{id}` | Удаление |

На фронтенде: `http://localhost:5173/clients` (нужен вход).

## Заявки (CRUD)

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/leads?search=&status=&client_id=` | Список + фильтры |
| GET | `/api/leads/{id}` | Одна заявка |
| POST | `/api/leads` | Создание |
| PUT | `/api/leads/{id}` | Редактирование |
| DELETE | `/api/leads/{id}` | Удаление |

Статусы: `new`, `in_progress`, `completed`, `cancelled`.

На фронтенде: `http://localhost:5173/leads` (нужен вход и хотя бы один клиент).

## Запуск frontend

```bash
cd frontend
npm install
npm run dev
```

Откройте `http://localhost:5173`:
- **Регистрация** — `/register`
- **Вход** — `/login`
- После входа откроется главная страница с профилем

JWT сохраняется в `localStorage` и автоматически отправляется в запросах.

Если нужно — задайте URL бекенда:
- `frontend/.env` (создайте из `frontend/.env.example`)

