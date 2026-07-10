# Aura8 Compliance System

CCBill compliance review portal built with Next.js 15, React 19, Supabase, and Vercel.

## Features

- 🔐 **JWT Authentication** — HS256 signed tokens, bcrypt password verification
- 📊 **Real-time Metrics** — `GET /api/metrics` returns live performance data
- 🛡️ **Rate Limiting** — 10 attempts / 15 min per IP (CCBill compliance)
- 📋 **Audit Log** — Every login attempt written to Supabase (immutable)
- 🚀 **One-click Deploy** — Standard Next.js on Vercel, no custom routing

## API Reference

### POST /api/auth/compliance-login

Validates credentials and returns a signed JWT.

**Request**
```json
{ "username": "ccbill_aura8", "password": "<password>" }
```

**Success (200)**
```json
{
  "token": "<HS256-JWT>",
  "expiresIn": 3600,
  "user": { "username": "ccbill_aura8", "role": "ccbill_reviewer", "organization": "CCBill" },
  "metrics": { "dbQueryTime": 45, "totalTime": 112 }
}
```

**Response headers**
```
X-Response-Time: 112ms
X-DB-Query-Time: 45ms
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
```

**Failure responses**

| Status | Body |
|--------|------|
| 400 | `{"error":"Username and password required"}` |
| 401 | `{"error":"Invalid credentials"}` |
| 429 | `{"error":"Too many login attempts. Try again later."}` |
| 500 | `{"error":"Server configuration error"}` |

---

### GET /api/metrics

Returns real-time performance stats for the last 24 hours.

**Response (200)**
```json
{
  "period": "24h",
  "logins": {
    "total": 42,
    "successful": 40,
    "failed": 2,
    "successRate": "95.24%"
  },
  "performance": {
    "avgDbQueryTimeMs": "48.50",
    "maxDbQueryTimeMs": 120,
    "avgResponseTimeMs": "115.20",
    "maxResponseTimeMs": 340
  },
  "slaTargets": {
    "successRateTarget": ">=95%",
    "avgDbQueryTimeTarget": "<200ms",
    "avgResponseTimeTarget": "<500ms"
  },
  "recentActivity": [],
  "timestamp": "2026-07-10T05:00:00.000Z"
}
```

---

## Setup

### Prerequisites

- Node.js 18+
- Supabase project

### 1 — Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Generate with: openssl rand -hex 32
JWT_SECRET=your-jwt-secret-here
```

> **Vercel**: add all four variables in **Project Settings > Environment Variables**.

### 2 — Database setup

Run `supabase/migrations/001_compliance_schema.sql` once in the Supabase SQL editor.
This creates:
- `compliance_accounts` — authorised portal users
- `compliance_audit_log` — append-only CCBill audit trail
- Seed row for `ccbill_aura8`

### 3 — Install and run

```bash
npm install
npm run dev   # http://localhost:3000
```

### 4 — Deploy to Vercel

```bash
git push origin main   # Vercel auto-deploys on push
```

Make sure all four env vars are set in Vercel before deploying.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Login page
│   ├── dashboard/
│   │   └── page.tsx                    # Protected dashboard
│   ├── api/
│   │   ├── auth/
│   │   │   └── compliance-login/
│   │   │       └── route.ts            # POST login -> JWT
│   │   └── metrics/
│   │       └── route.ts                # GET real-time metrics
│   └── layout.tsx                      # Root layout
├── lib/
│   └── supabase.ts                     # Supabase client helper
└── monitoring-config.ts                # Scaling roadmap constants

supabase/
└── migrations/
    └── 001_compliance_schema.sql       # DB schema + seed
```

## Scaling Roadmap

| Phase | Target | Trigger |
|-------|--------|---------|
| **v1** (now) | Baseline metrics | — |
| **v2** | 2.5x concurrent users | avg query > 300 ms |
| **v3** | 5,000 customers / 500 concurrent | avg response > 800 ms |

## License

Private — Aura8 Compliance System
