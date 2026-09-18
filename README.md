# Sterling Pay — Frontend

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

# Notes for testing
this is the phone to try sms sends, it is virtual  +1 8777804236