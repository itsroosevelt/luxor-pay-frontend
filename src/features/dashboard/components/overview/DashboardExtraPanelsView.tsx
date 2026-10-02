import React from "react";
import styled from "styled-components";
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, TrendingUp, AlertCircle } from "lucide-react";
import { TokenIcon } from "@/components/ui/TokenIcon";

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
  margin: 12px 0 6px 0;

  .month-name {
    color: rgba(255, 255, 255, 0.4);
    font-weight: 400;
  }

  .day-number {
    color: rgba(255, 255, 255, 0.85);
    font-weight: 600;
  }
`;

const renderFormattedDateHeader = (dateKey: string) => {
  const match = dateKey.match(/^([A-Za-z]+)\s*(\d+)?$/);
  if (match) {
    const month = match[1];
    const day = match[2];
    return (
      <>
        <span className="month-name">{month}</span>
        {day && <span className="day-number"> {day}</span>}
      </>
    );
  }
  return dateKey;
};

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

const FlowIconBadge = styled.div<{ $visualType: 'in' | 'out' | 'failed' }>`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;

  ${({ $visualType }) =>
    $visualType === 'out'
      ? `
    background: var(--lx-danger-soft, rgba(248, 113, 113, 0.12));
    border: 1px solid var(--lx-danger-border, rgba(248, 113, 113, 0.2));
    color: var(--lx-danger, #F87171);
  `
      : $visualType === 'failed'
      ? `
    background: var(--lx-warning-soft, rgba(234, 179, 8, 0.12));
    border: 1px solid var(--lx-warning-border, rgba(234, 179, 8, 0.2));
    color: var(--lx-warning, #EAB308);
  `
      : `
    background: var(--lx-success-soft, rgba(16, 185, 129, 0.12));
    border: 1px solid var(--lx-success-border, rgba(16, 185, 129, 0.2));
    color: var(--lx-success, #34D399);
  `}
`;

const FlowAmount = styled.span`
  font-family: monospace;
  font-size: 13px;
  font-weight: 500;
  color: #FFFFFF;
`;

const ScrollableFlowContainer = styled.div`
  max-height: 310px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 6px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 9999px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 9999px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
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
  status?: string;
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

          <ScrollableFlowContainer>
            {flows.map((group) => (
              <div key={group.dateKey}>
                <DateHeader>{renderFormattedDateHeader(group.dateKey)}</DateHeader>
                <FlowGrid>
                  {group.items.map((flow) => {
                    const statusUpper = (flow.status || '').toUpperCase();
                    const isFailed = statusUpper === 'FAILED' || statusUpper === 'REJECTED' || statusUpper === 'ERROR' || statusUpper === 'REVERTED' || statusUpper === 'CANCELLED';
                    const visualType: 'in' | 'out' | 'failed' = isFailed ? 'failed' : flow.type === 'Send' ? 'out' : 'in';

                    return (
                      <FlowRow key={flow.id}>
                        <BadgeAndName>
                          <FlowIconBadge $visualType={visualType}>
                            {visualType === 'failed' ? (
                              <AlertCircle size={14} />
                            ) : visualType === 'out' ? (
                              <ArrowUpRight size={14} />
                            ) : (
                              <ArrowDownLeft size={14} />
                            )}
                          </FlowIconBadge>
                          <FlowCell>
                            <FlowTitle>{flow.type}{isFailed ? ' (Failed)' : ''}</FlowTitle>
                            <FlowSubtitle>Type</FlowSubtitle>
                          </FlowCell>
                        </BadgeAndName>

                        <BadgeAndName>
                          <TokenIcon symbol={flow.symbol} size={24} />
                          <FlowCell>
                            <FlowAmount>
                              {flow.type === 'Send' ? '-' : '+'}{flow.amount}{' '}
                              <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontWeight: 400, marginLeft: '4px' }}>
                                {flow.symbol}
                              </span>
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
                  );
                })}
                </FlowGrid>
              </div>
            ))}
          </ScrollableFlowContainer>
        </SectionCard>
      )}
    </Container>
  );
}
