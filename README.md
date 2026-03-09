# SmartRealty

A full-stack property listing and management platform built with **Django REST Framework** and **Next.js 14**. Features AI-powered property search, role-based dashboards, image uploads, interactive maps, and a real-time enquiry system.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Seed Data](#seed-data)
- [Demo Credentials](#demo-credentials)
- [API Reference](#api-reference)
- [Feature Overview](#feature-overview)
- [User Roles](#user-roles)
- [Running Tests](#running-tests)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│                                                                  │
│   Next.js 14 (App Router)  ←→  TanStack Query  ←→  Zustand     │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS / JSON
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              Django REST Framework  (port 8000)                  │
│                                                                  │
│   JWT Auth   Properties   Chatbot   Analytics   Enquiries        │
│                    │                    │                        │
│              PostgreSQL           OpenAI / Anthropic             │
│                    │                                             │
│              Pillow (images)   Redis (Celery tasks)              │
└─────────────────────────────────────────────────────────────────┘
```

**Request flow:**
1. Next.js Edge Middleware checks the `smartrealty-auth` cookie on every request — unauthenticated users are redirected server-side before any page renders.
2. Client components fetch data via TanStack Query hooks which call the Django API.
3. Django validates JWT tokens, applies role-based permissions, and returns JSON.
4. Images are stored locally in development; switch to S3 in production via `django-storages`.

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| Django | 5.0.6 | Web framework |
| djangorestframework | 3.15.2 | REST API |
| djangorestframework-simplejwt | 5.3.1 | JWT authentication |
| django-cors-headers | 4.4.0 | CORS for Next.js dev |
| django-filter | 24.2 | Query filtering |
| psycopg2-binary | 2.9.9 | PostgreSQL adapter |
| Pillow | 10.4.0 | Image processing + thumbnails |
| openai / anthropic | latest | AI chatbot |
| drf-spectacular | 0.27.2 | Swagger / ReDoc docs |
| celery + redis | 5.4 / 5.0.8 | Async tasks |
| gunicorn + whitenoise | latest | Production server |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| Next.js | 14.2.5 | React framework (App Router) |
| TanStack Query | 5.x | Server state + caching |
| Zustand | 4.x | Client state (auth, filters) |
| react-hook-form + zod | 7.x / 3.x | Form validation |
| axios | 1.7 | HTTP client + JWT interceptor |
| Tailwind CSS | 3.4 | Utility-first styling |
| lucide-react | 0.408 | Icons |
| react-hot-toast | 2.4 | Toast notifications |

---

## Project Structure

```
smart-realty/
├── backend/
│   ├── apps/
│   │   ├── accounts/        # User model, JWT auth, registration
│   │   ├── properties/      # Property CRUD, images, save/unsave, amenities
│   │   ├── chatbot/         # AI conversation with filter extraction
│   │   ├── enquiries/       # Contact-agent enquiry system
│   │   ├── analytics/       # Dashboard stats, property breakdowns, audit log
│   │   └── audit/           # Request audit log middleware
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   └── urls.py
│   ├── requirements.txt
│   └── manage.py
│
└── frontend/
    └── src/
        ├── app/
        │   ├── auth/            # login, register
        │   ├── properties/      # listing + [id] detail
        │   ├── chatbot/         # AI search
        │   └── dashboard/       # admin, agent, client, profile
        ├── components/
        │   ├── ui/              # Button, Input, Badge, Spinner, Skeleton
        │   ├── layout/          # Navbar
        │   ├── property/        # Card, Form, Map, EnquiryForm, ImageUpload
        │   ├── dashboard/       # StatCard, DataTable
        │   └── auth/            # AuthGuard
        ├── lib/
        │   ├── api/             # axios API clients per domain
        │   ├── hooks/           # TanStack Query hooks
        │   ├── types/           # Shared TypeScript interfaces
        │   └── utils/           # cn, formatPrice, timeAgo, etc.
        └── store/               # Zustand stores (auth, filters)
```

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis (optional — only for Celery tasks)

### 1 — Backend

```bash
cd smart-realty/backend

python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — set SECRET_KEY, DATABASE_URL, and DEBUG=True

python manage.py migrate
python manage.py seed_amenities
python manage.py seed_users
python manage.py seed_properties

python manage.py runserver
# → http://localhost:8000
```

### 2 — Frontend

```bash
cd smart-realty/frontend

npm install
cp .env.example .env.local
# Edit .env.local if backend runs on a different port

npm run dev
# → http://localhost:3000
```

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `SECRET_KEY` | ✅ | — | Django secret key |
| `DEBUG` | ✅ | `False` | Enable debug mode |
| `DATABASE_URL` | ✅ | `postgres://localhost/smart_realty` | PostgreSQL connection string |
| `ALLOWED_HOSTS` | ✅ | `localhost,127.0.0.1` | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | ✅ | `http://localhost:3000` | Next.js origin |
| `OPENAI_API_KEY` | ⚠️ | — | Required for AI chatbot |
| `ANTHROPIC_API_KEY` | ⚠️ | — | Alternative AI provider |
| `REDIS_URL` | optional | `redis://localhost:6379/0` | Celery broker |
| `AWS_ACCESS_KEY_ID` | optional | — | S3 image storage |
| `AWS_SECRET_ACCESS_KEY` | optional | — | S3 image storage |
| `AWS_STORAGE_BUCKET_NAME` | optional | — | S3 bucket name |

### Frontend — `frontend/.env.local`

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:8000` | Django backend URL |
| `NEXT_PUBLIC_APP_NAME` | optional | `SmartRealty` | App display name |

---

## Seed Data

```bash
cd smart-realty/backend

# Amenity lookup data (wifi, parking, gym, pool, etc.)
python manage.py seed_amenities

# Demo users — 1 admin, 2 agents, 3 clients
python manage.py seed_users

# ~30 sample property listings with varied data
python manage.py seed_properties
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@smartrealty.dev | `Admin@1234` |
| **Agent** | agent1@smartrealty.dev | `Agent@1234` |
| **Agent** | agent2@smartrealty.dev | `Agent@1234` |
| **Client** | client1@smartrealty.dev | `Client@1234` |

---

## API Reference

Base URL: `http://localhost:8000/api/v1/`

Interactive docs: [Swagger UI](http://localhost:8000/api/docs/) · [ReDoc](http://localhost:8000/api/redoc/)

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register/` | Public | Create account |
| `POST` | `/auth/login/` | Public | Returns `access`, `refresh`, and `user` |
| `POST` | `/auth/token/refresh/` | Public | Refresh access token |
| `POST` | `/auth/token/logout/` | Public | Blacklist refresh token |
| `GET` | `/auth/me/` | Bearer | Get own profile |
| `PATCH` | `/auth/me/` | Bearer | Update name, phone, avatar |
| `GET` | `/auth/users/` | Admin | List all users |

### Properties

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/properties/` | Public | Paginated, filterable list |
| `POST` | `/properties/` | Agent/Admin | Create listing |
| `GET` | `/properties/<id>/` | Public | Property detail (increments views) |
| `PATCH` | `/properties/<id>/` | Owner/Admin | Update listing |
| `DELETE` | `/properties/<id>/` | Owner/Admin | Delete listing |
| `GET` | `/properties/featured/` | Public | Top 8 featured listings |
| `GET` | `/properties/saved/` | Bearer | Current user's saved properties |
| `POST` | `/properties/<id>/save/` | Bearer | Save a property |
| `DELETE` | `/properties/<id>/save/` | Bearer | Unsave a property |
| `POST` | `/properties/<id>/images/` | Owner/Admin | Upload images (field: `images`) |
| `GET` | `/properties/amenities/` | Public | All available amenities |

**Filter parameters for `GET /properties/`:**

| Param | Type | Example |
|---|---|---|
| `city` | string | `?city=Nairobi` |
| `neighborhood` | string | `?neighborhood=Westlands` |
| `property_type` | enum | `?property_type=apartment` |
| `status` | enum | `?status=available` |
| `bedrooms` | integer | `?bedrooms=2` |
| `min_price` | number | `?min_price=50000` |
| `max_price` | number | `?max_price=150000` |
| `is_featured` | boolean | `?is_featured=true` |
| `search` | string | `?search=westlands studio` |
| `ordering` | string | `?ordering=-price` |
| `page` | integer | `?page=2` |

### Enquiries

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/enquiries/` | Public | Submit an enquiry |
| `GET` | `/enquiries/` | Bearer | Agent: own listings. Admin: all |
| `GET` | `/enquiries/<id>/` | Owner/Admin | Enquiry detail |
| `PATCH` | `/enquiries/<id>/` | Owner/Admin | Update status |

**Enquiry status flow:** `new` → `read` → `replied` → `archived`

### Chatbot

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/chatbot/` | Public | Send message, returns AI reply + extracted filters |
| `GET` | `/chatbot/sessions/` | Bearer | List own chat sessions |
| `GET` | `/chatbot/sessions/<id>/` | Bearer | Session with full message history |

### Analytics (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/dashboard/` | Platform-wide stats |
| `GET` | `/analytics/properties/` | Breakdown by type, status, city |
| `GET` | `/analytics/audit-logs/` | Paginated API request audit log |

---

## Feature Overview

| Feature | Status |
|---|---|
| JWT authentication (login, register, refresh, logout) | ✅ |
| Role-based access (admin / agent / client) | ✅ |
| Server-side route protection (Next.js Edge Middleware) | ✅ |
| Property listings with filtering, sorting, pagination | ✅ |
| Property detail with image gallery slider | ✅ |
| Property image upload (drag-and-drop, multi-file) | ✅ |
| Auto-generated image thumbnails (Pillow) | ✅ |
| Interactive map embed (OpenStreetMap, no API key) | ✅ |
| Save / unsave properties | ✅ |
| AI-powered chatbot with natural language filter extraction | ✅ |
| Enquiry system (contact form + agent inbox) | ✅ |
| Admin dashboard — live stats, charts, audit log | ✅ |
| Agent dashboard — listings table, create / edit / delete | ✅ |
| Client dashboard — saved properties, quick actions | ✅ |
| Profile editor (name, phone, password) | ✅ |
| Loading skeletons per route | ✅ |
| Error boundaries per route | ✅ |
| API documentation (Swagger + ReDoc) | ✅ |
| 77 backend tests (pytest) | ✅ |

---

## User Roles

| Capability | Admin | Agent | Client | Anonymous |
|---|---|---|---|---|
| Browse & view properties | ✅ | ✅ | ✅ | ✅ |
| Submit enquiry | ✅ | ✅ | ✅ | ✅ |
| Use AI chatbot | ✅ | ✅ | ✅ | ✅ |
| Save properties | ✅ | ✅ | ✅ | ❌ |
| Create / edit listings | ✅ | ✅ | ❌ | ❌ |
| Delete own listings | ✅ | ✅ | ❌ | ❌ |
| View enquiries on own listings | ✅ | ✅ | ❌ | ❌ |
| View all enquiries | ✅ | ❌ | ❌ | ❌ |
| Access admin dashboard | ✅ | ❌ | ❌ | ❌ |
| View analytics + audit log | ✅ | ❌ | ❌ | ❌ |
| Manage all users | ✅ | ❌ | ❌ | ❌ |

---

## Running Tests

```bash
cd smart-realty/backend

# Run all 77 tests
pytest

# Verbose output
pytest -v

# Single app
pytest apps/properties/tests/ -v

# With coverage report
pytest --cov=apps --cov-report=term-missing
```

| App | Tests | What's covered |
|---|---|---|
| accounts | 18 | Auth, registration, profile, user management |
| properties | 32 | CRUD, filters, images, save/unsave, featured |
| chatbot | 12 | Session management, AI responses, filter extraction |
| analytics | 15 | Dashboard stats, property breakdown, audit log |
| **Total** | **77** | All passing ✅ |