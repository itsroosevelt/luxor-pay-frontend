# Checkout — QR y pago

| Archivo | Rol |
|---------|-----|
| `components/QRCodePayment.tsx` | QR Solana Pay (escaneo con wallet) |
| `components/PaymentButton.tsx` | Pago desde browser / deep link |
| `components/TransactionStatus.tsx` | Estado pending / confirmed |
| `hooks/usePaymentStatus.ts` | Polling del backend por reference |

**Futuro MPP / split:** integrar desde `external/mpp-sdk/` → `components/MppQR.tsx` (cuando lo generes).

Página pública: `src/app/pay/[reference]/page.tsx`
