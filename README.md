# Luxor Pay — Frontend

Standalone Next.js App Router app: merchant dashboard, checkout, and Solana wallet adapter.

## Structure

```
src/
├── app/              # Routes (dashboard, pay, login)
├── components/       # Shared UI + SolanaProvider
├── hooks/
└── lib/              # API client, Firebase, env helpers
```

## Quick start

```bash
npm install
cp .env.example .env.local
```

Fill in Firebase values in `.env.local` (see [`.env.example`](.env.example)). For local UI without the backend API, uncomment:

```bash
NEXT_PUBLIC_FRONTEND_ONLY=true
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| File | Purpose |
|------|---------|
| [`.env.example`](.env.example) | Minimal template — copy to `.env.local` |
| [`web.development.example`](web.development.example) | Full local development variable set |
| [`VERCEL-ENV.md`](VERCEL-ENV.md) | Vercel deployment variables and troubleshooting |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run test` | Unit tests (Vitest) |

## Vercel

Set **Root Directory** to `.` (this repo is the frontend app, not a monorepo subfolder).

See [`VERCEL-ENV.md`](VERCEL-ENV.md) for required `NEXT_PUBLIC_*` variables and redeploy notes.
