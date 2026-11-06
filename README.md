# NST Learning Hub (Full-stack Starter)

## Overview
A **React + Vite** frontend styled with **Tailwind CSS** and an **Express** backend with **PostgreSQL** and **JWT** authentication.

## Project layout
```
/frontend          – React app (Vite)
  src/
  tailwind.config.cjs
/backend           – Express server
  src/
    index.js      – Server entry point (CORS, JSON, health‑check)
    auth.js       – Signup / login routes + JWT middleware
  .env.example    – Env‑var template
README.md
```

## Getting started

### Prerequisites
- Node ≥ 20
- npm (or yarn)
- PostgreSQL instance (local or remote)

### Setup
```bash
# Clone the repo
git clone https://github.com/Sanchit07-dev/asd-major-project.git
cd asd-major-project

# Frontend
cd frontend
npm install
npm run dev   # http://localhost:5173

# Backend
cd ../backend
cp .env.example .env   # edit with your DB credentials & JWT secret
npm install
npm run dev   # http://localhost:5000
```

### Database
```sql
-- Run once to create the users table
CREATE TABLE users (
  id   SERIAL PRIMARY KEY,
  email    TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);
```

### API endpoints
| Method | Path            | Description |
|--------|-----------------|-------------|
| GET    | `/health`       | Health check – returns `{status:"ok"}` |
| POST   | `/signup`       | Register new user (`{email, password}`) |
| POST   | `/login`        | Authenticate (`{email, password}`) → returns `{token}` |
| GET    | `/protected`    | Requires `Authorization: Bearer <token>` |

#### Example `curl` requests
```bash
# Health check
curl http://localhost:5000/health

# Signup
curl -X POST http://localhost:5000/signup -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secret"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:5000/login -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secret"}' | jq -r .token)

# Protected route
curl http://localhost:5000/protected -H "Authorization: Bearer $TOKEN"
```

## License
MIT – feel free to adapt and extend.

