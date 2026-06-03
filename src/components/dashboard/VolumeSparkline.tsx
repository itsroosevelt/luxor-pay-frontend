'use client';

import { cn } from '@/lib/cn';
import { useId } from 'react';

interface VolumeSparklineProps {
  data: number[];
  height?: number;
  className?: string;
  emptyLabel?: string;
}

function buildPoints(data: number[], width: number, height: number): string {
  if (data.length === 0) return `0,${height} ${width},${height}`;
  const max = Math.max(...data, 0);
  const minY = height * 0.92;
  if (max === 0) {
    return `0,${minY} ${width},${minY}`;
  }
  return data
    .map((v, i) => {
      const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * width;
      const y = height - (v / max) * (height * 0.85) - height * 0.05;
      return `${x},${y}`;
    })
    .join(' ');
}

export function VolumeSparkline({
  data,
  height = 200,
  className,
  emptyLabel = 'No volume in this period',
}: VolumeSparklineProps) {
  const gradientId = useId();
  const width = 400;
  const viewHeight = 100;
  const points = buildPoints(data, width, viewHeight);
  const hasData = data.some((v) => v > 0);
  const polygonPoints = `0,${viewHeight} ${points} ${width},${viewHeight}`;

  return (
    <div className={cn('relative w-full', className)} style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${viewHeight}`}
        className="w-full h-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={hasData ? 'Volume over time' : emptyLabel}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(153, 69, 255, 0.2)" />
            <stop offset="100%" stopColor="rgba(153, 69, 255, 0)" />
          </linearGradient>
        </defs>
        {hasData && (
          <polygon fill={`url(#${gradientId})`} points={polygonPoints} />
        )}
        <polyline
          fill="none"
          stroke={hasData ? '#9945ff' : 'rgba(255,255,255,0.2)'}
          strokeWidth="2"
          strokeDasharray={hasData ? undefined : '4 4'}
          points={points}
        />
      </svg>
      {!hasData && (
        <p className="absolute bottom-2 left-0 text-xs text-[var(--dash-muted)]">{emptyLabel}</p>
      )}
    </div>
  );
}
