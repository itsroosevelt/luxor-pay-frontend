# Variables Vercel — copiar en dashboard

## Production (rama `main`)

Settings → Environment Variables → **Production**

```
LUXOR_ENV=production
NEXT_PUBLIC_LUXOR_ENV=production
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=TU_KEY
NEXT_PUBLIC_FIREBASE_PROJECT_ID=luxor-pay-gateway
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=luxor-pay-gateway.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=luxor-pay-gateway.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Preview / Staging (rama `develop`)

Settings → Environment Variables → **Preview** → Git Branch: `develop`

```
LUXOR_ENV=staging
NEXT_PUBLIC_LUXOR_ENV=staging
NEXT_PUBLIC_API_URL=https://api-staging.tu-dominio.com
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=TU_KEY
NEXT_PUBLIC_FIREBASE_PROJECT_ID=luxor-pay-gateway-dev
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=luxor-pay-gateway-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=luxor-pay-gateway-dev.firebasestorage.app
```

(Reemplaza API_KEY, SENDER_ID, APP_ID desde Firebase Console de cada proyecto.)
