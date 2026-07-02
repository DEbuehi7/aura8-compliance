# Aura8 Compliance System

CCBill compliance review dashboard for Sinisha to audit Aura8 content.

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/DEbuehi7/aura8-compliance.git
cd aura8-compliance
npm install
```

### 2. Set Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Login Credentials (Testing)

| Field    | Value              |
|----------|--------------------|
| Username | `ccbill_auditor`   |
| Password | `Aura8CCBill2024!` |

---

## Environment Variables

| Variable                        | Description                    | Required |
|---------------------------------|--------------------------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL      | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key  | Yes      |

---

## Deploy to Vercel

### Option A — Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `DEbuehi7/aura8-compliance` GitHub repository
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**
5. In your Vercel project settings → **Domains**, add `aura8.fun`

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                          # Login page (/)
│   ├── layout.tsx                        # Root layout
│   ├── globals.css                       # Global styles (Tailwind v4)
│   ├── dashboard/
│   │   └── page.tsx                      # Compliance dashboard (/dashboard)
│   └── api/
│       └── auth/
│           └── compliance-login/
│               └── route.ts              # POST /api/auth/compliance-login
└── lib/
    └── supabase.ts                       # Supabase client
```

## Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (data)
- **bcryptjs** (password hashing)
