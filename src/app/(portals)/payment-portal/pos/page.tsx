'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Plus,
  Wifi,
  WifiOff,
  Zap,
  CreditCard,
  X,
  CheckCircle2,
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

// ─── Styled Components (Monochrome Portal Theme) ──────────────────────────────

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
`;

const ContentLayout = styled.div`
  padding: 64px 40px 60px 40px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 28px;

  @media (max-width: 768px) {
    padding: 20px 16px 40px 16px;
    gap: 20px;
  }
`;

const HeaderSection = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
`;

const HeaderTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #ffffff;
  margin: 0;
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const ButtonBase = styled.button<{ $variant?: 'primary' | 'secondary' | 'ghost' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  border-radius: 9999px;
  padding: 9px 20px;
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
      background: rgba(255, 255, 255, 0.85);
      color: #000000;
    }
  `}

  ${({ $variant }) =>
    ($variant === 'secondary' || !$variant) &&
    `
    background: rgba(255, 255, 255, 0.05);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.12);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
    }
  `}

  ${({ $variant }) =>
    $variant === 'ghost' &&
    `
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
      color: #FFFFFF;
    }
  `}
`;

/* Unified Data Table (Borderless Canvas Layout) */
const TableWrapper = styled(motion.div)`
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  background: transparent;
  padding: 12px 16px;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--lx-text-dim);
  border-bottom: 1px solid var(--lx-border);
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const ThRight = styled(Th)`
  text-align: right;
`;

const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  color: var(--lx-text);
  border-bottom: 1px solid var(--lx-border);
  vertical-align: middle;
`;

const DeviceCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const LocationTd = styled(Td)`
  color: var(--lx-text-muted);
  font-size: 13px;
`;

const VolumeTd = styled(Td)`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  color: var(--lx-text);
`;

const ActiveTd = styled(Td)`
  color: var(--lx-text-dim);
  font-size: 13px;
`;

const ActionTdRight = styled(Td)`
  text-align: right;
`;

const ActionRowGroup = styled.div`
  display: inline-flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ModalHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitleH3 = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  color: var(--lx-text);
  margin: 0;
`;

const ModalSubtitleText = styled.p`
  font-size: 12px;
  color: var(--lx-text-dim);
  margin: 0;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: var(--lx-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  &:hover {
    color: var(--lx-text);
  }
`;

const ModalFormCol = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FormLabelText = styled.label`
  font-size: 12px;
  color: var(--lx-text-muted);
  display: block;
  margin-bottom: 6px;
`;

const QrCodeContainer = styled.div`
  background: #FFFFFF;
  padding: 24px;
  border-radius: 24px;
  display: inline-block;
`;

const QrCodeSerial = styled.p`
  color: #000000;
  font-size: 16px;
  font-weight: 700;
  font-family: monospace;
  margin: 8px 0 0 0;
`;

const Tr = styled.tr`
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &:last-child ${Td} {
    border-bottom: 1px solid var(--lx-border);
  }
`;

