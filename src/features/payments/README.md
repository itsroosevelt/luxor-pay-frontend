# Payments — checkout, payment links y POS

## Checkout (QR y pago)

| Archivo | Rol |
|---------|-----|
| `components/QRCodePayment.tsx` | QR Solana Pay (escaneo con wallet) |
| `components/PaymentButton.tsx` | Pago desde browser / deep link |
| `components/TransactionStatus.tsx` | Estado pending / confirmed |
| `components/PaymentSuccessModal.tsx` | Confirmación de pago completado |
| `hooks/usePaymentStatus.ts` | Polling del backend por reference |
| `lib/solana-pay-url.ts`, `lib/sterling-pay-checkout-url.ts` | Construcción de URLs de cobro |

**Futuro MPP / split:** integrar desde `external/mpp-sdk/` → `components/MppQR.tsx` (cuando lo generes).

Página pública: `src/app/pay/[reference]/page.tsx`

## Payment links

| Archivo | Rol |
|---------|-----|
| `api/payments-api.ts` | Pagos, payment links y dispositivos POS |
| `hooks/useLinkBuilderForm.ts` | Borrador del formulario "Create Payment Link" |
| `components/CreateLinkModal.tsx`, `EditLinkModal.tsx`, `DeleteLinkModal.tsx` | Modales de la página de links |
| `components/payment-links.styles.ts` | Estilos de la página de links |

Página: `src/app/(portals)/payment-portal/links/page.tsx`
