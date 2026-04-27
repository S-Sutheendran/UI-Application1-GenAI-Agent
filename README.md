# FitCoach Pro — AI-Powered Fitness Coach Platform

A full-stack fitness coaching platform built with **React + TypeScript** (frontend) and **Python FastAPI** (backend), featuring OTP-based authentication, dual-database architecture (SQL + MongoDB), real-time analytics, and Playwright E2E testing.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start (Local — No Docker)](#quick-start-local--no-docker)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Frontend Pages & Routes](#frontend-pages--routes)
- [Authentication Flow](#authentication-flow)
- [Database Schema](#database-schema)
- [Testing with Playwright](#testing-with-playwright)
- [Troubleshooting](#troubleshooting)

---

## Overview

FitCoach Pro is a coach-facing SaaS platform that allows fitness coaches to:

- **Log in via OTP** (phone number + 6-digit one-time password)
- **Manage their portfolio** — bio, specialization, certifications, ratings
- **Manage clients** — onboard, track progress, compliance, streaks
- **Assign workout plans** — weekly programs with exercises per day
- **Create meal plans** — macros (protein, carbs, fat, calories) per day
- **Track insights & habits** — 7-day habit grids, AI-driven recommendations
- **View performance analytics** — charts for session completion, compliance trends, leaderboards

In development mode, the OTP is returned directly in the API response (no Twilio SMS required), making local development frictionless.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser / Client                    │
│           React 18 + TypeScript + Vite (port 3000)      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Zustand  │ │  React   │ │ Recharts │ │   Framer   │ │
│  │  Auth    │ │  Query   │ │ Analytics│ │   Motion   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP + JWT (Bearer)
                         │ Axios interceptor
┌────────────────────────▼────────────────────────────────┐
│                 FastAPI Backend (port 8000)              │
│         Python 3.12 + Pydantic v2 + SQLAlchemy 2        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │  /auth   │ │  /coach  │ │ /clients │ │ /workouts  │ │
│  │  /meals  │ │/insights │ │          │ │            │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
└───────────┬──────────────────────────┬──────────────────┘
            │ SQLAlchemy async          │ Motor async
┌───────────▼──────┐        ┌──────────▼──────────────────┐
│  SQLite / PgSQL  │        │  MongoDB / mongomock (dev)   │
│  - coaches       │        │  - workout_plans             │
│  - clients       │        │  - meal_plans                │
│  - otp_records   │        │  - insights                  │
└──────────────────┘        │  - progress_snapshots        │
                            └─────────────────────────────-┘
```

**Data storage split:**
| Store | What lives here |
|---|---|
| SQLite / PostgreSQL | Coaches, Clients, OTP records (structured, relational) |
| MongoDB (mocked in dev) | Workout plans, Meal plans, Insights, Progress snapshots (flexible documents) |

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| fastapi | 0.111.0 | Async web framework |
| uvicorn[standard] | 0.29.0 | ASGI server |
| sqlalchemy[asyncio] | 2.0.29 | Async ORM for SQL |
| aiosqlite | 0.20.0 | SQLite async driver (dev) |
| asyncpg | — | PostgreSQL async driver (prod) |
| motor | 3.7.1 | Async MongoDB driver |
| pymongo | 4.17.0 | MongoDB sync driver (bson types) |
| mongomock-motor | 0.0.21 | In-memory MongoDB mock (dev) |
| pydantic[email] | 2.7.1 | Data validation & serialization |
| pydantic-settings | 2.2.1 | Environment-based config |
| python-jose[cryptography] | 3.3.0 | JWT token creation/verification |
| bcrypt | 3.2.2 | Password/OTP hashing |
| python-multipart | 0.0.9 | Form data parsing |
| alembic | 1.13.1 | Database migrations |
| httpx | 0.27.0 | Async HTTP client |
| python-dotenv | 1.0.1 | `.env` file loading |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| react + react-dom | ^18.3.1 | UI framework |
| react-router-dom | ^6.23.1 | Client-side routing |
| axios | ^1.7.2 | HTTP client with interceptors |
| zustand | ^4.5.2 | Lightweight state management |
| @tanstack/react-query | ^5.40.0 | Server state / data fetching |
| recharts | ^2.12.7 | Charts (Line, Bar, Radar) |
| framer-motion | ^11.2.10 | Animations & page transitions |
| react-hot-toast | ^2.4.1 | Toast notifications |
| lucide-react | ^0.390.0 | Icon library |
| tailwindcss | ^3.4.4 | Utility-first CSS |
| typescript | ^5.4.5 | Type safety |
| vite | ^5.2.13 | Build tool & dev server |

### Testing
| Package | Purpose |
|---|---|
| @playwright/test | E2E browser automation |
| Chromium, Firefox, Pixel 7 | Multi-browser/device coverage |

---

## Project Structure

```
UI-Application1-GenAI-Agent/
│
├── docker-compose.yml           # 5-service orchestration (postgres, mongo, redis, backend, frontend)
├── README.md
│
├── backend/
│   ├── main.py                  # FastAPI app entry point, CORS, lifespan
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile               # python:3.12-slim image
│   ├── .env                     # Local environment variables (not committed)
│   ├── .env.example             # Template for environment setup
│   ├── fitness_coach.db         # SQLite database (auto-created, dev only)
│   └── app/
│       ├── api/v1/
│       │   ├── router.py        # Aggregates all endpoint routers
│       │   └── endpoints/
│       │       ├── auth.py      # POST /send-otp, POST /verify-otp
│       │       ├── coach.py     # GET/PUT /coach/me, GET /coach/me/stats
│       │       ├── clients.py   # CRUD /clients, /clients/{id}
│       │       ├── workouts.py  # CRUD /workouts (MongoDB)
│       │       ├── meals.py     # CRUD /meals (MongoDB)
│       │       └── insights.py  # /insights/client/{id} + /progress (MongoDB)
│       ├── core/
│       │   ├── config.py        # Pydantic Settings (reads .env)
│       │   ├── database.py      # SQLAlchemy engine + Motor client setup
│       │   ├── deps.py          # get_current_coach() FastAPI dependency
│       │   └── security.py      # JWT create/verify, bcrypt hash/verify
│       ├── models/sql/
│       │   ├── coach.py         # Coach SQLAlchemy model
│       │   ├── client.py        # Client SQLAlchemy model
│       │   └── otp.py           # OTPRecord SQLAlchemy model
│       ├── schemas/
│       │   ├── auth.py          # SendOTPRequest, VerifyOTPRequest, TokenResponse
│       │   ├── coach.py         # CoachOut, CoachStats
│       │   ├── client.py        # ClientCreate, ClientUpdate, ClientOut
│       │   ├── workout.py       # Exercise, WorkoutDay, WorkoutPlanCreate
│       │   ├── meal.py          # FoodItem, MealEntry, DailyMealPlan, MealPlanCreate
│       │   └── insight.py       # HabitEntry, PerformanceEntry, ProgressSnapshot
│       └── services/
│           ├── otp_service.py   # create_otp(), verify_otp() with bcrypt + expiry
│           └── mongo_service.py # WorkoutService, MealService, InsightService
│
├── frontend/
│   ├── index.html
│   ├── vite.config.ts           # Vite + @ alias + /api proxy to :8000
│   ├── tailwind.config.js       # Neon theme: #00ff87, glassmorphism, animations
│   ├── postcss.config.js
│   ├── .env                     # VITE_API_BASE_URL
│   └── src/
│       ├── App.tsx              # Routes + QueryClient + ProtectedRoute
│       ├── main.tsx
│       ├── index.css            # Tailwind layers + glass-card, neon-btn, etc.
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Layout.tsx   # Sidebar + Navbar + <Outlet />
│       │   │   ├── Sidebar.tsx  # Navigation with active state
│       │   │   └── Navbar.tsx   # Search, bell, coach avatar
│       │   └── ui/
│       │       ├── OTPInput.tsx # 6 individual inputs with focus mgmt + paste
│       │       ├── PhoneInput.tsx # Country code dropdown (90+ countries)
│       │       ├── StatCard.tsx # Metric card with trend indicator
│       │       └── Badge.tsx    # Status badge (success/warning/error/info)
│       ├── pages/
│       │   ├── auth/LoginPage.tsx         # 3-step OTP flow
│       │   ├── dashboard/DashboardPage.tsx # Coach portfolio + KPI cards
│       │   ├── clients/ClientsPage.tsx    # Client grid + search/filter + modal
│       │   ├── clients/ClientDetailPage.tsx # Charts + workout/meal lists
│       │   ├── workouts/WorkoutsPage.tsx  # Expandable workout plan cards
│       │   ├── meals/MealsPage.tsx        # Macro ring + quick templates
│       │   ├── performance/PerformancePage.tsx # Bar/Line/Radar charts + leaderboard
│       │   └── insights/InsightsPage.tsx  # Habit tracker + AI recommendations
│       ├── services/api.ts      # Axios instance + authApi, coachApi, clientsApi, …
│       ├── store/authStore.ts   # Zustand persist: token, coachId, isAuthenticated
│       ├── hooks/useCoach.ts    # React Query hooks for coach data
│       ├── types/index.ts       # TypeScript interfaces for all entities
│       └── utils/countryCodes.ts # 90+ countries with flag emoji + dial code
│
└── tests/
    ├── playwright.config.ts     # 4 projects: setup + chromium + firefox + mobile
    ├── package.json
    ├── tsconfig.json
    ├── e2e/
    │   ├── setup/auth.setup.ts  # Global auth fixture (login once, reuse state)
    │   ├── auth.spec.ts         # 15 auth flow tests
    │   ├── dashboard.spec.ts    # Dashboard & navigation tests
    │   ├── clients.spec.ts      # Client CRUD & search tests
    │   ├── workouts.spec.ts     # Workout plan tests
    │   ├── meals.spec.ts        # Meal plan tests
    │   ├── performance.spec.ts  # Analytics page tests
    │   └── insights.spec.ts     # Habit tracker tests
    ├── pages/
    │   ├── LoginPage.ts         # Page Object Model for login
    │   └── DashboardPage.ts     # Page Object Model for dashboard
    └── fixtures/
        └── test-data.ts         # TEST_PHONE, TEST_CLIENT, TEST_WORKOUT_PLAN, …
```

---

## Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Python | 3.12 | Required for async type hints |
| Node.js | 18+ | v24 tested |
| npm | 8+ | |
| Git | any | |
| Docker + Docker Compose | v2.x | Optional — for full stack orchestration |

---

## Quick Start (Local — No Docker)

This setup uses **SQLite** (no PostgreSQL needed) and an **in-memory MongoDB mock** (no MongoDB needed). Everything works offline.

### 1. Clone and navigate

```bash
git clone <repo-url>
cd UI-Application1-GenAI-Agent
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env         # Windows
# cp .env.example .env         # macOS/Linux
```

The default `.env` values work out of the box for local development:

```env
DATABASE_URL=sqlite+aiosqlite:///./fitness_coach.db
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=fitness_coach
SECRET_KEY=dev-secret-key-local-testing-only-change-in-prod
ENVIRONMENT=development
```

### 3. Start the backend

```bash
# From the backend/ directory, with venv activated:
uvicorn main:app --host 0.0.0.0 --port 8000

# On first run, SQLite tables are auto-created (coaches, clients, otp_records)
```

Verify: [http://localhost:8000/health](http://localhost:8000/health) → `{"status":"healthy"}`

Interactive API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

App available at: [http://localhost:3000](http://localhost:3000)

### 5. Log in

1. Open [http://localhost:3000](http://localhost:3000)
2. Select your country code from the dropdown (default: India +91)
3. Enter any phone number (e.g. `9876543210`)
4. Click **Send OTP** — the 6-digit code appears on screen in dev mode
5. Enter the OTP in the 6-box input and click **Verify**
6. You're now logged in as a new coach

---

## Docker Setup

Use Docker Compose to run the full stack including PostgreSQL, MongoDB, and Redis.

### Requirements
- Docker Desktop installed and running
- Docker Compose v2

### Steps

```bash
# From project root
cp backend/.env.example backend/.env

# Start all services
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop all services
docker compose down

# Stop and remove volumes (wipes database data)
docker compose down -v
```

### Services

| Service | Port | Description |
|---|---|---|
| frontend | 3000 | React app (nginx) |
| backend | 8000 | FastAPI server |
| postgres | 5432 | PostgreSQL 16 |
| mongodb | 27017 | MongoDB 7 |
| redis | 6379 | Redis 7 (cache) |

> **Note:** When using Docker, update `backend/.env` to use `postgresql+asyncpg://...` instead of SQLite, and set `ENVIRONMENT=production` to disable the MongoDB mock.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default (Dev) | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite+aiosqlite:///./fitness_coach.db` | SQL database connection. Use `postgresql+asyncpg://user:pass@host/db` for PostgreSQL |
| `MONGODB_URL` | `mongodb://localhost:27017` | MongoDB connection string (only used when `ENVIRONMENT != development`) |
| `MONGODB_DB_NAME` | `fitness_coach` | MongoDB database name |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection (reserved for future caching) |
| `SECRET_KEY` | `dev-secret-key-...` | JWT signing key — **must be changed in production** |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT TTL (24 hours) |
| `OTP_EXPIRE_MINUTES` | `10` | OTP validity window |
| `ENVIRONMENT` | `development` | Controls dev OTP response + MongoDB mock |
| `TWILIO_ACCOUNT_SID` | _(empty)_ | Twilio credentials for production SMS |
| `TWILIO_AUTH_TOKEN` | _(empty)_ | Twilio auth token |
| `TWILIO_FROM_NUMBER` | _(empty)_ | Twilio sender phone number |

> In `ENVIRONMENT=development`, the OTP is returned in the API response body (`dev_otp` field). No SMS is sent.

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Backend API base URL |

---

## API Reference

All endpoints are prefixed with `/api/v1`. Protected endpoints require `Authorization: Bearer <token>` header.

### Health

```
GET /health
```
Returns `{"status": "healthy", "service": "Fitness Coach Platform API"}`

---

### Authentication

#### Send OTP
```
POST /api/v1/auth/send-otp
```

**Request body:**
```json
{
  "phone_country_code": "+91",
  "phone_number": "9876543210"
}
```

**Response (200):**
```json
{
  "message": "OTP sent successfully",
  "phone_full": "+91****210",
  "dev_otp": "123456"     // Only present when ENVIRONMENT=development
}
```

---

#### Verify OTP
```
POST /api/v1/auth/verify-otp
```

**Request body:**
```json
{
  "phone_country_code": "+91",
  "phone_number": "9876543210",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "coach_id": 1,
  "is_new_coach": true
}
```

> First-time login auto-creates a coach account with the phone number.
> OTPs expire after 10 minutes and are locked after 5 incorrect attempts.

---

### Coach

All routes require authentication.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/coach/me` | Get current coach profile |
| `PUT` | `/api/v1/coach/me` | Update coach profile (name, bio, specialization, etc.) |
| `GET` | `/api/v1/coach/me/stats` | Aggregated stats |

**GET /coach/me response:**
```json
{
  "id": 1,
  "full_name": "Jane Smith",
  "phone_country_code": "+91",
  "phone_number": "9876543210",
  "email": "jane@example.com",
  "bio": "10 years experience in strength training",
  "specialization": "Strength & Conditioning",
  "experience_years": 10,
  "certifications": "NASM-CPT, CSCS",
  "avatar_url": null,
  "cover_url": null,
  "rating": 4.8,
  "total_clients": 12,
  "total_sessions": 240,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00"
}
```

**GET /coach/me/stats response:**
```json
{
  "total_clients": 12,
  "active_clients": 10,
  "total_sessions": 240,
  "avg_compliance": 87.5,
  "avg_rating": 4.8,
  "monthly_revenue": 0.0,
  "workouts_assigned": 25,
  "meal_plans_created": 18
}
```

---

### Clients

All routes require authentication. Coaches can only access their own clients.

| Method | Path | Status | Description |
|---|---|---|---|
| `GET` | `/api/v1/clients` | 200 | List all clients |
| `POST` | `/api/v1/clients` | 201 | Create new client |
| `GET` | `/api/v1/clients/{id}` | 200 | Get client by ID |
| `PUT` | `/api/v1/clients/{id}` | 200 | Update client |
| `DELETE` | `/api/v1/clients/{id}` | 204 | Delete client |

**POST /clients request body:**
```json
{
  "full_name": "Alex Johnson",
  "email": "alex@example.com",
  "phone": "+1-555-0100",
  "date_of_birth": "1995-06-15",
  "gender": "male",
  "height_cm": 180,
  "weight_kg": 80,
  "fitness_goal": "Build muscle",
  "fitness_level": "intermediate",
  "health_conditions": "None"
}
```

**fitness_level values:** `beginner` | `intermediate` | `advanced` | `elite`

---

### Workout Plans

Stored in MongoDB. Require authentication.

| Method | Path | Status | Description |
|---|---|---|---|
| `POST` | `/api/v1/workouts` | 201 | Create workout plan |
| `GET` | `/api/v1/workouts` | 200 | List all coach's plans |
| `GET` | `/api/v1/workouts/client/{id}` | 200 | List plans for a client |
| `GET` | `/api/v1/workouts/{plan_id}` | 200 | Get specific plan |
| `DELETE` | `/api/v1/workouts/{plan_id}` | 204 | Delete plan |

**POST /workouts request body:**
```json
{
  "client_id": 1,
  "title": "12-Week Hypertrophy Program",
  "goal": "muscle_gain",
  "weeks": 12,
  "days_per_week": 4,
  "days": [
    {
      "day_name": "Monday",
      "focus": "Chest & Triceps",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "rest_seconds": 90,
          "notes": "Progressive overload each week"
        }
      ]
    }
  ]
}
```

---

### Meal Plans

Stored in MongoDB. Require authentication.

| Method | Path | Status | Description |
|---|---|---|---|
| `POST` | `/api/v1/meals` | 201 | Create meal plan |
| `GET` | `/api/v1/meals` | 200 | List all coach's plans |
| `GET` | `/api/v1/meals/client/{id}` | 200 | List plans for a client |

**POST /meals request body:**
```json
{
  "client_id": 1,
  "title": "Fat Loss Phase - Week 1",
  "goal": "fat_loss",
  "daily_plans": [
    {
      "day": "Monday",
      "target_calories": 1800,
      "target_protein_g": 160,
      "target_carbs_g": 150,
      "target_fat_g": 55,
      "meals": [
        {
          "meal_name": "Breakfast",
          "time": "08:00",
          "food_items": [
            { "name": "Oats", "quantity": "80g", "calories": 300, "protein_g": 10, "carbs_g": 54, "fat_g": 6 }
          ]
        }
      ]
    }
  ]
}
```

---

### Insights & Progress

Stored in MongoDB. Require authentication.

| Method | Path | Status | Description |
|---|---|---|---|
| `PUT` | `/api/v1/insights/client/{id}` | 200 | Upsert client insight document |
| `GET` | `/api/v1/insights/client/{id}` | 200 | Get client insight |
| `POST` | `/api/v1/insights/client/{id}/progress` | 201 | Add progress snapshot |
| `GET` | `/api/v1/insights/client/{id}/progress` | 200 | Get full progress history |

**PUT /insights request body:**
```json
{
  "habits": [
    { "name": "Morning Workout", "completed_days": [true, true, false, true, true, false, true] },
    { "name": "Water Intake (3L)", "completed_days": [true, false, true, true, true, true, false] }
  ],
  "recommendations": [
    {
      "type": "nutrition",
      "priority": "high",
      "title": "Increase protein intake",
      "description": "Current protein is 20% below target. Aim for 160g/day."
    }
  ],
  "recovery_score": 78,
  "stress_level": 45,
  "sleep_hours": 7.5,
  "hrv": 62
}
```

---

## Frontend Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/login` | LoginPage | OTP authentication (public) |
| `/dashboard` | DashboardPage | Coach portfolio + KPI cards + recent clients |
| `/clients` | ClientsPage | Client grid with search, filters, add client modal |
| `/clients/:id` | ClientDetailPage | Client stats, progress charts, workout & meal lists |
| `/workouts` | WorkoutsPage | Workout plan cards with expandable day-exercise view |
| `/meals` | MealsPage | Macro ring visualization + quick templates |
| `/performance` | PerformancePage | Bar/Line/Radar charts + compliance leaderboard |
| `/insights` | InsightsPage | 7-day habit tracker + AI recommendations + health metrics |
| `*` | — | Redirects to `/dashboard` |

Unauthenticated users are redirected to `/login` by the `ProtectedRoute` wrapper.

---

## Authentication Flow

```
User enters phone number
        │
        ▼
POST /api/v1/auth/send-otp
  → Generates 6-digit OTP
  → bcrypt-hashes the OTP
  → Stores in otp_records (SQLite) with 10-min expiry
  → Dev mode: returns dev_otp in response body
        │
        ▼
User enters OTP in 6-box input
        │
        ▼
POST /api/v1/auth/verify-otp
  → Checks expiry, attempts (max 5), hash match
  → If new phone: auto-creates Coach record
  → Returns signed JWT (24-hour TTL)
        │
        ▼
Frontend stores token in localStorage (key: fcp_token)
Zustand authStore: { isAuthenticated: true, coachId: 1 }
        │
        ▼
All subsequent requests:
  Axios interceptor → Authorization: Bearer <token>
  FastAPI dependency → get_current_coach() validates JWT
```

**Security notes:**
- OTPs are bcrypt-hashed — never stored in plaintext
- OTPs expire in 10 minutes
- Maximum 5 verification attempts per OTP
- Used OTPs are marked and cannot be reused
- JWTs are signed with HS256 and expire in 24 hours
- 401 responses automatically clear token and redirect to `/login`

---

## Database Schema

### SQL Tables (SQLite / PostgreSQL)

#### `coaches`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| full_name | VARCHAR(150) | |
| phone_country_code | VARCHAR(10) | e.g. "+91" |
| phone_number | VARCHAR(20) | UNIQUE, indexed |
| email | VARCHAR(255) | Optional, UNIQUE |
| bio | TEXT | Coach description |
| specialization | VARCHAR(200) | |
| experience_years | INTEGER | Default 0 |
| certifications | TEXT | Free text |
| avatar_url | VARCHAR(500) | |
| cover_url | VARCHAR(500) | |
| rating | FLOAT | Default 0.0 |
| total_clients | INTEGER | Default 0 |
| total_sessions | INTEGER | Default 0 |
| is_active | BOOLEAN | Default true |
| created_at | DATETIME | |
| updated_at | DATETIME | Auto-updated |

#### `clients`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| coach_id | INTEGER FK | → coaches.id, indexed |
| full_name | VARCHAR(150) | |
| email | VARCHAR(255) | Optional |
| phone | VARCHAR(30) | Optional |
| date_of_birth | DATE | Optional |
| gender | VARCHAR(20) | Optional |
| height_cm | FLOAT | Optional |
| weight_kg | FLOAT | Optional |
| fitness_goal | VARCHAR(200) | |
| fitness_level | VARCHAR(50) | beginner/intermediate/advanced/elite |
| health_conditions | TEXT | Optional |
| is_active | BOOLEAN | Default true |
| streak_days | INTEGER | Default 0 |
| compliance_rate | FLOAT | Default 0.0 |
| joined_at | DATETIME | |
| last_active | DATETIME | Optional |
| created_at | DATETIME | |

#### `otp_records`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| phone_full | VARCHAR(30) | Indexed (e.g. "+919876543210") |
| otp_hash | VARCHAR(255) | bcrypt hash |
| is_used | BOOLEAN | Default false |
| attempts | INTEGER | Default 0, max 5 |
| created_at | DATETIME | |
| expires_at | DATETIME | created_at + 10 minutes |

### MongoDB Collections

#### `workout_plans`
```json
{
  "_id": ObjectId,
  "coach_id": 1,
  "client_id": 1,
  "title": "string",
  "goal": "string",
  "weeks": 12,
  "days_per_week": 4,
  "days": [ { "day_name": "...", "focus": "...", "exercises": [...] } ],
  "is_active": true,
  "created_at": ISODate
}
```

#### `meal_plans`
```json
{
  "_id": ObjectId,
  "coach_id": 1,
  "client_id": 1,
  "title": "string",
  "goal": "string",
  "daily_plans": [ { "day": "...", "target_calories": 2000, "meals": [...] } ],
  "is_active": true,
  "created_at": ISODate
}
```

#### `insights`
```json
{
  "_id": ObjectId,
  "coach_id": 1,
  "client_id": 1,
  "habits": [ { "name": "...", "completed_days": [bool x7] } ],
  "recommendations": [ { "type": "...", "priority": "high|medium|low", ... } ],
  "recovery_score": 78,
  "stress_level": 45,
  "sleep_hours": 7.5,
  "hrv": 62,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

#### `progress_snapshots`
```json
{
  "_id": ObjectId,
  "coach_id": 1,
  "client_id": 1,
  "weight_kg": 78.5,
  "body_fat_pct": 18.2,
  "muscle_mass_kg": 64.1,
  "recorded_at": ISODate
}
```

---

## Testing with Playwright

E2E tests are in the `tests/` directory, using Page Object Models and stored auth state.

### Setup

```bash
cd tests
npm install
npx playwright install        # Download browser binaries (Chromium, Firefox, Webkit)
```

### Run all tests

```bash
# Run against running dev servers (start backend + frontend first)
npx playwright test

# Run with UI (interactive test runner)
npx playwright test --ui

# Run specific file
npx playwright test e2e/auth.spec.ts

# Run on a single browser
npx playwright test --project=chromium
```

### Test projects

| Project | Browser | Auth state |
|---|---|---|
| `setup` | Chromium | Logs in, saves `playwright/.auth/coach.json` |
| `chromium` | Chromium | Uses saved auth state |
| `firefox` | Firefox | Uses saved auth state |
| `mobile-chrome` | Pixel 7 (375px) | Uses saved auth state |
| `auth-tests` | Chromium | No auth state (tests the login flow itself) |

### Test coverage

| File | Tests | What's covered |
|---|---|---|
| `auth.spec.ts` | 15 | Page render, country dropdown, OTP send/verify, digit entry, clipboard paste, disabled states, back nav, resend timer, invalid OTP error, redirect |
| `dashboard.spec.ts` | 8 | Coach hero, stat cards, quick actions, sidebar navigation, logout |
| `clients.spec.ts` | 10 | Page render, add client modal, form validation, client creation, search, level filter |
| `workouts.spec.ts` | 6 | Page render, create modal, goal options, week selector, plan expansion |
| `meals.spec.ts` | 6 | Page render, create modal, macro templates, macro ring SVG |
| `performance.spec.ts` | 5 | KPI cards, chart sections present |
| `insights.spec.ts` | 7 | Client selector, empty state, habit tracker, AI recommendations, health indicators |

### Test data (fixtures/test-data.ts)

```typescript
TEST_PHONE = "9876543210"
TEST_OTP   = "123456"       // Used with dev_otp from API
TEST_CLIENT = { full_name: "Test Athlete", email: "athlete@test.com", ... }
```

### Global auth setup

`e2e/setup/auth.setup.ts` logs in once via the dev OTP, then saves browser storage state to `playwright/.auth/coach.json`. All test suites (except `auth-tests`) re-use this saved state — no repeated logins.

---

## Troubleshooting

### Backend won't start

**`ModuleNotFoundError: No module named 'bson'`**
```bash
pip install pymongo
```

**`ImportError: cannot import name '_QUERY_OPTIONS' from 'pymongo.cursor'`**
Motor/pymongo version mismatch. Fix:
```bash
pip install "motor>=3.6"
```

**`ValueError: password cannot be longer than 72 bytes`** (passlib + bcrypt)
This project uses bcrypt directly — do not install passlib. If passlib is present:
```bash
pip uninstall passlib
```

**Port 8000 already in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <pid> /F
```

---

### Frontend won't compile

**`The 'hover:bg-white/8' class does not exist`**
Tailwind opacity `/8` is non-standard in `@apply`. This was fixed — ensure `src/index.css` does not use `bg-white/8` in `@apply` directives.

**`Cannot find module '@/components/...'`**
The `@` alias is configured in `vite.config.ts`. Run `npm install` and ensure TypeScript config has the path mapping.

---

### Database issues

**SQLite file locked:**
Stop the backend server (`Ctrl+C`) before running migrations or accessing the file from another process.

**MongoDB collections empty after restart:**
In `ENVIRONMENT=development`, `mongomock-motor` uses an in-memory store that resets on every server restart. This is expected — data persists only during the server session. For persistent MongoDB data locally, set `ENVIRONMENT=production` and run a local MongoDB instance (or use Docker Compose).

---

### OTP issues

- **OTP not appearing on screen:** Ensure `ENVIRONMENT=development` is set in `backend/.env`
- **OTP expired:** OTPs expire after 10 minutes. Click "Resend OTP" for a new one
- **Invalid OTP:** Maximum 5 attempts. If locked, request a new OTP
- **Phone validation error:** Phone number must be 6–15 digits (country code is separate)

---

## Development Tips

### Running with auto-reload (backend)

Use `--reload-dir app` to watch only your app code, not the venv:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload --reload-dir app
```

### API documentation

FastAPI auto-generates interactive docs:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Testing the API directly (curl)

```bash
# Send OTP
curl -X POST http://localhost:8000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_country_code":"+91","phone_number":"9876543210"}'

# Verify OTP (use dev_otp from previous response)
curl -X POST http://localhost:8000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_country_code":"+91","phone_number":"9876543210","otp":"123456"}'

# Get coach profile (use access_token from previous response)
curl http://localhost:8000/api/v1/coach/me \
  -H "Authorization: Bearer <access_token>"
```

### Switching to PostgreSQL

1. Install asyncpg: `pip install asyncpg`
2. Update `backend/.env`:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/fitness_coach
   ENVIRONMENT=production
   ```
3. Run `alembic upgrade head` to apply migrations (or let SQLAlchemy auto-create tables)
4. For MongoDB, set `ENVIRONMENT=production` and ensure a real MongoDB instance is running

---

## License

MIT License — see [LICENSE](LICENSE) for details.
