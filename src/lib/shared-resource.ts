/**
 * One shared copy of a server resource for every component that reads it.
 *
 * The treasury page mounts several widgets that need the same data (vaults,
 * proposals…). Each used to fetch — and poll — on its own, multiplying the
 * requests that reach the Solana RPC and trip its rate limit. A shared resource
 * fetches once, de-duplicates concurrent loads, polls only while someone is
 * subscribed and the tab is visible, and resets when the signed-in user changes.
 */

import { useSyncExternalStore } from 'react';
import { auth } from '@/lib/firebase';
import { IS_MOCK_MODE } from '@/lib/mock/mock-config';

export interface ResourceState<T> {
  data: T;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

interface Options {
  /** Background refresh interval while subscribed (ms). Omit to disable polling. */
  refreshMs?: number;
  /** Also refresh when the tab regains focus. */
  refreshOnFocus?: boolean;
}

export interface SharedResource<T> {
  useState(): ResourceState<T>;
  /** `silent`: keep current data on screen and don't flag errors (background refresh). */
  load(opts?: { silent?: boolean }): Promise<void>;
  setData(update: (prev: T) => T): void;
}

export function createSharedResource<T>(
  initial: T,
  loader: () => Promise<T>,
  options: Options = {},
): SharedResource<T> {
  let state: ResourceState<T> = { data: initial, isLoading: true, isError: false, errorMessage: null };
  const listeners = new Set<() => void>();
  let inFlight: Promise<void> | null = null;
  let inFlightUid: string | null = null;
  /** Identifies the latest request: an older one finishing late never overwrites it. */
  let currentTicket: object | null = null;
  let loadedFor: string | null = null;
  let hasData = false;
  let teardown: (() => void) | null = null;

  const emit = (patch: Partial<ResourceState<T>>) => {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  };

  const load = (opts: { silent?: boolean } = {}): Promise<void> => {
    const uid = auth.currentUser?.uid ?? null;
    // Firebase restores the session asynchronously: until it does there is nothing to
    // load for (the auth listener calls load again). Mock mode works without a user.
    if (!uid && !IS_MOCK_MODE) return Promise.resolve();
    // Share a request only with callers of the same user; a session that just appeared
    // must not reuse a request that was sent without it.
    if (inFlight && inFlightUid === uid) return inFlight;
    if (uid !== loadedFor) {
      // Different account: never show the previous user's data.
      loadedFor = uid;
      hasData = false;
      emit({ data: initial, isLoading: true, isError: false, errorMessage: null });
    }
    const silent = !!opts.silent && hasData;
    if (!silent) emit({ isLoading: true });

    inFlightUid = uid;
    const ticket = {};
    currentTicket = ticket;
    const request = (async () => {
      try {
        const data = await loader();
        if (ticket !== currentTicket || (auth.currentUser?.uid ?? null) !== loadedFor) return; // superseded
        hasData = true;
        emit({ data, isLoading: false, isError: false, errorMessage: null });
      } catch (err) {
        if (ticket !== currentTicket) return; // a newer request owns the state now
        console.warn('Shared resource load failed:', err);
        // Keep whatever is on screen; only a foreground load reports the error.
        emit(silent ? { isLoading: false } : { isLoading: false, isError: true, errorMessage: toMessage(err) });
      } finally {
        if (ticket === currentTicket) {
          inFlight = null;
          inFlightUid = null;
        }
      }
    })();
    inFlight = request;
    return request;
  };

  const start = () => {
    const unsubAuth = auth.onAuthStateChanged(() => { void load(); });
    const timer = options.refreshMs
      ? window.setInterval(() => {
          if (document.visibilityState === 'visible') void load({ silent: true });
        }, options.refreshMs)
      : null;
    const onFocus = () => { void load({ silent: true }); };
    if (options.refreshOnFocus) window.addEventListener('focus', onFocus);
    return () => {
      unsubAuth();
      if (timer) window.clearInterval(timer);
      if (options.refreshOnFocus) window.removeEventListener('focus', onFocus);
    };
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if (listeners.size === 1) teardown = start();
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && teardown) {
        teardown();
        teardown = null;
      }
    };
  };

  const getSnapshot = () => state;

  return {
    useState: () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot),
    load,
    setData: (update) => {
      hasData = true;
      emit({ data: update(state.data) });
    },
  };
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'No se pudieron cargar los datos';
}
