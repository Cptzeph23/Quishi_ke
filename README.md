# SmartRealty — Smart Real Estate Platform

## Stack
| Layer        | Technology                                         |
|---|---|
| Backend      | Django 5 + Django REST Framework                   |
| Auth         | JWT (SimpleJWT) — Admin / Agent / Client roles     |
| Database     | PostgreSQL 16                                      |
| Cache/Queue  | Redis + Celery                                     |
| AI Chatbot   | OpenAI GPT-4o-mini **or** Anthropic Claude (swap via .env) |
| Storage      | Local dev / AWS S3 production (swap via USE_S3=True) |
| Frontend     | Next.js 14 (App Router) + TypeScript               |
| Styling      | Tailwind CSS + DM Sans / Playfair Display          |
| State        | Zustand + TanStack Query                           |
| Charts       | Recharts                                           |

---



## Complete Directory Map

```
smart-realty/
├── README.md
│
├── backend/                                  Django project root
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example                          → copy to .env
│   │
│   ├── config/
│   │   ├── __init__.py                       Exposes celery app
│   │   ├── celery.py                         Celery app definition
│   │   ├── urls.py                           Root URL router
│   │   ├── wsgi.py                           Production WSGI entry
│   │   └── settings/
│   │       ├── base.py                       Shared settings
│   │       ├── development.py                Debug + relaxed throttle
│   │       └── production.py                 HTTPS + HSTS
│   │
│   └── apps/
│       ├── accounts/                         Custom User + auth
│       │   ├── models.py                     User (UUID pk, role field)
│       │   ├── serializers.py                Register / Login / Profile
│       │   ├── permissions.py                IsAdmin / IsAgentOrAdmin / IsOwnerOrAdmin
│       │   ├── views.py                      Register, Login, Me, UserList
│       │   ├── urls.py
│       │   └── migrations/
│       │
│       ├── properties/                       Property management
│       │   ├── models.py                     Property, Amenity, PropertyImage, SavedProperty
│       │   ├── serializers.py                PropertyList (light) + PropertyDetail (full)
│       │   ├── filters.py                    Price / beds / city / amenity filters
│       │   ├── views.py                      ViewSet + image upload + save toggle
│       │   ├── urls.py
│       │   └── migrations/
│       │
│       ├── chatbot/                          AI chatbot
│       │   ├── models.py                     ChatSession + ChatMessage
│       │   ├── services.py                   OpenAI / Anthropic pluggable layer
│       │   ├── serializers.py
│       │   ├── views.py                      POST (send) + GET (history)
│       │   ├── urls.py
│       │   └── migrations/
│       │
│       ├── analytics/                        Admin stats
│       │   ├── models.py                     (computed via queries)
│       │   ├── views.py                      Dashboard + PropertyStats + AuditLog viewer
│       │   └── urls.py
│       │
│       └── audit/                            Request audit trail
│           ├── models.py                     AuditLog (immutable)
│           ├── middleware.py                 Auto-records every mutating API call
│           ├── admin.py                      Read-only Django admin viewer
│           └── migrations/
│
└── frontend/                                 Next.js project
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── postcss.config.js
    ├── .env.example                          → copy to .env.local
    │
    └── src/
        ├── app/                              Next.js App Router
        │   ├── layout.tsx                   ← Phase C: root layout
        │   ├── page.tsx                     ← Phase C: landing page
        │   ├── auth/
        │   │   ├── login/page.tsx           ← Phase C
        │   │   └── register/page.tsx        ← Phase C
        │   ├── dashboard/
        │   │   ├── admin/page.tsx           ← Phase D
        │   │   ├── agent/page.tsx           ← Phase D
        │   │   └── client/page.tsx          ← Phase D
        │   ├── properties/
        │   │   ├── page.tsx                 ← Phase C
        │   │   └── detail/page.tsx          ← Phase C
        │   └── chatbot/
        │       └── page.tsx                 ← Phase E
        │
        ├── components/
        │   ├── ui/                          ← Phase C: Button, Input, Badge, Modal
        │   ├── layout/                      ← Phase C: Navbar, Sidebar, Footer
        │   ├── property/                    ← Phase C: PropertyCard, FilterBar, Gallery
        │   ├── chatbot/                     ← Phase E: ChatWindow, MessageBubble
        │   ├── dashboard/                   ← Phase D: StatsCard, Charts, Table
        │   └── auth/                        ← Phase C: LoginForm, RegisterForm, AuthGuard
        │
        ├── lib/
        │   ├── api/
        │   │   ├── client.ts                ✅ Axios + silent JWT refresh
        │   │   ├── auth.ts                  ✅ login, register, me, logout
        │   │   ├── properties.ts            ✅ CRUD, featured, saved, images
        │   │   ├── chatbot.ts               ✅ send, history
        │   │   └── analytics.ts             ✅ dashboard, stats, audit logs
        │   ├── hooks/                       ← Phase C: useProperties, useAuth, useChat
        │   ├── types/
        │   │   └── index.ts                 ✅ All TypeScript interfaces
        │   └── utils/
        │       └── index.ts                 ✅ cn(), formatPrice(), timeAgo()…
        │
        ├── store/
        │   ├── authStore.ts                 ✅ Zustand auth slice
        │   └── filterStore.ts               ✅ Zustand filter slice
        │
        └── styles/
            └── globals.css                  ✅ Tailwind + CSS vars + component classes
```

