"use client";

import React, { useMemo } from "react";
import { useMerchant } from "@/context/MerchantContext";
import { useGetTransfers } from "@/hooks/useGetTransfers";
import { useGetPayments } from "@/hooks/useGetPayments";
import { DashboardExtraPanelsView, OutflowInflow } from "./DashboardExtraPanelsView";

export function DashboardExtraPanelsContainer() {
  const { profile } = useMerchant();
  const merchantWallet = profile?.merchantWallet || null;

  // Real-time state integrations (Rule 7)
  const { data: transfersData } = useGetTransfers(10);
  const { data: paymentsData } = useGetPayments();

  // Consolidated Real-time Inflows & Outflows Timeline
  const groupedFlows = useMemo(() => {
    if (!merchantWallet) return [];

    const walletLower = merchantWallet.toLowerCase();
    const list: OutflowInflow[] = [];

    // Process Outbound / Inbound transfers (Transaction)
    (transfersData?.data || []).forEach((tx) => {
      const isSent = (tx.fromWallet || "").toLowerCase() === walletLower;
      const isReceived = (tx.toWallet || "").toLowerCase() === walletLower;
      const dateVal = tx.createdAt || tx.confirmedAt;
      if (!isSent && !isReceived) return;
      if (!dateVal) return;

      const dateObj = new Date(dateVal);
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const dateKey = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      const party = isSent 
        ? (tx.toWallet ? `${tx.toWallet.slice(0, 4)}...${tx.toWallet.slice(-4)}` : "External Address")
        : (tx.fromWallet ? `${tx.fromWallet.slice(0, 4)}...${tx.fromWallet.slice(-4)}` : "External Address");

      list.push({
        id: tx.id,
        type: isSent ? 'Send' : 'Receive',
        amount: tx.amount || "0.00",
        symbol: tx.symbol || "SOL",
        party,
        timeStr,
        dateKey,
        status: tx.status,
      });
    });

    // Process Incoming Payments from Links/POS (PaymentOrder)
    (paymentsData || []).forEach((order) => {
      if (order.status !== 'confirmed') return;
      const dateVal = order.confirmedAt || order.createdAt;
      if (!dateVal) return;

      const dateObj = new Date(dateVal);
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const dateKey = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      const party = order.reference ? `${order.reference.slice(0, 4)}...${order.reference.slice(-4)}` : "POS/Checkout";

      list.push({
        id: order.reference,
        type: 'Receive',
        amount: order.amount.toString(),
        symbol: order.currency || 'USDC',
        party,
        timeStr,
        dateKey,
      });
    });

    // Sort all inflows and outflows by date/time newest first
    list.sort((a, b) => {
      const timeA = new Date(a.dateKey + " " + a.timeStr).getTime();
      const timeB = new Date(b.dateKey + " " + b.timeStr).getTime();
      return timeB - timeA;
    });

    // Group items by dateKey (e.g. "July 11")
    const groups: { dateKey: string; items: OutflowInflow[] }[] = [];
    const dateMap = new Map<string, OutflowInflow[]>();

    list.forEach((item) => {
      if (!dateMap.has(item.dateKey)) {
        dateMap.set(item.dateKey, []);
      }
      dateMap.get(item.dateKey)!.push(item);
    });

    dateMap.forEach((items, dateKey) => {
      groups.push({ dateKey, items });
    });

    return groups;
  }, [merchantWallet, transfersData, paymentsData]);

  if (!merchantWallet) {
    return null;
  }

  return (
    <DashboardExtraPanelsView
      flows={groupedFlows}
    />
  );
}
