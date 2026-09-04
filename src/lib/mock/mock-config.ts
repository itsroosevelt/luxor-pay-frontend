/**
 * Mock Mode — single source of truth for the frontend "no backend" flag.
 *
 * When `NEXT_PUBLIC_USE_MOCK_DATA=true` the app runs 100% independent of the
 * backend and Firebase Auth:
 *   - every REST call to the Next proxy (`/api/backend/*`) is answered locally
 *     from `src/mocks` (see `mock-fetch.ts` + `src/mocks/handlers.ts`)
 *   - `@/lib/firebase` exports a simulated authenticated session
 *     (see `mock-auth.ts`)
 *
 * When the flag is absent or `false` NOTHING in this folder runs — the real
 * integration code path is byte-for-byte unchanged.
 *
 * The comparison is against the string "true" because `NEXT_PUBLIC_*` values are
 * always inlined as strings at build time.
 */
export const IS_MOCK_MODE = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

/** sessionStorage key used to simulate a "signed out" state inside mock mode. */
export const MOCK_SIGNED_OUT_KEY = 'luxor_mock_signed_out';

/** Artificial latency (ms) applied to mocked responses so loading states render. */
export const MOCK_LATENCY_MS = 220;