---


### 7. Redis + Celery (optional in Phase A — required in Phase F)

```bash
# Start Redis (macOS Homebrew)
brew services start redis

# Or Linux
redis-server --daemonize yes

# Start Celery worker (separate terminal)
cd backend && source venv/bin/activate
celery -A config worker -l info -c 2
```

---

## API Quick Reference

| Method     | Endpoint                        | Auth     | Description               |
|---|---|---|---|
| POST       | /api/v1/auth/register/          | Public   | Create account            |
| POST       | /api/v1/auth/login/             | Public   | Get tokens + user object  |
| POST       | /api/v1/auth/token/refresh/     | Public   | Refresh access token      |
| POST       | /api/v1/auth/token/logout/      | JWT      | Blacklist refresh token   |
| GET/PATCH  | /api/v1/auth/me/                | JWT      | View / update profile     |
| GET        | /api/v1/auth/users/             | Admin    | List all users            |
| GET        | /api/v1/properties/             | Public   | Filtered, paginated list  |
| POST       | /api/v1/properties/             | Agent+   | Create listing            |
| GET        | /api/v1/properties/{id}/        | Public   | Detail + view counter     |
| PATCH      | /api/v1/properties/{id}/        | Owner+   | Update listing            |
| DELETE     | /api/v1/properties/{id}/        | Owner+   | Remove listing            |
| GET        | /api/v1/properties/featured/    | Public   | 8 featured listings       |
| GET        | /api/v1/properties/saved/       | JWT      | User's saved listings     |
| POST       | /api/v1/properties/{id}/images/ | Agent+   | Upload property images    |
| POST/DEL   | /api/v1/properties/{id}/save/   | JWT      | Save / unsave             |
| GET        | /api/v1/properties/amenities/   | Public   | Amenity list              |
| POST       | /api/v1/chatbot/                | Optional | Send AI message           |
| GET        | /api/v1/chatbot/?session_id=    | Optional | Session history           |
| GET        | /api/v1/analytics/dashboard/    | Admin    | Platform stats            |
| GET        | /api/v1/analytics/properties/   | Admin    | Property breakdowns       |
| GET        | /api/v1/analytics/audit-logs/   | Admin    | Request audit trail       |

---

## Key Architecture Decisions

| Decision | Rationale |
|---|---|
| UUID primary keys | Safe for public URLs; no enumeration attacks |
| Custom User model from day 1 | Can't swap later without data migrations |
| Separate List/Detail serializers | 60% smaller list responses = faster page loads |
| `F()` for view counter | Atomic DB increment — no race condition |
| Pluggable AI provider | Switch `AI_PROVIDER=anthropic` in .env; zero code change |
| Audit middleware | Every mutation logged automatically; no manual logging needed |
| JWT token blacklist | Server-side logout actually works |
| `price_per_sqm` auto-computed | Always in sync with `price` and `area_sqm` |
| React Native ready | All data in the REST API — mobile just consumes same endpoints |