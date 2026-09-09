"use client";

import React, { useState, useMemo } from "react";
import { Decimal } from "decimal.js";
import { useMerchant } from "@/context/MerchantContext";
import { useGetBalance } from "@/hooks/useGetBalance";
import { useGetTransfers } from "@/hooks/useGetTransfers";
import { useGetPayments } from "@/hooks/useGetPayments";
import { useTokenPrice } from "@/hooks/useTokenPrice";
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

  const isLoading = isBalanceLoading || isTransfersLoading || isPaymentsLoading || isSolPriceLoading;
  const isError = isBalanceError || isTransfersError || isPaymentsError || isSolPriceError;
  const errorMessage = balanceErrorMessage || transfersErrorMessage || paymentsErrorMessage || solPriceErrorMessage || "Failed to load balance stats";

  const refetch = async () => {
    await Promise.all([refetchBalance(), refetchTransfers(), refetchPayments(), refetchSolPrice()]);
  };

  // Memoized calculation of chart points
  const chartData = useMemo<DataPoint[]>(() => {
    if (!balanceData || !merchantWallet) return [];

    const solPrice = new Decimal(solPriceData ?? 168.42);
    const walletLower = merchantWallet.toLowerCase();

    // 1. Calculate current total balance in USD (Rule 8: Cero Flotantes precision math)
    const solBalance = new Decimal(balanceData.solBalance || "0");
    const solValueUsd = solBalance.mul(solPrice);

    let currentTotalBalanceUsd = new Decimal(solValueUsd);
    (balanceData.tokens || []).forEach((t) => {
      const amount = new Decimal(t.uiAmount || "0");
      const isStable = t.symbol === "USDC" || t.symbol === "USDT" || t.symbol === "EURC" || t.symbol === "PYUSD" || t.symbol === "LXR";
      const price = isStable ? new Decimal(1.0) : new Decimal(1.0); // Assume $1.0 default for non-sol tokens on sandbox
      currentTotalBalanceUsd = currentTotalBalanceUsd.plus(amount.mul(price));
    });

    const getTxUsdValue = (tx: any): Decimal => {
      const amount = new Decimal(tx.amount || "0");
      const symbol = tx.symbol || "SOL";
      if (symbol.toUpperCase() === "SOL") {
        return amount.mul(solPrice);
      }
      return amount.mul(new Decimal(1.0)); // Stablecoins & others default 1:1 on sandbox
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

    // 2. Determine earliest date of account activity
    const profileCreatedAt = profile?.createdAt ? new Date(profile.createdAt) : null;
    let earliestDate = now;
    if (profileCreatedAt && !Number.isNaN(profileCreatedAt.getTime())) {
      earliestDate = profileCreatedAt;
    }

    transfers.forEach((tx) => {
      if (tx.status !== 'CONFIRMED') return;
      const dateVal = tx.createdAt || tx.confirmedAt;
      if (!dateVal) return;
      const txDate = new Date(dateVal);
      if (!Number.isNaN(txDate.getTime()) && txDate < earliestDate) {
        earliestDate = txDate;
      }
    });

    payments.forEach((order) => {
      const isConfirmed = order.status === 'confirmed';
      if (!isConfirmed) return;
      const dateVal = order.confirmedAt || order.createdAt;
      if (!dateVal) return;
      const orderDate = new Date(dateVal);
      if (!Number.isNaN(orderDate.getTime()) && orderDate < earliestDate) {
        earliestDate = orderDate;
      }
    });

    // Helper to calculate balance at a specific cutoff date
    const getBalanceAtDate = (cutoffDate: Date): number => {
      // Zero Base: if cutoff is before the earliest account date, balance was 0
      if (cutoffDate < earliestDate) {
        return 0;
      }

      let futureImpacts = new Decimal(0);

      // Revert future outbound/inbound transfers
      transfers.forEach((tx) => {
        if (tx.status !== 'CONFIRMED') return;
        const dateValue = tx.createdAt || tx.confirmedAt;
        if (!dateValue) return;
        const txDate = new Date(dateValue);
        if (Number.isNaN(txDate.getTime())) return;

        // If transaction occurred AFTER the cutoff date, reverse its impact
        if (txDate > cutoffDate) {
          const isSent = (tx.fromWallet || "").toLowerCase() === walletLower;
          const isReceived = (tx.toWallet || "").toLowerCase() === walletLower;
          const txValue = getTxUsdValue(tx);

          if (isSent) {
            // Sent in the future: balance was higher in the past before sending it
            futureImpacts = futureImpacts.minus(txValue);
          } else if (isReceived) {
            // Received in the future: balance was lower in the past before receiving it
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
          // Only confirmed/paid orders affect the wallet balance
          const isConfirmed = order.status === 'confirmed';
          if (isConfirmed) {
            const orderValue = getOrderUsdValue(order);
            // Received in the future: balance was lower in the past before receiving it
            futureImpacts = futureImpacts.plus(orderValue);
          }
        }
      });

      const balance = currentTotalBalanceUsd.minus(futureImpacts);
      return balance.isNegative() ? 0 : balance.toNumber();
    };

    // 3. Generate period points based on timeframe and lifespan
    const points: DataPoint[] = [];

    if (timeframe === '1W') {
      // exactly 7 daily points: from 6 days ago up to now (today)
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
      // exactly 15 points spaced every 2 days: from 28 days ago up to now (today)
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
      // strictly one point per calendar month from the earliest account month up to today (max 12 months)
      const startYear = earliestDate.getFullYear();
      const startMonth = earliestDate.getMonth();
      const endYear = now.getFullYear();
      const endMonth = now.getMonth();

      let totalMonthsDifference = (endYear - startYear) * 12 + (endMonth - startMonth);
      
      let startIterYear = startYear;
      let startIterMonth = startMonth;
      if (totalMonthsDifference > 11) {
        const limitDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        startIterYear = limitDate.getFullYear();
        startIterMonth = limitDate.getMonth();
        totalMonthsDifference = 11;
      }

      for (let m = 0; m <= totalMonthsDifference; m++) {
        const d = new Date(startIterYear, startIterMonth + m, 1);
        const isCurrentMonth = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();

        let cutoff: Date;
        if (isCurrentMonth) {
          cutoff = now;
        } else {
          cutoff = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const dateStr = isCurrentMonth
          ? `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
          : `${cutoff.getDate()}/${cutoff.getMonth() + 1}/${cutoff.getFullYear()}`;
        
        const value = getBalanceAtDate(cutoff);

        points.push({ label, value, dateStr });
      }
    }

    return points;
  }, [balanceData, merchantWallet, transfersData, paymentsData, solPriceData, timeframe, profile]);

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
