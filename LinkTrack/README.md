# LinkTrack — URL Shortener with Analytics

A full-stack URL shortener (like Bitly) where users can:

- Shorten long URLs (with optional custom alias and expiry date)
- Share short links and QR codes
- Track every click: total clicks, daily chart, browser, device, country
- Manage links: edit title/alias, enable/disable, delete

**Stack:** React + Vite + Tailwind + Chart.js (frontend) · Node + Express + Prisma + PostgreSQL + JWT (backend)

```
LinkTrack/
├── backend/      ← Express API (port 5000)
└── frontend/     ← React app (port 5173)
```

---

## 1. Prerequisites

Install these once on your machine:

- **Node.js 18 or higher** — https://nodejs.org
- **PostgreSQL 14 or higher** — https://www.postgresql.org/download/
- **Git** (optional, only if you cloned this repo)

Check that everything is installed:

```bash
node -v
npm -v
psql --version
```

---

## 2. Create the database

Open a terminal and start `psql`, then create the database:

```bash
psql -U postgres
```

Inside `psql`:

```sql
CREATE DATABASE linktrack;
\q
```

> Note your PostgreSQL username and password — you will need them in the next step.

---

## 3. Backend setup

Open **Terminal 1** and run:

```bash
cd LinkTrack/backend

# 1. Copy environment template and edit it
cp .env.example .env
# (Windows PowerShell:  Copy-Item .env.example .env  )

# 2. Open .env and fill in:
#    DATABASE_URL  — use your postgres user/password
#    JWT_SECRET    — any long random string (e.g. run: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")

# 3. Install dependencies
npm install

# 4. Create database tables with Prisma
npx prisma migrate dev --name init

# 5. Start the dev server
npm run dev
```

You should see:

```
LinkTrack API running on http://localhost:5000
```

Leave this terminal running.

### Example `.env`

```env
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/linktrack?schema=public"
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
```

---

## 4. Frontend setup

Open **Terminal 2** (keep Terminal 1 running) and run:

```bash
cd LinkTrack/frontend

# 1. Copy environment template
cp .env.example .env
# (Windows PowerShell:  Copy-Item .env.example .env  )

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

You should see:

```
  VITE v5.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## 5. Try it out

1. Click **Get started** to register an account.
2. After login you land on the dashboard.
3. Click **+ New short link**, paste a long URL, and create your first link.
4. Open the short URL in another tab — it redirects, and a click is tracked.
5. Go to **My links** → click **Stats** to see analytics for that link.
6. Click **QR** to download a QR code.

---

## 6. API reference

All `/api/*` routes (except register/login) require `Authorization: Bearer <token>`.

| Method | Path                     | Description                          |
| ------ | ------------------------ | ------------------------------------ |
| POST   | `/api/auth/register`     | Create account                       |
| POST   | `/api/auth/login`        | Get JWT                              |
| GET    | `/api/auth/me`           | Current user                         |
| POST   | `/api/urls`              | Create short link                    |
| GET    | `/api/urls`              | List my links                        |
| GET    | `/api/urls/:id`          | Get one link                         |
| PUT    | `/api/urls/:id`          | Update title / alias / enable / expire |
| DELETE | `/api/urls/:id`          | Delete link                          |
| GET    | `/api/analytics/summary` | Overall stats                        |
| GET    | `/api/analytics/url/:id` | Per-link analytics                   |
| GET    | `/:shortCode`            | Public redirect + click tracking     |

---

## 7. Database schema

Three tables (managed by Prisma):

- **users** — id, name, email, password (bcrypt), createdAt
- **urls** — id, userId, originalUrl, shortCode, customAlias, title, isActive, expiresAt, createdAt
- **clicks** — id, urlId, ipAddress, userAgent, browser, device, country, clickedAt

Inspect the data visually:

```bash
cd backend
npx prisma studio
```

---

## 8. Folder structure

```
backend/
├── prisma/
│   └── schema.prisma          ← DB models
├── src/
│   ├── config/db.js           ← PrismaClient singleton
│   ├── controllers/           ← auth, url, analytics, redirect
│   ├── middleware/            ← JWT auth, error handler
│   ├── routes/                ← route definitions
│   ├── utils/                 ← short code, UA parser, geoIP
│   ├── app.js                 ← Express app
│   └── server.js              ← entry point
└── .env.example

frontend/
├── src/
│   ├── api/axios.js           ← axios + JWT interceptor
│   ├── context/               ← Auth + Theme providers
│   ├── components/            ← Sidebar, Layout, Loader, QR modal, etc.
│   ├── pages/                 ← Landing, Login, Register, Dashboard,
│   │                            CreateLink, LinkManagement,
│   │                            LinkAnalytics, NotFound, Expired
│   ├── App.jsx                ← routes
│   ├── main.jsx               ← bootstraps providers
│   └── index.css              ← Tailwind layers
├── tailwind.config.js
├── vite.config.js
└── .env.example
```

---

## 9. Troubleshooting

**`Cannot find module 'src/server.js'`** — make sure you're inside `LinkTrack/backend` when you run `npm run dev`, and that `src/server.js` exists.

**`P1001: Can't reach database server`** — PostgreSQL isn't running, or `DATABASE_URL` is wrong. Start postgres and double-check the username, password, host, and port.

**`Migration failed`** — drop the database and recreate it, then re-run `npx prisma migrate dev`:
```sql
DROP DATABASE linktrack;
CREATE DATABASE linktrack;
```

**CORS error in the browser** — make sure `CLIENT_URL` in `backend/.env` matches the frontend origin (default `http://localhost:5173`).

**Country shows blank** — the `geoip-lite` database returns `null` for local/private IPs (e.g. `127.0.0.1`). It works for real public IPs.

**Port already in use** — change `PORT` in `backend/.env` (and update `VITE_API_URL` + `VITE_SHORT_URL_BASE` in `frontend/.env` to match).

---

## 10. Production notes

This is set up for local development. Before deploying:

- Use a strong `JWT_SECRET` (32+ random bytes).
- Run `npm run build` in `frontend/` and serve `dist/` from a CDN or static host.
- Run the backend behind HTTPS (use a reverse proxy like Nginx / Caddy).
- Use a managed Postgres database (Neon, Supabase, RDS, etc.).
- Set `NODE_ENV=production` on the backend.
