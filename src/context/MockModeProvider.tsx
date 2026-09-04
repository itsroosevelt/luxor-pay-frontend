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
    </MockModeContext.Provider>
  );
}

export function useMockMode(): MockModeValue {
  return useContext(MockModeContext);
}

