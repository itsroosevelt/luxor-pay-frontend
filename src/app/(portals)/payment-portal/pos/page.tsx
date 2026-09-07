'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Plus,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Monitor,
  Wifi,
  WifiOff,
  Zap,
  DollarSign,
  Layers,
  Copy,
  ExternalLink,
  X,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Building2,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Interfaces ──────────────────────────────────────────────────────────────
export interface PosDevice {
  id: string;
  name: string;
  location: string;
  serialNumber: string;
  currency: 'USDC' | 'SOL' | 'EURC';
  status: 'online' | 'offline';
  dailyVolume: number;
  lastActive: string;
}

const INITIAL_DEVICES: PosDevice[] = [
  {
    id: 'pos_1',
    name: 'Main Till - Downtown Flagship',
    location: 'Downtown Store',
    serialNumber: 'POS-SOL-9910',
    currency: 'USDC',
    status: 'online',
    dailyVolume: 6420.0,
    lastActive: 'Just now',
  },
  {
    id: 'pos_2',
    name: 'Mobile Register #02',
    location: 'Events & Pop-ups',
    serialNumber: 'POS-SOL-4412',
    currency: 'USDC',
    status: 'online',
    dailyVolume: 3250.5,
    lastActive: '2m ago',
  },
  {
    id: 'pos_3',
    name: 'Drive-Thru POS Terminal',
    location: 'Northside Location',
    serialNumber: 'POS-SOL-1105',
    currency: 'SOL',
    status: 'online',
    dailyVolume: 4180.0,
    lastActive: '5m ago',
  },
  {
    id: 'pos_4',
    name: 'Self-Checkout Kiosk #04',
    location: 'Downtown Store',
    serialNumber: 'POS-SOL-7740',
    currency: 'USDC',
    status: 'offline',
    dailyVolume: 0.0,
    lastActive: '2h ago',
  },
];

// ─── Styled Components ────────────────────────────────────────────────────────

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
`;

const ContentLayout = styled.div`
  padding: 32px 40px 60px 40px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (max-width: 768px) {
    padding: 20px 16px 40px 16px;
    gap: 24px;
  }
`;

const HeaderSection = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin: 0;
  line-height: 1.15;
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin: 4px 0 0 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.6);
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(96, 165, 250, 0.3);
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatValue = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 500;
  color: #ffffff;
  letter-spacing: -0.5px;
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const ButtonBase = styled.button<{ $variant?: 'primary' | 'secondary' | 'ghost' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  border-radius: 9999px;
  padding: 12px 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  border: none;

  ${({ $variant }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover:not(:disabled) {
      background: #2563EB;
      color: #FFFFFF;
      box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
    }
  `}

  ${({ $variant }) =>
    ($variant === 'secondary' || !$variant) &&
    `
    background: transparent;
    color: #60A5FA;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);
    &:hover:not(:disabled) {
      background: rgba(96, 165, 250, 0.1);
      border-color: #60A5FA;
    }
  `}
`;

const DevicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const DeviceCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(40px);
  border-radius: 28px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.6);
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(96, 165, 250, 0.4);
  }
`;

const DeviceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DeviceBadge = styled.span<{ $online?: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  ${({ $online }) =>
    $online
      ? `
    background: rgba(52, 211, 153, 0.15);
    color: #34D399;
    border: 1px solid rgba(52, 211, 153, 0.3);
  `
      : `
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `}
`;

const DeviceName = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
`;

const SerialText = styled.p`
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 4px 0 0 0;
`;

const MetricRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);

  span {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  strong {
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    color: #ffffff;
  }
`;

/* Virtual Keypad Terminal Modal */

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const KeypadModalBox = styled(motion.div)`
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 32px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.9);
  width: 100%;
  max-width: 420px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const KeypadDisplay = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  text-align: right;

  .currency-tag {
    font-size: 12px;
    color: #60a5fa;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .amount {
    font-family: 'Outfit', sans-serif;
    font-size: 38px;
    font-weight: 600;
    color: #ffffff;
    margin-top: 4px;
  }
