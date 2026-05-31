# Variables Vercel — copiar en dashboard

## ⚠️ Error común: "Firebase env vars missing"

Las variables `NEXT_PUBLIC_*` se **incrustan en el build**. Si faltan al hacer deploy, el login no funciona aunque las agregues después sin redeploy.

### Pasos obligatorios

1. **Proyecto Vercel correcto** — cada repo tiene su propio proyecto:
   - `luxor-pay-frontend-staging` → repo `luxor-pay-frontend`, rama `develop`
   - `luxor-pay-frontend-prod` → repo `luxor-pay-frontend`, rama `main`

2. **Environment = Production** (no solo Preview)
   - Staging usa rama `develop` como **Production Branch** → variables en **Production**
   - Prod usa rama `main` como **Production Branch** → variables en **Production**
   - Marca también **Preview** si quieres PR previews, pero **Production es obligatorio**

3. **Agregar las 6 variables Firebase** (sin espacios al inicio/final)

4. **Redeploy** — Deployments → ⋮ → Redeploy (idealmente sin cache)

---

## Staging (`luxor-pay-gateway-dev`)

Proyecto Vercel: **luxor-pay-frontend-staging**  
Environment: **Production** (+ Preview opcional)

| Variable | Valor |
|----------|--------|
| `LUXOR_ENV` | `staging` |
| `NEXT_PUBLIC_LUXOR_ENV` | `staging` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | *(Firebase Console → dev → Web app)* |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `luxor-pay-gateway-dev.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `luxor-pay-gateway-dev` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `luxor-pay-gateway-dev.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | *(Firebase Console)* |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | *(Firebase Console)* |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | *(opcional)* |
| `NEXT_PUBLIC_API_URL` | `https://placeholder.example.com` *(hasta tener backend)* |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `mainnet-beta` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | *(Helius RPC, opcional para login)* |

---

## Production (`luxor-pay-gateway`)

Proyecto Vercel: **luxor-pay-frontend-prod**  
Environment: **Production**

| Variable | Valor |
|----------|--------|
| `LUXOR_ENV` | `production` |
| `NEXT_PUBLIC_LUXOR_ENV` | `production` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | *(Firebase Console → prod → Web app)* |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `luxor-pay-gateway.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `luxor-pay-gateway` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `luxor-pay-gateway.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | *(Firebase Console)* |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | *(Firebase Console)* |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | *(opcional)* |
| `NEXT_PUBLIC_API_URL` | `https://api.tu-dominio.com` |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `mainnet-beta` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | *(Helius RPC)* |

---

## Verificar que funcionó

Tras redeploy, en `/login` **no** debe aparecer el banner amarillo.  
Si aparece, lista exactamente qué `NEXT_PUBLIC_FIREBASE_*` faltan.
