# Aura8 Compliance System

CCBill compliance review dashboard built with Next.js 15, React 19, and Tailwind CSS.

## Features

- 🔐 **Secure Login** — Username/password authentication with bcryptjs
- 📊 **Dashboard** — Compliance overview with tabbed interface
- 🔍 **Protected Routes** — Session-based access control
- 🎨 **Dark Theme** — Professional dark UI with pink accents
- ⚡ **Zero Dependencies** — Minimal, lean codebase

## Tech Stack

- Next.js 15.3.4
- React 19.2.7
- TypeScript
- Tailwind CSS v4
- Supabase
- bcryptjs

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ktbulbreqyzimxvxlqvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Credentials (Testing)

| Field | Value |
|---|---|
| **Username** | `ccbill_auditor` |
| **Password** | `Aura8CCBill2024!` |

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import this GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy
6. Add custom domain `aura8.fun` in Vercel project settings
7. Update DNS at your domain registrar to point to Vercel

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Login page
│   ├── dashboard/
│   │   └── page.tsx          # Protected dashboard
│   ├── api/
│   │   └── auth/
│   │       └── compliance-login/
│   │           └── route.ts   # Auth endpoint
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── lib/
│   └── supabase.ts           # Supabase client
```

## License

Private — Aura8 Compliance System
