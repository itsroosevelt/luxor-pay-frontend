'use client';

import { PaymentRequest } from '@/features/payment-requests/api/payment-requests-api';
import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { STATUS_CONFIG } from './request-format';

export const BadgeSpan = styled.span<{ $color: string; $bg: string; $border: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
  background: ${({ $bg }) => $bg};
  border: 1px solid ${({ $border }) => $border};
`;

export const EmptyStateWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 48px 0;
  gap: 12px;
  text-align: left;
`;

export const EmptyStateIconCircle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--lx-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lx-text-muted);
`;

export const EmptyStateText = styled.p`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: var(--lx-text-muted);
  margin: 0;
  text-align: left;
`;

export const SkeletonCardBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  border: 1px solid var(--lx-border);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SkeletonBar = styled.div<{ $width: number }>`
  height: 14px;
  width: ${({ $width }) => $width}%;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.08) 25%, rgba(255, 255, 255, 0.15) 50%, rgba(16, 185, 129, 0.08) 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
`;

export function StatusBadge({ status }: { status: PaymentRequest['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const { Icon } = cfg;
  return (
    <BadgeSpan $color={cfg.color} $bg={cfg.bg} $border={cfg.border}>
      <Icon size={11} /> {cfg.label}
    </BadgeSpan>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <EmptyStateWrapper
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
    >
      <EmptyStateIconCircle>
        <Inbox size={24} />
      </EmptyStateIconCircle>
      <EmptyStateText>
        {label}
      </EmptyStateText>
    </EmptyStateWrapper>
  );
}

export function SkeletonCard() {
  return (
    <SkeletonCardBox>
      {[80, 60, 40].map((w, i) => (
        <SkeletonBar key={i} $width={w} />
      ))}
    </SkeletonCardBox>
  );
}

export function ModalRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>{icon}</span>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

export function MetaItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>{icon}</span>
      <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}:
      </span>
      {children}
    </div>
  );
}

export function ActionButton({
  children, onClick, disabled, icon, variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  variant: 'primary' | 'ghost' | 'danger';
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: '#FFFFFF', color: '#000000', border: 'none' },
    ghost:   { background: 'rgba(255, 255, 255,0.06)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255,0.15)' },
    danger:  { background: 'rgba(255, 255, 255,0.06)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255,0.15)' },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '7px 14px', borderRadius: '9999px',
        fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'all 0.2s',
      }}
    >
      {icon}{children}
    </button>
  );
}
