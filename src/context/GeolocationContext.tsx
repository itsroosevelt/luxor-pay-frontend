"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ShieldAlert, RefreshCw } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Geolocation as CapacitorGeolocation } from '@capacitor/geolocation';
// ─── Types ────────────────────────────────────────────────────────────────────

export type GeolocationStatus = 'idle' | 'requesting' | 'granted' | 'denied';

export interface GeolocationContextValue {
  latitude: number | null;
  longitude: number | null;
  status: GeolocationStatus;
  requestPermission: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const GeolocationContext = createContext<GeolocationContextValue>({
  latitude: null,
  longitude: null,
  status: 'idle',
  requestPermission: () => {},
});

export function useGeolocation(): GeolocationContextValue {
  return useContext(GeolocationContext);
}

// ─── Styled Components ────────────────────────────────────────────────────────

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.15); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 40px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(37, 99, 235, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  padding: 56px 48px;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (max-width: 768px) {
    padding: 40px 28px;
    border-radius: 28px;
  }
`;

const GlowRing = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.02) 60%,
    transparent 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  position: relative;
  animation: ${float} 3s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.15);
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

const IconWrap = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
`;

const Eyebrow = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
`;

const Heading = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #ffffff;
  margin: 0 0 16px 0;

  @media (min-width: 768px) {
    font-size: 36px;
  }
`;

const Body = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 0 0 12px 0;
`;

const WarningNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px 18px;
  margin-bottom: 32px;
  text-align: left;
`;

const WarningText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
`;

const AllowButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 16px 40px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  background: #ffffff;
  color: #000000;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.25s ease-in-out;
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.15);

  &:hover:not(:disabled) {
    background: #EDEDED;
    color: #000000;
    box-shadow: 0 8px 32px rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RequestingSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-top-color: #000000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// ─── Blocking Modal ───────────────────────────────────────────────────────────

function GeolocationBlockingModal({
  status,
  onRetry,
}: {
  status: GeolocationStatus;
  onRetry: () => void;
}) {
  const isRequesting = status === 'requesting';

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
        >
          <GlowRing>
            <IconWrap>
              <MapPin size={24} strokeWidth={2} />
            </IconWrap>
          </GlowRing>

          <Eyebrow>Location Required</Eyebrow>

          <Heading>Allow Location Access</Heading>

          <Body>
            Luxor Pay requires your location to comply with regulatory
            requirements and to secure every on-chain transaction with
            geolocation data.
          </Body>

          <WarningNote>
            <ShieldAlert
              size={16}
              color="rgba(255, 255, 255, 0.6)"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <WarningText>
              You must allow location access to continue using the dashboard.
              No payments can be processed without geolocation enabled.
            </WarningText>
          </WarningNote>

          <AllowButton
            onClick={onRetry}
            disabled={isRequesting}
            aria-busy={isRequesting}
            aria-disabled={isRequesting}
          >
            {isRequesting ? (
              <>
                <RequestingSpinner />
                Requesting access…
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Allow Location &amp; Continue
              </>
            )}
          </AllowButton>
        </Card>
      </Overlay>
    </AnimatePresence>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GeolocationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('idle');

  // Track if geolocation is supported at all
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  // Avoid duplicate in-flight requests
  const requesting = useRef(false);

  const requestPermission = useCallback(async () => {
    if (!isSupported && !Capacitor.isNativePlatform()) {
      // If browser doesn't support geolocation, treat as granted with null coords
      // so the app isn't permanently blocked on unsupported environments.
      setStatus('granted');
      return;
    }

    if (requesting.current) return;
    requesting.current = true;
    setStatus('requesting');

    if (Capacitor.isNativePlatform()) {
      try {
        const permStatus = await CapacitorGeolocation.checkPermissions();
        if (permStatus.location !== 'granted') {
          const reqStatus = await CapacitorGeolocation.requestPermissions();
          if (reqStatus.location !== 'granted') {
            requesting.current = false;
            setStatus('denied');
            return;
          }
        }
        
        const pos = await CapacitorGeolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
        requesting.current = false;
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setStatus('granted');
      } catch (e) {
        console.error('Capacitor geolocation error', e);
        requesting.current = false;
        setStatus('denied');
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        requesting.current = false;
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setStatus('granted');
      },
      () => {
        requesting.current = false;
        setStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [isSupported]);

  // Auto-request on mount (triggers the browser permission dialog once)
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const showBlockingModal = status === 'denied' || status === 'requesting';

  return (
    <GeolocationContext.Provider value={{ latitude, longitude, status, requestPermission }}>
      {showBlockingModal && (
        <GeolocationBlockingModal status={status} onRetry={requestPermission} />
      )}
      {children}
    </GeolocationContext.Provider>
  );
}
