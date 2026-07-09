import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '@/lib/api-client';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OnrampRedirectPayload {
  sessionId?: string;
  url?: string;
  [key: string]: unknown;
}

interface UseOnrampSocketOptions {
  /** Whether the socket connection should be active */
  enabled: boolean;
  /** Called when the backend emits stripe.redirectToOnrampSession */
  onRedirect: (payload: OnrampRedirectPayload) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useOnrampSocket({ enabled, onRedirect }: UseOnrampSocketOptions): void {
  const socketRef = useRef<Socket | null>(null);
  // Keep a stable reference to the callback to avoid re-connecting on re-renders
  const onRedirectRef = useRef(onRedirect);
  useEffect(() => {
    onRedirectRef.current = onRedirect;
  }, [onRedirect]);

  useEffect(() => {
    if (!enabled) {
      // Cleanup existing connection when disabled
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const base = getApiBaseUrl();

    const socket = io(base, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('stripe.redirectToOnrampSession', (payload: OnrampRedirectPayload) => {
      onRedirectRef.current(payload);
    });

    // Cleanup: close connection when component unmounts or enabled becomes false
    return () => {
      socket.off('stripe.redirectToOnrampSession');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);
}
