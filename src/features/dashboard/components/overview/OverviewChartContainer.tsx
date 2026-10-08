"use client";

import React, { useMemo, useState } from "react";
import { useMerchant } from "@/features/merchant/context/MerchantContext";
import { useBalanceHistory } from "@/features/treasury/hooks/useBalanceHistory";
import { OverviewChartView, DataPoint } from "@/features/dashboard/components/overview/OverviewChartView";

type Timeframe = '1W' | '1M' | '1Y';

function labelOf(iso: string, timeframe: Timeframe): string {
  const d = new Date(iso);
  return timeframe === '1Y'
    ? d.toLocaleDateString('en-US', { month: 'short' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function OverviewChartContainer() {
  const { profile } = useMerchant();
  const merchantWallet = profile?.merchantWallet || null;
  const [timeframe, setTimeframe] = useState<Timeframe>('1W');

  const { history, isLoading, error, refetch } = useBalanceHistory(timeframe);

  const chartData = useMemo<DataPoint[]>(
    () =>
      (history?.points ?? []).map((p) => {
        const d = new Date(p.t);
        return { label: labelOf(p.t, timeframe), value: p.usd, dateStr: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}` };
      }),
    [history, timeframe],
  );

  if (!merchantWallet) return null;

  return (
    <OverviewChartView
      data={chartData}
      timeframe={timeframe}
      setTimeframe={setTimeframe}
      isLoading={isLoading}
      isError={!!error && !history}
      errorMessage={error || "Failed to load balance history"}
      refetch={refetch}
    />
  );
}
