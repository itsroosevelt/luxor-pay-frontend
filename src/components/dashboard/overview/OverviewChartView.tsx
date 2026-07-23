"use client";

import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { ChevronDown, AlertCircle, RefreshCw } from "lucide-react";

const Container = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    border-radius: 32px;
    padding: 24px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 2;
`;

const DropdownButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px; /* Requisite Rule 3: buttons must be 9999px */
  padding: 8px 16px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const TimeframeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const TimeframeTab = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.15)' : 'transparent')};
  border-radius: 8px;
  padding: 6px 12px;
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)')};
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const ChartWrapper = styled.div`
  flex: 1;
  min-height: 220px;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const TooltipBox = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  left: ${({ $x }) => `${$x}px`};
  top: ${({ $y }) => `${$y}px`};
  transform: translate(-50%, -120%);
  background: rgba(20, 20, 25, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  border-radius: 14px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  pointer-events: none;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);
  z-index: 10;
  white-space: nowrap;
`;

const TooltipLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
`;

const TooltipValue = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
`;

const TooltipDate = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  height: 100%;
  min-height: 200px;
  text-align: center;
  color: #FCA5A5;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
`;

const RetryButton = styled.button`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #FCA5A5;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  border-radius: 9999px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #FCA5A5;
    outline-offset: 2px;
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  height: 100%;
  min-height: 220px;
  justify-content: space-between;
`;

const SkeletonBox = styled.div<{ $width?: string; $height?: string; $borderRadius?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '24px'};
  border-radius: ${({ $borderRadius }) => $borderRadius || '8px'};
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.05) 25%, rgba(96, 165, 250, 0.15) 50%, rgba(37, 99, 235, 0.05) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 2.5s infinite;
`;

export interface DataPoint {
  label: string;
  value: number;
  dateStr: string;
}

interface OverviewChartViewProps {
  data: DataPoint[];
  timeframe: '1W' | '1M' | '1Y';
  setTimeframe: (tf: '1W' | '1M' | '1Y') => void;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch?: () => void;
}

export function OverviewChartView({
  data,
  timeframe,
  setTimeframe,
  isLoading,
  isError,
  errorMessage,
  refetch,
}: OverviewChartViewProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; pt: DataPoint } | null>(null);

  // Math dimensions
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingTop = 25;
  const paddingBottom = 25;
  const paddingLeft = 55; // Keep spacious enough for dynamic balances (e.g. $1000.00)
  const paddingRight = 20;

  // Compute dynamic scale limits
  const values = data.map((pt) => pt.value);
  const minPtValue = values.length > 0 ? Math.min(...values) : 0;
  const maxPtValue = values.length > 0 ? Math.max(...values) : 0;
  const range = maxPtValue - minPtValue;

  let minVal = minPtValue - range * 0.1;
  let maxVal = maxPtValue + range * 0.1;

  // Fallback for flat charts
  if (range === 0 || minVal === maxVal) {
    minVal = Math.max(0, minPtValue - 10);
    maxVal = minPtValue + 10;
  }
  if (minVal < 0) minVal = 0;

  // Build grid lines
  const step = (maxVal - minVal) / 3;
  const yLines = [minVal, minVal + step, minVal + step * 2, maxVal];

  // Map to SVG coordinates
  const points = data.map((pt, idx) => {
    const x = data.length > 1
      ? (idx / (data.length - 1)) * (svgWidth - paddingLeft - paddingRight) + paddingLeft
      : paddingLeft;
    const normalizedVal = maxVal !== minVal ? Math.max(0, Math.min(1, (pt.value - minVal) / (maxVal - minVal))) : 0.5;
    const y = svgHeight - paddingBottom - normalizedVal * (svgHeight - paddingTop - paddingBottom);
    return { x, y, pt };
  });

  const pathD = points.reduce((acc, { x, y }, idx) => {
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "");

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`
    : "";

  return (
    <Container>
      <HeaderRow>
        <DropdownButton type="button">
          <span>Total</span>
          <ChevronDown size={14} style={{ opacity: 0.6 }} />
        </DropdownButton>

        <TimeframeContainer>
          {(['1W', '1M', '1Y'] as const).map((tf) => (
            <TimeframeTab
              key={tf}
              type="button"
              $active={timeframe === tf}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </TimeframeTab>
          ))}
        </TimeframeContainer>
      </HeaderRow>

      <ChartWrapper>
        {isLoading ? (
          <SkeletonWrapper>
            <SkeletonBox $height="130px" $borderRadius="16px" />
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <SkeletonBox $width="50px" $height="12px" />
              <SkeletonBox $width="50px" $height="12px" />
              <SkeletonBox $width="50px" $height="12px" />
              <SkeletonBox $width="50px" $height="12px" />
              <SkeletonBox $width="50px" $height="12px" />
            </div>
          </SkeletonWrapper>
        ) : isError ? (
          <ErrorContainer>
            <AlertCircle size={24} />
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Failed to load wallet stats</p>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>{errorMessage || "Unknown error occurred"}</p>
            </div>
            {refetch && (
              <RetryButton type="button" onClick={refetch}>
                <RefreshCw size={12} />
                <span>Retry</span>
              </RetryButton>
            )}
          </ErrorContainer>
        ) : (
          <>
            {hoveredPoint && (
              <TooltipBox $x={hoveredPoint.x} $y={hoveredPoint.y}>
                <TooltipLabel>Total Balance</TooltipLabel>
                <TooltipValue>${hoveredPoint.pt.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TooltipValue>
                <TooltipDate>{hoveredPoint.pt.dateStr}</TooltipDate>
              </TooltipBox>
            )}

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              style={{ maxHeight: '200px' }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>

              {/* Y-Axis Grid lines and Labels */}
              {yLines.map((val, idx) => {
                const normalizedVal = maxVal !== minVal ? (val - minVal) / (maxVal - minVal) : 0.5;
                const y = svgHeight - paddingBottom - normalizedVal * (svgHeight - paddingTop - paddingBottom);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      fill="rgba(255, 255, 255, 0.35)"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="Montserrat, sans-serif"
                    >
                      ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              {areaD && <path d={areaD} fill="url(#chartGradient)" />}

              {/* Line stroke */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Data Points */}
              {points.map(({ x, y, pt }, idx) => {
                const isHovered = hoveredPoint?.pt.label === pt.label;
                return (
                  <g key={idx}>
                    {/* Larger transparent hover capture circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint({ x, y, pt })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* Styled rendering circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? "#FFFFFF" : "#60A5FA"}
                      stroke="#0A0A0A"
                      strokeWidth="2"
                      pointerEvents="none"
                      style={{ transition: 'all 0.2s ease' }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* X-Axis Labels */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: `${paddingLeft}px`,
              paddingRight: `${paddingRight}px`,
              marginTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '8px'
            }}>
              {data.map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </>
        )}
      </ChartWrapper>
    </Container>
  );
}
