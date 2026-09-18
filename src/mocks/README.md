# Frontend Mock Mode

Run the entire Sterling Pay UI with **no backend and no Firebase** — for
maquetación, visual QA, and demos.

## Enable

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Restart `npm run dev`. A green **“MOCK MODE · no backend”** badge appears
bottom-left. Set the flag to `false` (or remove it) to return to the real
integration — no other change is needed.

## What it does

| Concern | Real mode | Mock mode |
|---|---|---|
| Auth (`@/lib/firebase` → `auth`) | Firebase | `src/lib/mock/mock-auth.ts` — simulated **Demo User** session (`7xKX…gAsU`) |
| REST calls (`fetch(apiUrl(...))`) | Next `/api/backend/*` proxy → NestJS | intercepted in the browser by `src/lib/mock/mock-fetch.ts`, answered from `src/mocks/handlers.ts` + `src/mocks/data.ts` |
| Jupiter price API | `api.jup.ag` | stubbed from `MOCK_PRICES_USD` |
| KYC / Onramp sockets | socket.io | short-circuited to a simulated “success” |
| Login page “Sign in” / “Continue with Google” | Firebase auth | instant redirect to `/dashboard` with the mock session |

Protected routes (`/dashboard/*`) are reachable directly because
`auth.currentUser` is always the Demo User (until a soft “Sign out”, which is
persisted in `sessionStorage` so the landing/login flow can still be demoed).

## Files

- `src/lib/mock/mock-config.ts` — the `IS_MOCK_MODE` flag (only always-imported file)
- `src/lib/mock/mock-auth.ts` — simulated Firebase `auth`
- `src/lib/mock/mock-fetch.ts` — `window.fetch` interceptor
- `src/mocks/data.ts` — all fixtures (Overview, Swap, Payment Links/Requests, Transactions, Contacts, Settings, API keys, balances)
- `src/mocks/handlers.ts` — path → response router (with in-memory create/update/delete)
- `src/context/MockModeProvider.tsx` — installs the interceptor + renders the badge; mounted from `src/app/layout.tsx` **only** when the flag is on (guarded `next/dynamic`)

## Adding an endpoint

Add a branch to `resolveMock()` in `handlers.ts`. Paths are backend-relative
with the `/api/backend` proxy prefix already stripped (e.g. `/merchants/me`).
Return `{ status, body }`. Unmapped backend routes return `404` so components
fall back to their normal empty/error states.
