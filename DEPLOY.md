# Деплой CRM Diplom для защиты диплома

Схема: **Backend + PostgreSQL** на Render, **Frontend** на Render Static Site или Vercel.

```
Браузер → Frontend (Render/Vercel) → Backend API (Render) → PostgreSQL
```

**Два разных URL — не путайте:**

| Сервис | URL | Что открывать |
|--------|-----|---------------|
| Backend (API) | `https://bronix-crm.onrender.com` | Только для проверки: `/health`, `/docs` |
| **Frontend (сайт)** | `https://bronix-frontend.onrender.com` | **Это ваш CRM — открывайте его** |

Если на backend видите `{"detail":"Not Found"}` на главной — это нормально для старой версии; после обновления будет подсказка со ссылкой на frontend.

---

## Переменные окружения

### Backend (Render / Railway)

| Переменная | Обязательно | Пример |
|------------|-------------|--------|
| `ENVIRONMENT` | да | `production` |
| `DATABASE_URL` | да | `postgresql://user:pass@host:5432/db` (Render/Railway подставят сами) |
| `JWT_SECRET` | да | длинная случайная строка (32+ символов) |
| `JWT_ALGORITHM` | нет | `HS256` |
| `JWT_EXPIRE_MINUTES` | нет | `1440` |
| `FRONTEND_URL` | да | `https://your-app.vercel.app` |

`FRONTEND_URL` — URL frontend на Vercel **без** слэша в конце. Несколько доменов через запятую:
`https://app.vercel.app,https://app-git-main.vercel.app`

### Frontend (Vercel)

| Переменная | Обязательно | Пример |
|------------|-------------|--------|
| `VITE_API_URL` | да | `https://crm-diplom-api.onrender.com` |

Без слэша в конце. Задаётся **до сборки** — после изменения пересоберите проект на Vercel.

---

## 1. Backend на Render (рекомендуется)

### Вариант A: Blueprint (автоматически)

1. Залейте репозиторий на GitHub.
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Подключите репозиторий — Render прочитает `backend/render.yaml`.
4. Создастся PostgreSQL и Web Service.
5. После деплоя backend откройте сервис → **Environment** → задайте:
   - `FRONTEND_URL` = URL Vercel (пока можно placeholder, обновите после шага 3).

### Вариант B: Вручную

1. **New → PostgreSQL** (Free), имя БД: `crm_diplom`.
2. **New → Web Service**:
   - Root Directory: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips='*'`
   - Health Check Path: `/health`
3. Environment:
   ```
   ENVIRONMENT=production
   DATABASE_URL=<Internal Database URL из PostgreSQL>
   JWT_SECRET=<случайная строка>
   FRONTEND_URL=https://your-app.vercel.app
   ```

Проверка: `https://YOUR-API.onrender.com/health` → `{"status":"ok","database":"connected"}`

> **Free tier Render:** сервис «засыпает» после ~15 мин без запросов. Первый запрос может занять 30–60 сек.

> **Фото сотрудников:** хранятся на диске сервера. На free tier при redeploy файлы могут пропасть. Для защиты диплома обычно достаточно; для продакшена нужен S3/Cloudinary.

---

## 2. Backend на Railway (альтернатива)

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**.
2. Добавьте **PostgreSQL** в проект.
3. Web Service → Settings → **Root Directory**: `backend`.
4. Variables (Railway подставит `DATABASE_URL` из PostgreSQL):
   ```
   ENVIRONMENT=production
   JWT_SECRET=<случайная строка>
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Start command (если не подхватился из `railway.toml`):
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips='*'
   ```

---

## 3. Frontend на Render (Static Site)

1. **New → Static Site** → репозиторий `bronix-crm`.
2. **Root Directory:** `frontend`
3. **Build Command:** `npm install && npm run build`
4. **Publish Directory:** `dist`
5. **Environment Variables:**
   ```
   VITE_API_URL=https://YOUR-BACKEND.onrender.com
   ```
6. Deploy → скопируйте URL (например `https://bronix-frontend.onrender.com`).
7. В backend → **Environment** → `FRONTEND_URL` = этот URL → **Manual Deploy**.

