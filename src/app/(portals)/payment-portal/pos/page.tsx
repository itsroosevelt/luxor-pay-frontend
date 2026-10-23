'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { QrCode, Plus, Wifi, WifiOff, Zap, CreditCard, X, Store } from 'lucide-react';
import { toast } from 'sonner';
import {
  PageContainer,
  ContentLayout,
  HeaderSection,
  HeaderTextGroup,
  Title,
  Subtitle,
  TableControlsRow,
  TableSectionTitle,
  ButtonBase,
  TableWrapper,
  Table,
  Th,
  ThRight,
  Td,
  DeviceCell,
  LocationTd,
  VolumeTd,
  ActiveTd,
  ActionTdRight,
  ActionRowGroup,
  ModalHeaderRow,
  ModalTitleH3,
  ModalSubtitleText,
  ModalCloseButton,
  ModalFormCol,
  FormLabelText,
  QrCodeContainer,
  QrCodeSerial,
  Tr,
  DeviceNameText,
  SerialText,
  StatusBadge,
  ModalOverlay,
  KeypadModalBox,
  KeypadDisplay,
  KeypadGrid,
  KeypadButton,
} from '@/features/payments/components/pos.styles';

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

const INITIAL_DEVICES: PosDevice[] = [];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PosTerminalsPage() {
  const [devices, setDevices] = useState<PosDevice[]>(INITIAL_DEVICES);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isVirtualPosOpen, setIsVirtualPosOpen] = useState(false);
  const [activeDeviceForPos, setActiveDeviceForPos] = useState<PosDevice | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isRegisterOpen && !isVirtualPosOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isRegisterOpen, isVirtualPosOpen]);

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
        </HeaderSection>

        {/* Toolbar & Action Row (Placed Lower Down) */}
        <TableControlsRow>
          <TableSectionTitle>
            Configured Terminals ({devices.length})
          </TableSectionTitle>
          <ButtonBase $variant="primary" onClick={() => setIsRegisterOpen(true)}>
            <Plus size={15} /> Pair POS Terminal
          </ButtonBase>
        </TableControlsRow>

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
              {devices.length === 0 ? (
                <Tr>
                  <Td colSpan={6} style={{ textAlign: 'center', padding: '48px 16px', color: 'rgba(255, 255, 255, 0.45)' }}>
                    No POS terminals configured. Click &quot;Pair POS Terminal&quot; above to connect your first device.
                  </Td>
                </Tr>
              ) : (
                devices.map((device) => (
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
                ))
              )}
            </tbody>
          </Table>
        </TableWrapper>
      </ContentLayout>

      {/* Modal: Pair Device */}
      {mounted && typeof document !== 'undefined' && createPortal(
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
                <ModalHeaderRow className="pb-3 border-b border-white/10 mb-1">
                  <div>
                    <ModalTitleH3>
                      Pair POS Terminal
                    </ModalTitleH3>
                    <ModalSubtitleText>
                      Connect a physical or virtual payment register to your vault
                    </ModalSubtitleText>
                  </div>
                  <ModalCloseButton
                    onClick={() => setIsRegisterOpen(false)}
                  >
                    <X size={18} />
                  </ModalCloseButton>
                </ModalHeaderRow>

                <ModalFormCol onSubmit={handleRegisterDevice} className="pt-2">
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white text-sm outline-none box-border focus:border-blue-500 transition-colors"
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white text-sm outline-none box-border focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <FormLabelText>
                      Default Settlement Asset
                    </FormLabelText>
                    <select
                      value={deviceCurrency}
                      onChange={(e) => setDeviceCurrency(e.target.value as PosDevice['currency'])}
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/15 text-white text-sm outline-none box-border focus:border-blue-500 transition-colors"
                    >
                      <option value="USDC">USDC (Solana SPL)</option>
                      <option value="SOL">SOL (Native)</option>
                      <option value="EURC">EURC (Solana SPL)</option>
                    </select>
                  </div>

                  <div className="pt-6 mt-4 border-t border-white/10">
                    <ButtonBase type="submit" $variant="primary" disabled={isPairing} className="w-full h-[46px] text-sm font-semibold">
                      {isPairing ? 'Linking Terminal...' : 'Pair POS Terminal'}
                    </ButtonBase>
                  </div>
                </ModalFormCol>
              </KeypadModalBox>
            </ModalOverlay>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Modal: Virtual POS Keypad Charge */}
      {mounted && typeof document !== 'undefined' && createPortal(
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
        </AnimatePresence>,
        document.body
      )}
    </PageContainer>
  );
}
