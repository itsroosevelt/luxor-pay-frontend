"use client";

import React, { useState, useMemo } from "react";
import { Decimal } from "decimal.js";
import { useMerchant } from "@/context/MerchantContext";
import { useGetBalance } from "@/hooks/useGetBalance";
import { useGetTransfers } from "@/hooks/useGetTransfers";
import { useGetPayments } from "@/hooks/useGetPayments";
import { useTokenPrice } from "@/hooks/useTokenPrice";
import { useTreasury } from "@/hooks/useTreasury";
import { OverviewChartView, DataPoint } from "./OverviewChartView";

export function OverviewChartContainer() {
  const { profile } = useMerchant();
  const merchantWallet = profile?.merchantWallet || null;

  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '1Y'>('1W');

  // Network Integration & State Contracts (Rule 7)
  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    errorMessage: balanceErrorMessage,
    refetch: refetchBalance,
  } = useGetBalance(merchantWallet);

  const { vaults } = useTreasury();

  const {
    data: transfersData,
    isLoading: isTransfersLoading,
    isError: isTransfersError,
    errorMessage: transfersErrorMessage,
    refetch: refetchTransfers,
  } = useGetTransfers(100);

  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
    errorMessage: paymentsErrorMessage,
    refetch: refetchPayments,
  } = useGetPayments();

  const {
    data: solPriceData,
    isLoading: isSolPriceLoading,
    isError: isSolPriceError,
    errorMessage: solPriceErrorMessage,
    refetch: refetchSolPrice,
  } = useTokenPrice('SOL');

  const isLoading = isBalanceLoading;
  const isError = isBalanceError;
  const errorMessage = balanceErrorMessage || "Failed to load balance stats";

  const refetch = async () => {
    await Promise.all([refetchBalance(), refetchTransfers(), refetchPayments(), refetchSolPrice()]);
  };

  // Memoized calculation of chart points
  const chartData = useMemo<DataPoint[]>(() => {
    if (!merchantWallet) return [];

    const solPrice = new Decimal(solPriceData ?? 168.42);
    const walletLower = merchantWallet.toLowerCase();

    // 1. Calculate current total ecosystem balance in USD (sub-vaults + main balance)
    let currentTotalBalanceUsd = new Decimal(0);
    if (vaults && vaults.length > 0) {
      const totalVaults = vaults.reduce((acc, v) => acc + (v.usdValue ?? 0), 0);
      currentTotalBalanceUsd = new Decimal(totalVaults);
    } else if (balanceData) {
      const solBalance = new Decimal(balanceData.solBalance || "0");
      currentTotalBalanceUsd = solBalance.mul(solPrice);
      (balanceData.tokens || []).forEach((t) => {
        const amount = new Decimal(t.uiAmount || "0");
        const price = new Decimal(t.usdValue ? t.usdValue / Math.max(1, Number(t.uiAmount)) : 1.0);
        currentTotalBalanceUsd = currentTotalBalanceUsd.plus(amount.mul(price));
      });
    }

    const getTxUsdValue = (tx: any): Decimal => {
      const amount = new Decimal(tx.amount || "0");
      const symbol = tx.symbol || "SOL";
      if (symbol.toUpperCase() === "SOL") {
        return amount.mul(solPrice);
      }
      return amount.mul(new Decimal(1.0));
    };

    const getOrderUsdValue = (order: any): Decimal => {
      const amount = new Decimal(order.amount || "0");
      const currency = order.currency || "USDC";
      if (currency.toUpperCase() === "SOL") {
        return amount.mul(solPrice);
      }
      return amount.mul(new Decimal(1.0));
    };

    const transfers = transfersData?.data || [];
    const payments = paymentsData || [];
    const now = new Date();

    // Helper to calculate balance at a specific cutoff date
    const getBalanceAtDate = (cutoffDate: Date): number => {
      let futureImpacts = new Decimal(0);

      // Revert future outbound/inbound transfers (transfers occurring AFTER cutoffDate)
      transfers.forEach((tx) => {
        if (tx.status !== 'CONFIRMED') return;
        const dateValue = tx.createdAt || tx.confirmedAt;
        if (!dateValue) return;
        const txDate = new Date(dateValue);
        if (Number.isNaN(txDate.getTime())) return;

        if (txDate > cutoffDate) {
          const isSent = (tx.fromWallet || "").toLowerCase() === walletLower;
          const isReceived = (tx.toWallet || "").toLowerCase() === walletLower;
          const txValue = getTxUsdValue(tx);

          if (isSent) {
            futureImpacts = futureImpacts.minus(txValue);
          } else if (isReceived) {
            futureImpacts = futureImpacts.plus(txValue);
          }
        }
      });

      // Revert future incoming payment orders (POS/Links)
      payments.forEach((order) => {
        const dateValue = order.confirmedAt || order.createdAt;
        if (!dateValue) return;
        const orderDate = new Date(dateValue);
        if (Number.isNaN(orderDate.getTime())) return;

        if (orderDate > cutoffDate) {
          const isConfirmed = order.status === 'confirmed';
          if (isConfirmed) {
            const orderValue = getOrderUsdValue(order);
            futureImpacts = futureImpacts.plus(orderValue);
          }
        }
      });

      const balance = currentTotalBalanceUsd.minus(futureImpacts);
      return balance.isNegative() ? 0 : balance.toNumber();
    };

    // 3. Generate period points based on timeframe
    const points: DataPoint[] = [];

    if (timeframe === '1W') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);

        const isToday = i === 0;
        const cutoff = isToday ? now : new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        const value = getBalanceAtDate(cutoff);

        points.push({ label, value, dateStr });
      }
    } else if (timeframe === '1M') {
      for (let i = 14; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i * 2);

        const isToday = i === 0;
        const cutoff = isToday ? now : new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        const value = getBalanceAtDate(cutoff);

        points.push({ label, value, dateStr });
      }
    } else if (timeframe === '1Y') {
      for (let m = 11; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const isCurrentMonth = m === 0;
        const cutoff = isCurrentMonth ? now : new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

        const label = d.toLocaleDateString('en-US', { month: 'short' });
        const dateStr = `${cutoff.getDate()}/${cutoff.getMonth() + 1}/${cutoff.getFullYear()}`;
        const value = getBalanceAtDate(cutoff);

        points.push({ label, value, dateStr });
      }
    }

    return points;
  }, [balanceData, merchantWallet, transfersData, paymentsData, solPriceData, timeframe, profile, vaults]);

  if (!merchantWallet) {
    return null;
  }

  return (
    <OverviewChartView
      data={chartData}
      timeframe={timeframe}
      setTimeframe={setTimeframe}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      refetch={refetch}
    />
  );
}