Файл `frontend/public/_redirects` обеспечивает работу React Router при обновлении страницы.

---

## 4. Frontend на Vercel (альтернатива)

1. [vercel.com](https://vercel.com) → **Add New Project** → импорт GitHub-репозитория.
2. **Root Directory**: `frontend`
3. Framework: Vite (определится автоматически)
4. **Environment Variables**:
   ```
   VITE_API_URL=https://YOUR-API.onrender.com
   ```
5. Deploy.

6. Скопируйте URL Vercel (например `https://crm-diplom.vercel.app`) и обновите `FRONTEND_URL` на backend → **Redeploy** backend.

`frontend/vercel.json` уже настроен для SPA-роутинга (React Router).

---

## 4. Первый вход после деплоя

1. Откройте frontend URL.
2. Зарегистрируйте пользователя (**Register**).
3. Первый пользователь получит роль `admin` (если логика seed так устроена — проверьте auth).

Таблицы и миграции создаются **автоматически** при старте backend (`create_all` + `run_migrations` + seed ролей).

---

## 5. Локальная проверка production-сборки

```powershell
# Backend
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:ENVIRONMENT="development"
uvicorn main:app --host 127.0.0.1 --port 8000

# Frontend (другой терминал)
cd frontend
$env:VITE_API_URL="http://127.0.0.1:8000"
npm run build
npm run preview
```

---

## 6. Чеклист перед защитой

- [ ] `GET https://API/health` → ok + database connected
- [ ] Регистрация и вход работают
- [ ] CRUD клиентов и заявок
- [ ] Dashboard с аналитикой
- [ ] Обновление страницы (F5) на `/clients`, `/leads`, `/team` — не 404
- [ ] Фото команды сохраняются после перезагрузки
- [ ] `FRONTEND_URL` на backend = `https://bronix-frontend.onrender.com`
- [ ] `VITE_API_URL` на frontend = `https://bronix-crm.onrender.com`
- [ ] JWT_SECRET не `change_me`

---

## 7. Защита диплома: медленный старт и что открывать

### Нужно ли держать GitHub и Render открытыми?

**Нет.** Открытые вкладки GitHub/Render не ускоряют сайт.

Медленная загрузка — это **cold start** бесплатного Render: backend «засыпает» после ~15 мин без запросов. Первый заход может занять **30–60 секунд**.

**Перед защитой (за 2–3 минуты до выступления):**

1. Откройте в браузере: `https://bronix-crm.onrender.com/health` — дождитесь `{"status":"ok"}`
2. Затем откройте сайт: **https://bronix-frontend.onrender.com**
3. Войдите в аккаунт заранее

**Какие URL использовать:**

| URL | Назначение |
|-----|------------|
| `https://bronix-frontend.onrender.com` | **Сайт CRM — показывайте комиссии** |
| `https://bronix-crm.onrender.com` | Только API (не главная страница сайта) |

### Обновление страницы (Not Found)

После деплоя с `HashRouter` адрес будет вида `https://bronix-frontend.onrender.com/#/clients`.  
**Обновление (F5) на любой странице должно работать.**

Опционально в Render Dashboard → bronix-frontend → **Redirects/Rewrites**:
- Source: `/*`
- Destination: `/index.html`
- Action: **Rewrite**

### Фото команды

Фото хранятся **в PostgreSQL** (не на диске сервера), поэтому сохраняются после redeploy.  
После обновления backend **загрузите фото заново** — старые могли пропасть из-за ephemeral disk.

---

## Структура deploy-файлов

| Файл | Назначение |
|------|------------|
| `backend/render.yaml` | Blueprint для Render |
| `backend/railway.toml` | Конфиг Railway |
| `backend/Procfile` | Start command (Heroku/Render) |
| `backend/runtime.txt` | Python 3.12 |
| `backend/requirements.txt` | Python-зависимости |
| `frontend/vercel.json` | SPA rewrites |
| `backend/.env.example` | Шаблон env backend |
| `frontend/.env.example` | Шаблон env frontend |
