'use client';

/**
 * MockModeProvider
 *
 * Mounted at the root of the tree ONLY when `NEXT_PUBLIC_USE_MOCK_DATA=true`
 * (see `src/app/layout.tsx`, where it is loaded through a guarded dynamic
 * import so none of this ships in a normal production build).
 *
 * Responsibilities:
 *  1. Install the `fetch` interceptor before any component data-fetch runs
 *     (side-effect of importing `@/lib/mock/mock-fetch`).
 *  2. Expose `useMockMode()` for components that want to badge / branch on it.
 *  3. Render a small persistent "MOCK MODE" indicator.
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import '@/lib/mock/mock-fetch';
import { installMockFetch } from '@/lib/mock/mock-fetch';
import { IS_MOCK_MODE } from '@/lib/mock/mock-config';
import { MOCK_USER } from '@/mocks/data';

// Belt-and-braces: ensure the patch is in place even if the side-effect import
// was tree-shaken or evaluated in an unexpected order.
if (typeof window !== 'undefined' && IS_MOCK_MODE) installMockFetch();

interface MockModeValue {
  isMockMode: boolean;
  user: typeof MOCK_USER;
}

const MockModeContext = createContext<MockModeValue>({ isMockMode: false, user: MOCK_USER });

export function MockModeProvider({ children }: { children: ReactNode }) {
  return (
    <MockModeContext.Provider value={{ isMockMode: true, user: MOCK_USER }}>
      {children}
      <MockModeBadge />
    </MockModeContext.Provider>
  );
}

export function useMockMode(): MockModeValue {
  return useContext(MockModeContext);
}

function MockModeBadge() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        bottom: 12,
        left: 12,
        zIndex: 2147483647,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#34D399',
        background: 'rgba(16, 185, 129, 0.10)',
        border: '1px solid rgba(6, 95, 70, 0.55)',
        pointerEvents: 'none',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 9999, background: 'currentColor' }} />
      Mock mode
    </div>
  );
}
