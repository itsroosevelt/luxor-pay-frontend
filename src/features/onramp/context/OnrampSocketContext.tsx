'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '@/lib/api-client';
import { IS_MOCK_MODE } from '@/lib/mock/mock-config';
import { auth } from '@/lib/firebase';

/* ─── Types ────────────────────────────────────────────────────────────── */

export type OnrampSocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
export type OnrampSessionStatus =
  | 'requires_payment'
  | 'initialized'
  | 'fulfillment_processing'
  | 'fulfillment_complete'
  | 'rejected'
  | null;

export interface OnrampStatusPayload {
  userId: string;
  status: OnrampSessionStatus;
  sessionId: string;
  amount?: string;
  currency?: string;
}

interface OnrampSocketContextType {
  /** Current socket connection status */
  socketStatus: OnrampSocketStatus;
  /** Latest raw Onramp status payload received from the server */
  onrampPayload: OnrampStatusPayload | null;
  /** True while the onramp verification/fulfillment is active */
  onrampActive: boolean;
  /** Final result once the onramp process terminates */
  onrampResult: 'success' | 'failed' | null;
  /**
   * Connect/Trigger tracking for a specific Stripe Onramp Session
   */
  startOnrampTracking: (sessionId: string) => void;
  /** Dismiss the result modal and reset result state */
  dismissOnrampResult: () => void;
}

/* ─── Context ───────────────────────────────────────────────────────────── */

const OnrampSocketContext = createContext<OnrampSocketContextType>({
  socketStatus: 'idle',
  onrampPayload: null,
  onrampActive: false,
  onrampResult: null,
  startOnrampTracking: () => {},
  dismissOnrampResult: () => {},
});

/* ─── Provider ──────────────────────────────────────────────────────────── */

export function OnrampSocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const joinedRoomRef = useRef<string | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);

  const [socketStatus, setSocketStatus] = useState<OnrampSocketStatus>('idle');
  const [onrampPayload, setOnrampPayload] = useState<OnrampStatusPayload | null>(null);
  const [onrampActive, setOnrampActive] = useState(false);
  const [onrampResult, setOnrampResult] = useState<'success' | 'failed' | null>(null);

  const dismissOnrampResult = useCallback(() => {
    setOnrampResult(null);
    setOnrampActive(false);
    setOnrampPayload(null);
    activeSessionIdRef.current = null;
  }, []);

  const leaveOnrampRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    joinedRoomRef.current = null;
    setSocketStatus('idle');
  }, []);

  const startOnrampTracking = useCallback((sessionId: string) => {
    activeSessionIdRef.current = sessionId;
    setOnrampActive(true);
    setOnrampResult(null);

    // Mock Mode: no socket server. Simulate fulfillment completing.
    if (IS_MOCK_MODE) {
      setSocketStatus('connected');
      setTimeout(() => {
        setOnrampPayload({ userId: 'mock', status: 'fulfillment_complete', sessionId });
        setOnrampActive(false);
        setOnrampResult('success');
      }, 1800);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      console.warn('Cannot track onramp: user not authenticated');
      return;
    }

    const userId = user.uid;

    if (joinedRoomRef.current === userId && socketRef.current?.connected) {
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const baseUrl = getApiBaseUrl();
    setSocketStatus('connecting');

    const socket = io(baseUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketStatus('connected');
      joinedRoomRef.current = userId;
      socket.emit('join_kyc_room', userId);
    });

    socket.on('disconnect', (reason) => {
      setSocketStatus('disconnected');
      if (reason === 'io server disconnect') {
        joinedRoomRef.current = null;
      }
    });

    socket.on('connect_error', () => {
      setSocketStatus('error');
    });

    socket.on('onramp_status_updated', (payload: OnrampStatusPayload) => {
      if (activeSessionIdRef.current && payload.sessionId !== activeSessionIdRef.current) {
        return;
      }

      setOnrampPayload(payload);
      setOnrampActive(true);

      if (payload.status === 'fulfillment_complete') {
        setOnrampActive(false);
        setOnrampResult('success');
      } else if (payload.status === 'rejected') {
        setOnrampActive(false);
        setOnrampResult('failed');
      }
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveOnrampRoom();
    };
  }, [leaveOnrampRoom]);

  return (
    <OnrampSocketContext.Provider
      value={{
        socketStatus,
        onrampPayload,
        onrampActive,
        onrampResult,
        startOnrampTracking,
        dismissOnrampResult,
      }}
    >
      {children}
    </OnrampSocketContext.Provider>
  );
}

/* ─── Consumer Hook ─────────────────────────────────────────────────────── */

export function useOnrampSocket() {
  return useContext(OnrampSocketContext);
}
