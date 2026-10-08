# Features — código organizado por dominio

Cada carpeta agrupa todo lo de un dominio de negocio. Dentro, la misma forma:

| Subcarpeta     | Contenido                                                        |
|----------------|------------------------------------------------------------------|
| `api/`         | Llamadas al backend (`*-api.ts`). Nunca reciben el token: lo pone `bearerAuth()` de `@/lib/auth-client`. |
| `hooks/`       | Hooks de React del dominio (estado, carga de datos, acciones).   |
| `components/`  | Componentes del dominio (y sus `*.styles.ts` cuando usan styled-components). |
| `lib/`         | Utilidades puras del dominio.                                    |
| `context/`     | Providers propios del dominio.                                   |

## Dominios

| Feature             | Qué contiene |
|---------------------|--------------|
| `auth`              | Visuales de la pantalla de login. |
| `contacts`          | Agenda de contactos (CRUD). |
| `dashboard`         | Shell del dashboard (Sidebar, TopWalletBar, PortalSwitcher) y widgets del overview. |
| `home`              | Landing page pública. |
| `legal`             | Términos y privacidad. |
| `merchant`          | Perfil del merchant (`merchants-api`, `MerchantContext`). |
| `onramp`            | KYC, on-ramp y off-ramp (modales, sockets, hooks). |
| `payment-requests`  | Solicitudes de pago (crear, pagar, extender, cancelar, reenviar). |
| `payments`          | Checkout Solana Pay, payment links, POS, URLs de cobro. |
| `portals`           | Navegación entre portales y SSO. |
| `qr`                | Escáner QR y enrutado de lo escaneado. |
| `swap`              | Swap de tokens (Jupiter, mainnet). |
| `stake`             | Estilos de la página de staking. |
| `subscription`      | Plan / suscripción. |
| `transactions`      | Historial, tarjetas de transacción, estados de cuenta PDF. |
| `transfers`         | Envíos (modal, hooks, `transfers-api`). |
| `treasury`          | Tesorería multisig Squads v4: bóvedas, propuestas, miembros. |
| `wallet`            | Balance de la wallet y precios de tokens. |

## Fuera de `features/`

- `src/app/` — solo rutas de Next.js (páginas finas que componen features).
- `src/components/ui/` — UI genérica compartida (TokenIcon, partículas, DesignSystem).
- `src/lib/` — infraestructura transversal: cliente HTTP (`api-client`), autenticación (`auth-client`, `firebase`), RPC failover, recursos compartidos, modo mock.
- `src/context/` — providers globales de la app (geolocalización, token registry, modo mock).
- `src/web3/` — Solana Wallet Adapter y configuración de red.
- `src/mocks/` — datos y handlers del modo mock.

Regla: si algo lo usa un solo dominio, va dentro de su feature; si lo usan varios y no es de negocio, va a `components/ui` o `lib`.
