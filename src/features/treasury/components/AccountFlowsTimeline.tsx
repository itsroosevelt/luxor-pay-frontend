'use client';

import {
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { TokenIcon } from '@/components/ui/TokenIcon';
import { helperShort, type AccountFlow } from './treasury-utils';
import {
  EmptyStateContainer,
  TimelineActivityCard,
  TimelineItem,
} from './treasury.styles';

interface AccountFlowsTimelineProps {
  flows: AccountFlow[];
  isPrivacyMode: boolean;
}

/** "Inflows and Outflows" timeline of one treasury account. */
export function AccountFlowsTimeline({ flows, isPrivacyMode }: AccountFlowsTimelineProps) {
  return flows.length === 0 ? (
      <EmptyStateContainer style={{ marginTop: 16 }}>
        No inflows or outflows recorded for this account.
      </EmptyStateContainer>
    ) : (
      <TimelineActivityCard>
        {flows.map((f) => (
          <TimelineItem key={f.id}>
            {/* Left: Direction Icon Badge (COLORED) & Title/Subtitle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: f.direction === 'in' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                  border: f.direction === 'in' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {f.direction === 'in' ? (
                  <ArrowDownLeft size={18} color="#10B981" />
                ) : (
                  <ArrowUpRight size={18} color="#EF4444" />
                )}
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 500, fontSize: 14, color: '#FFFFFF' }}>
                  {f.title}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.45)', marginTop: 2 }}>
                  {f.subtitle}
                </div>
              </div>
            </div>

            {/* Right: Numbers/Amount at the END (Right Side) in clean white text + Token Icon & Status */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#EDEDED',
                  }}
                >
                  {isPrivacyMode ? '•••' : `${f.direction === 'in' ? '+' : '−'}${f.amount} ${f.symbol}`}
                </div>
                <TokenIcon symbol={f.symbol} size={20} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {f.usdValue && !isPrivacyMode && (
                  <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.45)' }}>
                    {f.usdValue}
                  </span>
                )}
                {f.counterparty && (
                  <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'monospace' }}>
                    {helperShort(f.counterparty)}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    letterSpacing: '0.05em',
                  }}
                >
                  CONFIRMED
                </span>
              </div>
            </div>
          </TimelineItem>
        ))}
      </TimelineActivityCard>
  );
}
