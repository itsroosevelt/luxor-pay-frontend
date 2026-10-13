'use client';

import {
  PageContainer,
  ActionPillButton,
} from './treasury.styles';

/** Placeholder shown while the treasury loads for the first time. */
export function TreasuryLoadingSkeleton() {
  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 140, height: 28, borderRadius: 8, background: 'rgba(255, 255, 255, 0.05)' }} />
        <div style={{ width: 100, height: 36, borderRadius: 9999, background: 'rgba(255, 255, 255, 0.05)' }} />
      </div>
      <div style={{ width: 220, height: 48, borderRadius: 12, background: 'rgba(255, 255, 255, 0.06)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
        <div style={{ height: 80, borderRadius: 16, background: 'rgba(255, 255, 255, 0.04)' }} />
        <div style={{ height: 80, borderRadius: 16, background: 'rgba(255, 255, 255, 0.04)' }} />
        <div style={{ height: 80, borderRadius: 16, background: 'rgba(255, 255, 255, 0.04)' }} />
      </div>
      <div style={{ width: '100%', height: 240, borderRadius: 24, background: 'rgba(255, 255, 255, 0.03)' }} />
    </PageContainer>
  );
}

interface TreasuryLoadErrorProps {
  message: string | null;
  onRetry: () => void;
}

/** First load failed and there is nothing real to show: explain and offer a retry. */
export function TreasuryLoadError({ message, onRetry }: TreasuryLoadErrorProps) {
  return (
    <PageContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 32 }}>
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, padding: 24, borderRadius: 20,
          background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, color: '#FFFFFF' }}>Failed to load treasury</div>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
          {message ?? 'Unknown error'}
        </div>
        <ActionPillButton type="button" $variant="secondary" onClick={onRetry}>
          Retry
        </ActionPillButton>
      </div>
    </PageContainer>
  );
}