const DeviceNameText = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #ffffff;
`;

const SerialText = styled.span`
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
`;

const StatusBadge = styled.span<{ $online?: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.06);
  color: ${({ $online }) => ($online ? '#ffffff' : 'rgba(255, 255, 255, 0.4)')};
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

/* Modal Styles */
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
  border-radius: 28px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.9);
  width: 100%;
  max-width: 420px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const KeypadDisplay = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  text-align: right;

  .currency-tag {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
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
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
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
          <HeaderTextGroup>
            <Title>POS Terminals &amp; Point of Sale</Title>
            <Subtitle>
              Pair physical devices, manage virtual registers, and process in-person QR payments on Solana.
            </Subtitle>
          </HeaderTextGroup>

          <ActionRow>
            <ButtonBase $variant="secondary" onClick={() => handleOpenVirtualPos()}>
              <QrCode size={15} /> Open Virtual POS Keypad
            </ButtonBase>
            <ButtonBase $variant="primary" onClick={() => setIsRegisterOpen(true)}>
              <Plus size={15} /> Pair New Device
            </ButtonBase>
          </ActionRow>
        </HeaderSection>

        {/* Unified Table View (No Card Containers) */}
        <TableWrapper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Table>
            <thead>
              <Tr>
                <Th>Terminal / Device Name</Th>
                <Th>Location</Th>
                <Th>24h Volume</Th>
                <Th>Last Active</Th>
                <Th>Status</Th>
                <ThRight>Actions</ThRight>
              </Tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <Tr key={device.id}>
                  <Td>
                    <DeviceCell>
                      <DeviceNameText>{device.name}</DeviceNameText>
                      <SerialText>{device.serialNumber}</SerialText>
                    </DeviceCell>
                  </Td>
                  <LocationTd>
                    {device.location}
                  </LocationTd>
                  <VolumeTd>
                    ${device.dailyVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })} {device.currency}
                  </VolumeTd>
                  <ActiveTd>
                    {device.lastActive}
                  </ActiveTd>
                  <Td>
                    <StatusBadge $online={device.status === 'online'}>
                      {device.status === 'online' ? <Wifi size={11} /> : <WifiOff size={11} />}
                      {device.status === 'online' ? 'Online' : 'Offline'}
                    </StatusBadge>
                  </Td>
                  <ActionTdRight>
                    <ActionRowGroup>
                      <ButtonBase
                        $variant="secondary"
                        onClick={() => handleOpenVirtualPos(device)}
                      >
                        <CreditCard size={13} /> Charge
                      </ButtonBase>

                      <ButtonBase
                        $variant="ghost"
                        onClick={() => {
                          toast.success(`Pairing QR generated for ${device.name}`);
                        }}
                      >
                        <QrCode size={13} /> Pair QR
                      </ButtonBase>
                    </ActionRowGroup>
                  </ActionTdRight>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
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
              <ModalHeaderRow>
                <ModalTitleH3>
                  Pair POS Terminal
                </ModalTitleH3>
                <ModalCloseButton
                  onClick={() => setIsRegisterOpen(false)}
                >
                  <X size={18} />
                </ModalCloseButton>
              </ModalHeaderRow>

              <ModalFormCol onSubmit={handleRegisterDevice}>
                <div>
                  <FormLabelText>
                    Till / Register Name
                  </FormLabelText>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cashier #03 - Flagship Store"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white text-sm outline-none box-border focus:border-blue-400"
                  />
                </div>

                <div>
                  <FormLabelText>
                    Store Location
                  </FormLabelText>
                  <input
                    type="text"
                    placeholder="e.g. Downtown Store"
                    value={deviceLocation}
                    onChange={(e) => setDeviceLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white text-sm outline-none box-border focus:border-blue-400"
                  />
                </div>

                <div>
                  <FormLabelText>
                    Default Settlement Asset
                  </FormLabelText>
                  <select
                    value={deviceCurrency}
                    onChange={(e) => setDeviceCurrency(e.target.value as PosDevice['currency'])}
                    className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/15 text-white text-sm outline-none box-border"
                  >
                    <option value="USDC">USDC (Solana SPL)</option>
                    <option value="SOL">SOL (Native)</option>
                    <option value="EURC">EURC (Solana SPL)</option>
                  </select>
                </div>

                <ButtonBase type="submit" $variant="primary" disabled={isPairing}>
                  {isPairing ? 'Linking Terminal...' : 'Complete Pairing'}
                </ButtonBase>
              </ModalFormCol>
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
              <ModalHeaderRow>
                <div>
                  <ModalTitleH3>
                    Virtual POS Keypad
                  </ModalTitleH3>
                  <ModalSubtitleText>
                    {activeDeviceForPos?.name || 'Main Register'}
                  </ModalSubtitleText>
                </div>
                <ModalCloseButton
                  onClick={() => setIsVirtualPosOpen(false)}
                >
                  <X size={18} />
                </ModalCloseButton>
              </ModalHeaderRow>

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

                  <div className="flex gap-2.5">
                    <KeypadButton
                      onClick={() => handleKeypadPress('C')}
                      className="flex-1 text-sm bg-white/[0.03]"
                    >
                      Clear
                    </KeypadButton>

                    <ButtonBase
                      $variant="primary"
                      className="flex-[2] h-[56px] text-base"
                      disabled={parseFloat(chargeAmount) <= 0}
                      onClick={() => setQrGenerated(true)}
                    >
                      <QrCode size={18} /> Charge ${chargeAmount}
                    </ButtonBase>
                  </div>
                </>
              ) : (
                <div className="text-center py-2.5">
                  <p className="text-white/70 text-sm mb-4">
                    Scan QR with any Solana Pay Wallet to complete purchase
                  </p>

                  <QrCodeContainer>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=solana:luxor_pos?amount=${chargeAmount}`}
                      alt="Solana Pay QR"
                      className="w-[180px] h-[180px]"
                    />
                    <QrCodeSerial>
                      ${chargeAmount} USDC
                    </QrCodeSerial>
                  </QrCodeContainer>

                  <p className="text-xs text-white/60 flex items-center justify-center gap-1.5 mt-4">
                    <Zap size={14} /> Listening for instant vault settlement...
                  </p>

                  <div className="flex gap-2.5 mt-5">
                    <ButtonBase
                      $variant="secondary"
                      className="flex-1"
                      onClick={() => setQrGenerated(false)}
                    >
                      Back to Keypad
                    </ButtonBase>

                    <ButtonBase
                      $variant="primary"
                      className="flex-1"
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
