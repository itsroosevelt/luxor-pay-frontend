"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  X,
  AlertCircle,
} from "lucide-react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getEarliestTransferDate, getStatementPdfBlob } from "@/lib/transfers-api";

interface MonthOption {
  value: string; // `${year}-${month}` (month is 1-based)
  label: string;
  year: number;
  month: number; // 1-based
}

interface AccountStatementViewerProps {
  merchantWallet: string | null;
  businessName?: string | null;
  email?: string | null;
}

/**
 * Builds the list of statement months to offer.
 * Only completed (closed) months are shown — the current calendar month never
 * appears until it has ended. Adds up to 3 previous months, only as far back
 * as the account's earliest transaction. Returned oldest → newest (left → right).
 */
function buildMonthOptions(earliest: Date | null): MonthOption[] {
  const now = new Date();

  let previousToShow = 0;
  if (earliest) {
    const diffMonths =
      (now.getFullYear() - earliest.getFullYear()) * 12 +
      (now.getMonth() - earliest.getMonth());
    // Never include the open current month (i starts at 1 below).
    previousToShow = Math.max(0, Math.min(3, diffMonths));
  }

  // Build newest-first from closed months only (i = 1 → previous month),
  // then reverse so oldest sits on the left.
  const newestFirst: MonthOption[] = [];
  for (let i = 1; i <= previousToShow; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    newestFirst.push({
      value: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }
  return newestFirst.reverse();
}

export function AccountStatementViewer({}: AccountStatementViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [earliestDate, setEarliestDate] = useState<Date | null>(null);
  const [monthsLoading, setMonthsLoading] = useState(true);
  const monthOptions = useMemo(() => buildMonthOptions(earliestDate), [earliestDate]);
  const [activeOption, setActiveOption] = useState<MonthOption | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Revoke the object URL whenever it changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine how far back statements should be offered based on activity.
  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        if (!cancelled) setMonthsLoading(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const date = await getEarliestTransferDate(token);
        if (!cancelled) setEarliestDate(date);
      } catch {
        if (!cancelled) setEarliestDate(null);
      } finally {
        if (!cancelled) setMonthsLoading(false);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const openStatement = useCallback(async (option: MonthOption) => {
    const user = auth.currentUser;
    setActiveOption(option);
    setError(null);
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    if (!user) {
      setError("Your session could not be identified. Please sign in again.");
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      // Scoped to the authenticated merchant by the backend auth token.
      const blob = await getStatementPdfBlob(token, option.year, option.month);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load the account statement.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeModal = () => {
    setActiveOption(null);
    setError(null);
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const closedMonthsCount = monthOptions.length;

  return (
    <div className="glass-panel overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-white/[0.02] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#34D399]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#34D399]/30 flex items-center justify-center text-[#34D399] flex-shrink-0">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <h2
              className="text-lg font-semibold text-[#EDEDED]"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Account Statements
            </h2>
            <p
              className="text-xs text-gray-400 mt-0.5"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {monthsLoading
                ? "Loading available months…"
                : closedMonthsCount === 0
                  ? "No closed months available yet"
                  : closedMonthsCount === 1
                    ? "Previous closed month available"
                    : `Up to ${closedMonthsCount} previous closed months`}
            </p>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-1 border-t border-white/5">
          <p
            className="text-xs text-gray-500 mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Oldest on the left → newest closed month on the right. Click a card to open the statement.
          </p>

          {monthsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : monthOptions.length === 0 ? (
            <p
              className="text-sm text-gray-400 py-6 text-center"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Statements appear after a calendar month has ended.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {monthOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => openStatement(option)}
                  className="group text-left rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#34D399]/40 transition-all p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[#10B981]/10 border border-[#34D399]/20 flex items-center justify-center text-[#34D399]">
                      <Calendar size={16} />
                    </div>
                  </div>
                  <p
                    className="text-base font-semibold text-[#EDEDED]"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {option.label}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-gray-400 group-hover:text-[#34D399] transition-colors">
                    View statement <ChevronRight size={14} />
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Statement modal — native PDF viewer via iframe blob URL */}
      {activeOption &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-1 md:p-2 text-left">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={closeModal}
            />
            <div className="relative flex flex-col w-[99vw] h-[99vh] md:w-[99vw] md:h-[99vh] max-w-none max-h-none bg-[#0E0E12] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10">
                <div className="min-w-0">
                  <h3
                    className="text-base font-semibold text-[#EDEDED] truncate"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Account Statement
                  </h3>
                  <p className="text-xs text-gray-400">{activeOption.label}</p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 flex flex-col bg-[#121214] p-4 min-h-0">
                {error ? (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm max-w-md">
                      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  </div>
                ) : isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-300">
                    <div className="w-8 h-8 border-2 border-[#34D399] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">Loading statement…</p>
                  </div>
                ) : pdfUrl ? (
                  <iframe
                    title="Account statement preview"
                    src={pdfUrl}
                    className="w-full flex-1 bg-white rounded-xl shadow-lg border-none"
                  />
                ) : null}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
