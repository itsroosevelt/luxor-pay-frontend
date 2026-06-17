# Luxor Pay — Frontend

Next.js App Router: dashboard merchant, checkout, wallet adapter.

## Estructura

```
frontend/src/
├── app/              # rutas (dashboard, pay, login)
├── components/       # UI compartida + SolanaProvider
├── hooks/
└── lib/              # API client, Firebase, env
```

Integración con `external/wallet-adapter`: ver [../external/README.md](../external/README.md).

## Desarrollo

```bash
npm run dev:frontend   # desde la raíz del monorepo
```

Variables: `frontend/.env.local` (plantilla en `config/env/web.development.example`).