`;

const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const KeypadButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  height: 56px;
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(96, 165, 250, 0.15);
    border-color: #60a5fa;
  }

  &:active {
    transform: scale(0.95);
  }
`;

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PosTerminalsPage() {
  const [devices, setDevices] = useState<PosDevice[]>(INITIAL_DEVICES);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isVirtualPosOpen, setIsVirtualPosOpen] = useState(false);
  const [activeDeviceForPos, setActiveDeviceForPos] = useState<PosDevice | null>(null);

  // Virtual Keypad State
  const [chargeAmount, setChargeAmount] = useState('0');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [isPairing, setIsPairing] = useState(false);

  // Register Form State
  const [deviceName, setDeviceName] = useState('');
  const [deviceLocation, setDeviceLocation] = useState('Main Store');
  const [deviceCurrency, setDeviceCurrency] = useState<'USDC' | 'SOL' | 'EURC'>('USDC');

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setChargeAmount('0');
      setQrGenerated(false);
      return;
    }

    if (val === '⌫') {
      setChargeAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }

    if (chargeAmount === '0' && val !== '.') {
      setChargeAmount(val);
    } else {
      if (val === '.' && chargeAmount.includes('.')) return;
      setChargeAmount((prev) => prev + val);
    }
  };

  const handleRegisterDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) {
      toast.error('Enter a device name');
      return;
    }

    setIsPairing(true);
    setTimeout(() => {
      const newDev: PosDevice = {
        id: `pos_${Date.now()}`,
        name: deviceName,
        location: deviceLocation,
        serialNumber: `POS-SOL-${Math.floor(1000 + Math.random() * 9000)}`,
        currency: deviceCurrency,
        status: 'online',
        dailyVolume: 0.0,
        lastActive: 'Just now',
      };
      setDevices((prev) => [newDev, ...prev]);
      setIsPairing(false);
      setIsRegisterOpen(false);
      setDeviceName('');
      toast.success(`Terminal "${newDev.name}" paired successfully!`);
    }, 1000);
  };

  const handleOpenVirtualPos = (device?: PosDevice) => {
    setActiveDeviceForPos(device || devices[0]);
    setChargeAmount('0');
    setQrGenerated(false);
    setIsVirtualPosOpen(true);
  };

  return (
    <PageContainer>
      <ContentLayout>
        {/* Header Section */}
        <HeaderSection>
          <Title>POS Terminals &amp; Point of Sale</Title>
          <Subtitle>
            Pair physical devices, manage virtual registers, and process in-person QR payments on Solana.
          </Subtitle>
        </HeaderSection>

        {/* Actions Row */}
        <ActionRow>
          <ButtonBase $variant="primary" onClick={() => setIsRegisterOpen(true)}>
            <Plus size={18} /> Pair New Device
          </ButtonBase>

          <ButtonBase $variant="secondary" onClick={() => handleOpenVirtualPos()}>
            <QrCode size={18} /> Open Virtual POS Keypad
          </ButtonBase>
        </ActionRow>

        {/* Devices List */}
        <DevicesGrid>
          {devices.map((device) => (
            <DeviceCard key={device.id}>
              <DeviceHeader>
                <div>
                  <DeviceName>{device.name}</DeviceName>
                  <SerialText>{device.serialNumber} • {device.location}</SerialText>
                </div>
                <DeviceBadge $online={device.status === 'online'}>
                  {device.status === 'online' ? <Wifi size={12} /> : <WifiOff size={12} />}
                  {device.status === 'online' ? 'Online' : 'Offline'}
                </DeviceBadge>
              </DeviceHeader>

              <MetricRow>
                <span>24h Transactions</span>
                <strong>${device.dailyVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })} {device.currency}</strong>
              </MetricRow>

              <MetricRow>
                <span>Last Activity</span>
                <strong>{device.lastActive}</strong>
              </MetricRow>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <ButtonBase
                  $variant="secondary"
                  style={{ flex: 1, padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => handleOpenVirtualPos(device)}
                >
                  <CreditCard size={14} /> Charge Now
                </ButtonBase>

                <ButtonBase
                  $variant="ghost"
                  style={{ padding: '8px 14px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                  onClick={() => {
                    toast.success(`Pairing QR generated for ${device.name}`);
                  }}
                >
                  <QrCode size={14} /> Pair QR
                </ButtonBase>
              </div>
            </DeviceCard>
          ))}
        </DevicesGrid>
      </ContentLayout>

      {/* Modal: Pair Device */}
      <AnimatePresence>
        {isRegisterOpen && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsRegisterOpen(false)}
          >
            <KeypadModalBox
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', color: '#FFFFFF', margin: 0 }}>
                  Pair POS Terminal
                </h3>
                <button
                  onClick={() => setIsRegisterOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRegisterDevice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>
                    Till / Register Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cashier #03 - Flagship Store"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>
                    Store Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Downtown Store"
                    value={deviceLocation}
                    onChange={(e) => setDeviceLocation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>
                    Default Settlement Asset
                  </label>
                  <select
                    value={deviceCurrency}
                    onChange={(e) => setDeviceCurrency(e.target.value as PosDevice['currency'])}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#0a0a0a',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="USDC">USDC (Solana SPL)</option>
                    <option value="SOL">SOL (Native)</option>
                    <option value="EURC">EURC (Solana SPL)</option>
                  </select>
                </div>

                <ButtonBase type="submit" $variant="primary" disabled={isPairing} style={{ marginTop: '10px' }}>
                  {isPairing ? 'Linking Terminal...' : 'Complete Pairing'}
                </ButtonBase>
              </form>
            </KeypadModalBox>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Modal: Virtual POS Keypad Charge */}
      <AnimatePresence>
        {isVirtualPosOpen && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVirtualPosOpen(false)}
          >
            <KeypadModalBox
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', color: '#FFFFFF', margin: 0 }}>
                    Virtual POS Keypad
                  </h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                    {activeDeviceForPos?.name || 'Main Register'}
                  </p>
                </div>
                <button
                  onClick={() => setIsVirtualPosOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {!qrGenerated ? (
                <>
                  <KeypadDisplay>
                    <div className="currency-tag">USDC (Solana Pay)</div>
                    <div className="amount">${chargeAmount}</div>
                  </KeypadDisplay>

                  <KeypadGrid>
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((key) => (
                      <KeypadButton key={key} onClick={() => handleKeypadPress(key)}>
                        {key}
                      </KeypadButton>
                    ))}
                  </KeypadGrid>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <KeypadButton
                      onClick={() => handleKeypadPress('C')}
                      style={{ flex: 1, fontSize: '14px', background: 'rgba(255,255,255,0.03)' }}
                    >
                      Clear
                    </KeypadButton>

                    <ButtonBase
                      $variant="primary"
                      style={{ flex: 2, height: '56px', fontSize: '16px' }}
                      disabled={parseFloat(chargeAmount) <= 0}
                      onClick={() => setQrGenerated(true)}
                    >
                      <QrCode size={18} /> Charge ${chargeAmount}
                    </ButtonBase>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: '0 0 16px 0' }}>
                    Scan QR with any Solana Pay Wallet to complete purchase
                  </p>

                  <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '24px', display: 'inline-block' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=solana:luxor_pos?amount=${chargeAmount}`}
                      alt="Solana Pay QR"
                      style={{ width: '180px', height: '180px' }}
                    />
                    <p style={{ color: '#000000', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', margin: '8px 0 0 0' }}>
                      ${chargeAmount} USDC
                    </p>
                  </div>

                  <p style={{ fontSize: '12px', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
                    <Zap size={14} /> Listening for instant vault settlement...
                  </p>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <ButtonBase
                      $variant="secondary"
                      style={{ flex: 1 }}
                      onClick={() => setQrGenerated(false)}
                    >
                      Back to Keypad
                    </ButtonBase>

                    <ButtonBase
                      $variant="primary"
                      style={{ flex: 1 }}
                      onClick={() => {
                        toast.success(`Payment of $${chargeAmount} USDC received!`);
                        setChargeAmount('0');
                        setQrGenerated(false);
                        setIsVirtualPosOpen(false);
                      }}
                    >
                      Simulate Paid
                    </ButtonBase>
                  </div>
                </div>
              )}
            </KeypadModalBox>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
