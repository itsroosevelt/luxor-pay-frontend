"use client";

import React from "react";
import styled from "styled-components";
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, TrendingUp } from "lucide-react";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const SectionCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 768px) {
    border-radius: 32px;
    padding: 24px;
  }
`;

const SectionTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BadgeAndName = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TokenCircle = styled.span<{ $symbol?: string }>`
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: ${({ $symbol }) =>
    $symbol === 'SOL'
      ? 'linear-gradient(135deg, #14F195, #9945FF)'
      : 'linear-gradient(135deg, #2775CA, #1E508F)'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: 8px;
  font-weight: 700;
  color: #FFFFFF;
`;

// ── INFLOWS & OUTFLOWS STYLES ──────────────────────────────────────────────
const DateHeader = styled.h4`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  margin: 12px 0 6px 0;
`;

const FlowGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FlowRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`;

const FlowCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FlowTitle = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #FFFFFF;
`;

const FlowSubtitle = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: capitalize;
`;

const COLOR_SENT = "#EF4444";
const COLOR_RECEIVED = "#10B981";

const FlowIconBadge = styled.div<{ $type: 'in' | 'out' }>`
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: ${({ $type }) => ($type === 'in' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)')};
  color: ${({ $type }) => ($type === 'in' ? COLOR_RECEIVED : COLOR_SENT)};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const FlowAmount = styled.span<{ $type: 'in' | 'out' }>`
  font-family: monospace;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $type }) => ($type === 'in' ? COLOR_RECEIVED : COLOR_SENT)};
`;

const FlowAddress = styled.span`
  font-family: monospace;
  font-size: 12px;
  color: #EDEDED;
`;

const FlowTime = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

export interface OutflowInflow {
  id: string;
  type: 'Send' | 'Receive';
  amount: string;
  symbol: string;
  party: string;
  timeStr: string;
  dateKey: string;
}

interface DashboardExtraPanelsViewProps {
  flows: { dateKey: string; items: OutflowInflow[] }[];
}

export function DashboardExtraPanelsView({ flows }: DashboardExtraPanelsViewProps) {
  return (
    <Container>
      {/* ── SECTION: INFLOWS AND OUTFLOWS ── */}
      {flows.length > 0 && (
        <SectionCard>
          <SectionTitle>
            <TrendingUp size={16} className="text-blue-400" />
            <span>Inflows and Outflows</span>
          </SectionTitle>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {flows.map((group) => (
              <div key={group.dateKey}>
                <DateHeader>{group.dateKey}</DateHeader>
                <FlowGrid>
                  {group.items.map((flow) => (
                    <FlowRow key={flow.id}>
                      <BadgeAndName>
                        <FlowIconBadge $type={flow.type === 'Send' ? 'out' : 'in'}>
                          {flow.type === 'Send' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        </FlowIconBadge>
                        <FlowCell>
                          <FlowTitle>{flow.type}</FlowTitle>
                          <FlowSubtitle>Type</FlowSubtitle>
                        </FlowCell>
                      </BadgeAndName>

                      <BadgeAndName>
                        <TokenCircle $symbol={flow.symbol}>
                          {flow.symbol.slice(0, 2)}
                        </TokenCircle>
                        <FlowCell>
                          <FlowAmount $type={flow.type === 'Send' ? 'out' : 'in'}>
                            {flow.type === 'Send' ? '-' : '+'}{flow.amount} {flow.symbol}
                          </FlowAmount>
                          <FlowSubtitle>Amount</FlowSubtitle>
                        </FlowCell>
                      </BadgeAndName>

                      <FlowCell>
                        <FlowAddress>{flow.party}</FlowAddress>
                        <FlowSubtitle>{flow.type === 'Send' ? 'Recipient' : 'Sender'}</FlowSubtitle>
                      </FlowCell>

                      <FlowCell>
                        <FlowTime>{flow.timeStr}</FlowTime>
                        <FlowSubtitle>Time</FlowSubtitle>
                      </FlowCell>
                    </FlowRow>
                  ))}
                </FlowGrid>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </Container>
  );
}
