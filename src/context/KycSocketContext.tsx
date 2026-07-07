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

/* ─── Types ────────────────────────────────────────────────────────────── */

export type KycSocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
export type KycVerificationResult = 'success' | 'failed' | 'canceled' | null;

export interface KycStatusPayload {
  userId: string;
  status: 'processing' | 'success' | 'failed' | 'canceled';
  sessionId: string;
}

interface KycSocketContextType {
  /** Current socket connection status */
  socketStatus: KycSocketStatus;
  /** Latest raw KYC status payload received from the server */
  kycPayload: KycStatusPayload | null;
  /** True while the user's verification is in-flight (processing state or pending result) */
  verificationActive: boolean;
  /** Final result once the verification process terminates */
  kycResult: KycVerificationResult;
  /**
   * Connect to the socket and join the KYC room for a given userId.
   * Also sets verificationActive = true to show the progress banner.
   */
  joinKycRoom: (userId: string) => void;
  /** Disconnect and clean up the socket */
  leaveKycRoom: () => void;
  /** Dismiss the result modal and reset result state */
  dismissResult: () => void;
}

/* ─── Context ───────────────────────────────────────────────────────────── */

const KycSocketContext = createContext<KycSocketContextType>({
  socketStatus: 'idle',
  kycPayload: null,
  verificationActive: false,
  kycResult: null,
  joinKycRoom: () => {},
  leaveKycRoom: () => {},
  dismissResult: () => {},
});

/* ─── Provider ──────────────────────────────────────────────────────────── */

export function KycSocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const joinedRoomRef = useRef<string | null>(null);

  const [socketStatus, setSocketStatus] = useState<KycSocketStatus>('idle');
  const [kycPayload, setKycPayload] = useState<KycStatusPayload | null>(null);
  const [verificationActive, setVerificationActive] = useState(false);
  const [kycResult, setKycResult] = useState<KycVerificationResult>(null);

  const dismissResult = useCallback(() => {
    setKycResult(null);
  }, []);

  const leaveKycRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    joinedRoomRef.current = null;
    setSocketStatus('idle');
    setKycPayload(null);
  }, []);

  const joinKycRoom = useCallback(
    (userId: string) => {
      // Avoid duplicate connections to the same room
      if (joinedRoomRef.current === userId && socketRef.current?.connected) {
        return;
      }

      // Tear down any existing socket before re-connecting
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      const baseUrl = getApiBaseUrl();

      setSocketStatus('connecting');
      setVerificationActive(true); // Show the banner immediately
      setKycResult(null);

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

      socket.on('kyc_status_updated', (payload: KycStatusPayload) => {
        setKycPayload(payload);

        if (payload.status === 'success' || payload.status === 'failed' || payload.status === 'canceled') {
          // Terminal state: hide banner, show result modal, disconnect
          setVerificationActive(false);
          setKycResult(payload.status === 'success' ? 'success' : payload.status === 'failed' ? 'failed' : 'canceled');

          if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
          }
          joinedRoomRef.current = null;
        }
        // 'processing' keeps the banner visible — no state change needed
      });
    },
    [],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveKycRoom();
    };
  }, [leaveKycRoom]);

  return (
    <KycSocketContext.Provider
      value={{
        socketStatus,
        kycPayload,
        verificationActive,
        kycResult,
        joinKycRoom,
        leaveKycRoom,
        dismissResult,
      }}
    >
      {children}
    </KycSocketContext.Provider>
  );
}

/* ─── Consumer Hook ─────────────────────────────────────────────────────── */

/**
 * `useKycSocket` — Subscribe to real-time KYC verification state.
 *
 * @example
 * const { verificationActive, kycResult, joinKycRoom, dismissResult } = useKycSocket();
 */
export function useKycSocket(): KycSocketContextType {
  return useContext(KycSocketContext);
}
